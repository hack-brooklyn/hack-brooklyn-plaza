package org.hackbrooklyn.plaza.service.impl;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Hex;
import org.hackbrooklyn.plaza.dto.NewsletterSubscriptionDTO;
import org.hackbrooklyn.plaza.exception.DataConflictException;
import org.hackbrooklyn.plaza.model.RegisteredInterestApplicant;
import org.hackbrooklyn.plaza.repository.RegisteredInterestApplicantRepository;
import org.hackbrooklyn.plaza.service.NewsletterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class NewsletterServiceImpl implements NewsletterService {

    @Value("${PRIORITY_APPLICATIONS_ACTIVE}")
    private boolean PRIORITY_APPLICATIONS_ACTIVE;

    @Value("${MAILCHIMP_API_KEY}")
    private String MAILCHIMP_API_KEY;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;  // TODO: Replace RestTemplate with Spring Reactive WebClient
    private final RegisteredInterestApplicantRepository registeredInterestApplicantRepository;
    private final String mcMembersEndpoint;

    @Autowired
    public NewsletterServiceImpl(Environment environment, ObjectMapper objectMapper, RestTemplate restTemplate, RegisteredInterestApplicantRepository registeredInterestApplicantRepository) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
        this.registeredInterestApplicantRepository = registeredInterestApplicantRepository;
        String mcApiRoot = String.format("https://%s.api.mailchimp.com/3.0", environment.getProperty("MAILCHIMP_SERVER"));
        mcMembersEndpoint = String.format("%s/lists/%s/members", mcApiRoot, environment.getProperty("MAILCHIMP_LIST_ID"));
    }

    public void subscribeUser(NewsletterSubscriptionDTO subscriptionData) throws NoSuchAlgorithmException, JsonProcessingException {
        final String firstName = subscriptionData.getFirstName();
        final String lastName = subscriptionData.getLastName();
        final String email = subscriptionData.getEmail();
        log.info(String.format("Processing subscription from %s %s with email %s", firstName, lastName, email));

        // Check if the member has already registered their interest
        RegisteredInterestApplicant existingRegisteredInterestApplicant = registeredInterestApplicantRepository.findFirstByEmail(email);
        if (existingRegisteredInterestApplicant != null) {
            throw new DataConflictException();
        }

        // Save member to registered interest applicants table
        RegisteredInterestApplicant applicant = new RegisteredInterestApplicant();
        applicant.setFirstName(firstName);
        applicant.setLastName(lastName);
        applicant.setEmail(email);
        registeredInterestApplicantRepository.save(applicant);

        log.info(String.format("Attempting to subscribe member %s %s with email %s", firstName, lastName, email));

        // Before subscribing the member, we need to check if the member is already subscribed.
        // Mailchimp requires the MD5 hash of a member's email to get their info.
        // We first need to compute the email's hash
        // https://stackoverflow.com/a/62778168
        byte[] bytesOfMessage = email.toLowerCase().getBytes(StandardCharsets.UTF_8);
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] md5 = md.digest(bytesOfMessage);

        // Now, we can proceed to do the check
        // Build the endpoint with the member's email hash
        String mcSpecificMemberEndpoint = String.format("%s/%s", mcMembersEndpoint, Hex.encodeHexString(md5));
        String mcSpecificMemberEndpointWithQuery = UriComponentsBuilder.fromHttpUrl(mcSpecificMemberEndpoint)
                .queryParam("fields", "email_address,status")
                .toUriString();

        // Perform the check
        // We should get either "200 OK" or "404 Not Found"
        //
        // 200 OK means that the user already exists, but may have unsubscribed
        // Because they are filling out the form again, they are resubscribing
        //
        // 404 Not Found means the user isn't subscribed and wants to subscribe
        SubscriptionActions subscriptionAction;
        try {
            HttpEntity<MailchimpMember> memberInfoRequestBody = new HttpEntity<>(buildHeaders());
            ResponseEntity<MailchimpMember> memberInfoResponse = restTemplate.exchange(
                    mcSpecificMemberEndpointWithQuery,
                    HttpMethod.GET,
                    memberInfoRequestBody,
                    MailchimpMember.class);

            // Handle 200 OK
            // If we get a 200 OK response, the member is already subscribed
            if (memberInfoResponse.getStatusCode() == HttpStatus.OK) {
                // Check if the member is already subscribed
                MailchimpMember member = memberInfoResponse.getBody();
                assert member != null;  // Not null since we checked for 200 OK
                if (member.getStatus().equals("subscribed")) {
                    log.info("The member is already subscribed!");
                    throw new DataConflictException();
                }
            }
            // Else, the member is unsubscribed and wants to resubscribe.
            subscriptionAction = SubscriptionActions.RESUBSCRIBE;
        } catch (HttpClientErrorException e) {
            // Handle other errors
            // It's fine to get a 404 Not Found response here, it just means that the member isn't subscribed
            // If we get another error, something might have gone wrong

            if (e.getStatusCode() != HttpStatus.NOT_FOUND) {
                // Handle errors other than 404 Not Found
                e.printStackTrace();
                return;
            }

            // Else, we have a 404 error. The member isn't subscribed and wants to subscribe for the first time.
            subscriptionAction = SubscriptionActions.SUBSCRIBE_NEW;
        }

        // At this point, the member is either not subscribed or unsubscribed. We can now proceed to subscribe the member.

        // Populate merge tags with first and last name
        Map<String, String> mergeTags = new HashMap<>();
        mergeTags.put("FNAME", firstName);
        mergeTags.put("LNAME", lastName);

        // Populate the member's tags
        // Tag the member as a priority member if the current date is before the general app deadline.
        String[] memberTags;
        if (PRIORITY_APPLICATIONS_ACTIVE) {
            memberTags = new String[]{"Registered Interest"};
        } else {
            memberTags = new String[0];
        }

        // Serialize and add the member
        ObjectWriter writer = objectMapper.writer();

        MailchimpMember memberToAdd = new MailchimpMember(email, "subscribed", mergeTags, memberTags);
        String serializedMemberToAdd = writer.writeValueAsString(memberToAdd);
        HttpEntity<String> addMemberRequestBody = new HttpEntity<>(serializedMemberToAdd, buildHeaders());

        switch (subscriptionAction) {
            case SUBSCRIBE_NEW:
                restTemplate.postForEntity(
                        mcMembersEndpoint,
                        addMemberRequestBody,
                        String.class
                );
                log.info("New member successfully subscribed!");
                break;
            case RESUBSCRIBE:
                restTemplate.put(mcSpecificMemberEndpoint, addMemberRequestBody);
                log.info("Member successfully resubscribed!");
                break;
            default:
                log.warn("Unknown subscription action.");
        }
    }

    /**
     * Builds headers for the Mailchimp API.
     *
     * @return The built headers.
     */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth("key", MAILCHIMP_API_KEY);  // Username can be any string

        return headers;
    }

    private enum SubscriptionActions {
        SUBSCRIBE_NEW,
        RESUBSCRIBE
    }

    /**
     * Represents the parts that we need from Mailchimp's "List Member" object from their API.
     */
    @Data
    @NoArgsConstructor
    @RequiredArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class MailchimpMember {

        @NotBlank
        @Email
        @JsonProperty("email_address")
        private String emailAddress;

        @NotBlank
        private String status;

        @NonNull
        @JsonSerialize
        @JsonProperty("merge_fields")
        private Map<String, String> mergeFields;

        @NonNull
        private String[] tags;
    }
}
