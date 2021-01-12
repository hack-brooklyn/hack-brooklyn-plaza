package org.hackbrooklyn.plaza.api;

import lombok.*;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.validator.routines.EmailValidator;
import org.hackbrooklyn.plaza.PlazaApplication;
import org.hackbrooklyn.plaza.model.MailchimpMember;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/newsletter")
public class NewsletterController {

    // Mailchimp params
    @Value("${MAILCHIMP_API_KEY}")
    private String MAILCHIMP_API_KEY;

    @Value("${MAILCHIMP_SERVER}")
    private String MAILCHIMP_SERVER;

    @Value("${MAILCHIMP_LIST_ID}")
    private String MAILCHIMP_LIST_ID;

    @Value("${GENERAL_APPLICATION_DEADLINE}")
    private String GENERAL_APPLICATION_DEADLINE;

    // Mailchimp API routes
    private String mcApiRoot;
    private String mcMembersEndpoint;

    static final Logger logger = LoggerFactory.getLogger(PlazaApplication.class);
    private final RestTemplate restTemplate;

    public NewsletterController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Format API root after getting Mailchimp server from environment variable
    @Autowired
    public void initMailchimpApiRoot() {
        mcApiRoot = String.format("https://%s.api.mailchimp.com/3.0", MAILCHIMP_SERVER);
        mcMembersEndpoint = String.format("%s/lists/%s/members", mcApiRoot, MAILCHIMP_LIST_ID);
    }

    /**
     * Subscribes a member to the Hack Brooklyn newsletter on Mailchimp.
     *
     * @param request The request body.
     */
    @PostMapping(path = "subscribe")
    public ResponseEntity<Void> subscribeUser(@RequestBody MemberSubscriptionRequest request) {
        final String firstName = request.getFirstName();
        final String lastName = request.getLastName();
        final String email = request.getEmail();
        logger.info(String.format("Attempting to subscribe member %s %s with email %s", firstName, lastName, email));

        // Validate email address before starting
        if (!EmailValidator.getInstance().isValid(email)) {
            logger.error("Invalid email address detected!");
            return ResponseEntity.badRequest().build();
        }

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
        String mcGetMemberInfoEndpoint = String.format("%s/%s", mcMembersEndpoint, emailHash);
        String mcGetMemberInfoEndpointWithQuery = UriComponentsBuilder.fromHttpUrl(mcGetMemberInfoEndpoint)
                .queryParam("fields", "email_address,status,tags")
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
                    mcGetMemberInfoEndpointWithQuery,
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
                    logger.info("The member is already subscribed!");
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
        mergeTags.put("First Name", firstName);
        mergeTags.put("Last Name", lastName);

        // Populate the member's tags
        // Tag the member as a priority member if the current date is before the general app deadline.
        logger.info(ZonedDateTime.now().toString());
        ZonedDateTime appDeadline = ZonedDateTime.parse(GENERAL_APPLICATION_DEADLINE);
        String[] memberTags;
        if (ZonedDateTime.now().isBefore(appDeadline)) {
            logger.info("Tagging member as a priority applicant for the general application!");
            memberTags = new String[]{"2021 General Application Priority"};
        } else {
            memberTags = new String[0];
        }

        // Add the member
        MailchimpMember memberToAdd = new MailchimpMember(email, "subscribed", mergeTags, memberTags);

        HttpEntity<MailchimpMember> addMemberRequestBody = new HttpEntity<>(memberToAdd, buildHeaders());
        logger.info(addMemberRequestBody.toString());

        switch (subscriptionAction) {
            case SUBSCRIBE_NEW:
                // Subscribe the member
                ResponseEntity<MailchimpMember> addMemberResponse = restTemplate.postForEntity(
                        mcMembersEndpoint,
                        addMemberRequestBody,
                        MailchimpMember.class
                );

                if (addMemberResponse.getStatusCode() == HttpStatus.OK) {
                    logger.info("New member successfully subscribed!");
                    return ResponseEntity.ok().build();
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                }
            case RESUBSCRIBE:
                // Resubscribe the member
                try {
                    restTemplate.put(mcMembersEndpoint, addMemberRequestBody);
                    logger.info("Member successfully resubscribed!");
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
    @Getter
    private static class MemberSubscriptionRequest {
        private final String firstName;
        private final String lastName;
        private final String email;
    }
}
