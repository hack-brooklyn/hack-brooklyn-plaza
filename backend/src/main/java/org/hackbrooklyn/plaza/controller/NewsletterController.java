package org.hackbrooklyn.plaza.controller;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Hex;
import org.hackbrooklyn.plaza.model.RegisteredInterestApplicant;
import org.hackbrooklyn.plaza.repository.RegisteredInterestApplicantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@CrossOrigin
@RequestMapping("/newsletter")
public class NewsletterController {

    @Value("${MAILCHIMP_API_KEY}")
    private String MAILCHIMP_API_KEY;

    @Value("${MAILCHIMP_SERVER}")
    private String MAILCHIMP_SERVER;

    @Value("${MAILCHIMP_LIST_ID}")
    private String MAILCHIMP_LIST_ID;

    @Value("${PRIORITY_APPLICATIONS_ACTIVE}")
    private boolean PRIORITY_APPLICATIONS_ACTIVE;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final RegisteredInterestApplicantRepository registeredInterestApplicantRepository;
    private final RestTemplate restTemplate;

    private String mcMembersEndpoint;

    public NewsletterController(RegisteredInterestApplicantRepository registeredInterestApplicantRepository, RestTemplate restTemplate) {
        this.registeredInterestApplicantRepository = registeredInterestApplicantRepository;
        this.restTemplate = restTemplate;
    }

    // Format Mailchimp API endpoint after getting Mailchimp server from environment variable
    @Autowired
    public void initMailchimpApi() {
        String mcApiRoot = String.format("https://%s.api.mailchimp.com/3.0", MAILCHIMP_SERVER);
        mcMembersEndpoint = String.format("%s/lists/%s/members", mcApiRoot, MAILCHIMP_LIST_ID);
    }

    /**
     * Subscribes a member to the Hack Brooklyn newsletter on Mailchimp.
     *
     * @param request The request body.
     */
    @PostMapping(path = "subscribe")
    public ResponseEntity<Void> subscribeUser(@RequestBody @Valid MemberSubscriptionRequest request) throws JsonProcessingException {
        final String firstName = request.getFirstName();
        final String lastName = request.getLastName();
        final String email = request.getEmail();

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
        String emailHash;
        try {
            byte[] bytesOfMessage = email.toLowerCase().getBytes(StandardCharsets.UTF_8);
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] md5 = md.digest(bytesOfMessage);
            emailHash = Hex.encodeHexString(md5);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        // Now, we can proceed to do the check

        // Build the endpoint with the member's email hash
        String mcSpecificMemberEndpoint = String.format("%s/%s", mcMembersEndpoint, emailHash);
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
                    return ResponseEntity.status(HttpStatus.CONFLICT).build();
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
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
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
                ResponseEntity<String> addMemberResponse;
                try {
                    addMemberResponse = restTemplate.postForEntity(
                            mcMembersEndpoint,
                            addMemberRequestBody,
                            String.class
                    );
                } catch (HttpClientErrorException e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                }

                if (addMemberResponse.getStatusCode() == HttpStatus.OK) {
                    log.info("New member successfully subscribed!");
                    return ResponseEntity.ok().build();
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                }
            case RESUBSCRIBE:
                try {
                    restTemplate.put(mcSpecificMemberEndpoint, addMemberRequestBody);
                    log.info("Member successfully resubscribed!");
                    return ResponseEntity.ok().build();
                } catch (HttpClientErrorException e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                }
            default:
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
     * The newsletter subscription's request body.
     */
    @RequiredArgsConstructor
    @Data
    private static class MemberSubscriptionRequest {

        @NotBlank
        private String firstName;

        @NotBlank
        private String lastName;

        @NotBlank
        @Email
        private String email;
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
