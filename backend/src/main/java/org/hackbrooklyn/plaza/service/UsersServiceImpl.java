package org.hackbrooklyn.plaza.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.model.UserActivation;
import org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository;
import org.hackbrooklyn.plaza.repository.UserActivationRepository;
import org.hackbrooklyn.plaza.repository.UserRepository;
import org.hackbrooklyn.plaza.security.Roles;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Slf4j
@Service
public class UsersServiceImpl implements UsersService {

    @Value("${USER_ACTIVATION_KEY_EXPIRATION_TIME_MS}")
    private long USER_ACTIVATION_KEY_EXPIRATION_TIME_MS;

    @Value("${FRONTEND_DOMAIN}")
    private String FRONTEND_DOMAIN;

    @Value("${SENDGRID_FROM_EMAIL}")
    private String SENDGRID_FROM_EMAIL;

    @Value("${SENDGRID_ACTIVATE_ACCOUNT_TEMPLATE_ID}")
    private String SENDGRID_ACTIVATE_ACCOUNT_TEMPLATE_ID;

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SubmittedApplicationRepository submittedApplicationRepository;
    private final UserActivationRepository userActivationRepository;
    private final SendGrid sendGrid;

    public UsersServiceImpl(PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, UserRepository userRepository, SubmittedApplicationRepository submittedApplicationRepository, UserActivationRepository userActivationRepository, SendGrid sendGrid) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.submittedApplicationRepository = submittedApplicationRepository;
        this.userActivationRepository = userActivationRepository;
        this.sendGrid = sendGrid;
    }

    public User logInUser(String email, String password) throws BadCredentialsException {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        return (User) auth.getPrincipal();
    }

    public User activateUser(String activationKey, String password) {
        // Find the application via activation key
        UserActivation userActivation = userActivationRepository
                .findFirstByActivationKey(activationKey)
                .orElseThrow(() -> new InvalidKeyException());

        // Check if the activation key is still valid
        long keyExpiryTimeMs =
                userActivation.getKeyExpiryTimestamp().atZone(ZoneId.of("UTC")).toInstant().toEpochMilli();
        if (keyExpiryTimeMs < System.currentTimeMillis()) {
            throw new InvalidKeyException();
        }

        // Check if there is already an account activated with the email
        SubmittedApplication activatedUserApplication = userActivation.getActivatingApplication();
        if (userRepository.findByEmail(activatedUserApplication.getEmail()).isPresent()) {
            throw new AccountAlreadyActivatedException();
        }

        // Activation key is valid, proceed to activate the user's account
        User activatedUser = new User();
        activatedUser.setFirstName(activatedUserApplication.getFirstName());
        activatedUser.setLastName(activatedUserApplication.getLastName());
        activatedUser.setEmail(activatedUserApplication.getEmail());
        activatedUser.setHashedPassword(passwordEncoder.encode(password));
        activatedUser.setRole(Roles.PARTICIPANT);
        userRepository.save(activatedUser);

        // Destroy all activation keys from the activating user
        userActivationRepository.deleteAllByActivatingApplication(activatedUserApplication);

        return activatedUser;
    }

    public void requestActivation(String activatingUserEmail) {
        // Check if the applicant was accepted
        SubmittedApplication foundApplication = submittedApplicationRepository.findFirstByEmail(activatingUserEmail);
        if (foundApplication == null) {
            throw new ApplicationNotFoundException();
        }

        if (foundApplication.getDecision() == null || !foundApplication.getDecision().equals("Accepted")) {
            throw new ApplicantNotAcceptedException();
        }

        // Check if there is already an account activated with the email
        if (userRepository.findByEmail(activatingUserEmail).isPresent()) {
            throw new AccountAlreadyActivatedException();
        }

        // Applicant is accepted and is not already activated, generate activation key and send to user
        String activationKey = UUID.randomUUID().toString();
        String activationLink = String.format("%s/activate/%s", FRONTEND_DOMAIN, activationKey);
        long expiryTimeMs = System.currentTimeMillis() + USER_ACTIVATION_KEY_EXPIRATION_TIME_MS;
        LocalDateTime expiryLocalDateTime = Instant.ofEpochMilli(expiryTimeMs).atZone(ZoneId.of("UTC")).toLocalDateTime();

        UserActivation userActivation = new UserActivation();
        userActivation.setActivationKey(activationKey);
        userActivation.setActivatingApplication(foundApplication);
        userActivation.setKeyExpiryTimestamp(expiryLocalDateTime);
        userActivationRepository.save(userActivation);

        // Send activation email to user via SendGrid dynamic template
        Email fromEmail = new Email(SENDGRID_FROM_EMAIL);
        Email toEmail = new Email(activatingUserEmail);

        Mail mail = new Mail();
        mail.setFrom(fromEmail);
        mail.setTemplateId(SENDGRID_ACTIVATE_ACCOUNT_TEMPLATE_ID);

        Personalization personalization = new Personalization();
        personalization.addDynamicTemplateData("firstName", foundApplication.getFirstName());
        personalization.addDynamicTemplateData("activationLink", activationLink);
        personalization.addTo(toEmail);
        mail.addPersonalization(personalization);

        try {
            Request sendGridRequest = new Request();
            sendGridRequest.setMethod(Method.POST);
            sendGridRequest.setEndpoint("mail/send");
            sendGridRequest.setBody(mail.build());

            Response sendGridResponse = sendGrid.api(sendGridRequest);

            if (sendGridResponse.getStatusCode() != 202) {
                throw new SendGridException();
            }
        } catch (Exception e) {
            throw new SendGridException();
        }
    }
}
