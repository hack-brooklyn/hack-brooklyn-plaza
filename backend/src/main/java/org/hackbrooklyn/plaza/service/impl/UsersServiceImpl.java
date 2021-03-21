package org.hackbrooklyn.plaza.service.impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.TokenDTO;
import org.hackbrooklyn.plaza.exception.*;
import org.hackbrooklyn.plaza.model.PasswordReset;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.model.UserActivation;
import org.hackbrooklyn.plaza.repository.PasswordResetRepository;
import org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository;
import org.hackbrooklyn.plaza.repository.UserActivationRepository;
import org.hackbrooklyn.plaza.repository.UserRepository;
import org.hackbrooklyn.plaza.security.Roles;
import org.hackbrooklyn.plaza.exception.SendGridException;
import org.hackbrooklyn.plaza.dto.UserDataDTO;
import org.hackbrooklyn.plaza.service.UsersService;
import org.hackbrooklyn.plaza.util.JwtUtils;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManagerFactory;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import static org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;

@Slf4j
@Service
public class UsersServiceImpl implements UsersService {

    @Value("${USER_ACTIVATION_KEY_EXPIRATION_TIME_MS}")
    private long USER_ACTIVATION_KEY_EXPIRATION_TIME_MS;

    @Value("${USER_PASSWORD_RESET_KEY_EXPIRATION_TIME_MS}")
    private long USER_PASSWORD_RESET_KEY_EXPIRATION_TIME_MS;

    @Value("${FRONTEND_DOMAIN}")
    private String FRONTEND_DOMAIN;

    @Value("${SENDGRID_FROM_EMAIL}")
    private String SENDGRID_FROM_EMAIL;

    @Value("${SENDGRID_ACTIVATE_ACCOUNT_TEMPLATE_ID}")
    private String SENDGRID_ACTIVATE_ACCOUNT_TEMPLATE_ID;

    @Value("${SENDGRID_RESET_PASSWORD_TEMPLATE_ID}")
    private String SENDGRID_RESET_PASSWORD_TEMPLATE_ID;

    @Value("${REDIS_REFRESH_TOKEN_NAMESPACE}")
    private String REDIS_REFRESH_TOKEN_NAMESPACE;

    private final PasswordEncoder passwordEncoder;
    private final EntityManagerFactory entityManagerFactory;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SubmittedApplicationRepository submittedApplicationRepository;
    private final UserActivationRepository userActivationRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final RedisTemplate<String, String> refreshTokenBlocklistRedisTemplate;
    private final SendGrid sendGrid;
    private final JwtUtils jwtUtils;

    @Autowired
    public UsersServiceImpl(PasswordEncoder passwordEncoder, EntityManagerFactory entityManagerFactory, AuthenticationManager authenticationManager, UserRepository userRepository, SubmittedApplicationRepository submittedApplicationRepository, UserActivationRepository userActivationRepository, PasswordResetRepository passwordResetRepository, RedisTemplate<String, String> refreshTokenBlocklistRedisTemplate, SendGrid sendGrid, JwtUtils jwtUtils) {
        this.passwordEncoder = passwordEncoder;
        this.entityManagerFactory = entityManagerFactory;
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.submittedApplicationRepository = submittedApplicationRepository;
        this.userActivationRepository = userActivationRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.refreshTokenBlocklistRedisTemplate = refreshTokenBlocklistRedisTemplate;
        this.sendGrid = sendGrid;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public User logInUser(String email, String password) throws BadCredentialsException {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        return (User) auth.getPrincipal();
    }

    @Override
    public void addRefreshTokenToBlocklist(String refreshToken) {
        String keyName = String.format("%s:%s", REDIS_REFRESH_TOKEN_NAMESPACE, refreshToken);

        // Add key to Redis blocklist and set the key to expire when the JWT also expires
        refreshTokenBlocklistRedisTemplate.opsForValue().set(keyName, "");
        refreshTokenBlocklistRedisTemplate.expireAt(keyName, jwtUtils.getExpirationFromJwt(refreshToken));
    }

    @Override
    public TokenDTO activateUser(String activationKey, String password) {
        // Find the application via activation key
        UserActivation userActivation = userActivationRepository
                .findFirstByActivationKey(activationKey)
                .orElseThrow(InvalidKeyException::new);

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
        activatedUser.setLinkedApplication(activatedUserApplication);
        switch (activatedUserApplication.getDecision()) {
            case ACCEPTED:
                activatedUser.setRole(Roles.PARTICIPANT);
                break;
            case REJECTED:
            case UNDECIDED:
                activatedUser.setRole(Roles.APPLICANT);
                break;
            default:
                activatedUser.setRole(Roles.NONE);
        }

        userRepository.save(activatedUser);

        // Destroy all activation keys from the activating user
        userActivationRepository.deleteAllByActivatingApplication(activatedUserApplication);

        return jwtUtils.generateAccessTokenDTO(activatedUser);
    }

    @Override
    public void requestActivation(String activatingUserEmail) {
        SubmittedApplication foundApplication = submittedApplicationRepository
                .findFirstByEmail(activatingUserEmail)
                .orElseThrow(ApplicationNotFoundException::new);

        // Check if there is already an account activated with the email
        if (userRepository.findByEmail(activatingUserEmail).isPresent()) {
            throw new AccountAlreadyActivatedException();
        }

        // Account is not already activated, generate activation key and send to user
        String activationKey = UUID.randomUUID().toString();
        String activationLink = String.format("%s/activate?key=%s", FRONTEND_DOMAIN, activationKey);
        long expiryTimeMs = System.currentTimeMillis() + USER_ACTIVATION_KEY_EXPIRATION_TIME_MS;
        LocalDateTime expiryLocalDateTime = Instant.ofEpochMilli(expiryTimeMs).atZone(ZoneId.of("UTC")).toLocalDateTime();

        UserActivation userActivation = new UserActivation();
        userActivation.setActivationKey(activationKey);
        userActivation.setActivatingApplication(foundApplication);
        userActivation.setKeyExpiryTimestamp(expiryLocalDateTime);
        userActivationRepository.save(userActivation);

        // Send activation email to user via SendGrid dynamic template
        Personalization activationEmailPersonalization = new Personalization();
        activationEmailPersonalization.addDynamicTemplateData("firstName", foundApplication.getFirstName());
        activationEmailPersonalization.addDynamicTemplateData("activationLink", activationLink);
        activationEmailPersonalization.addTo(new Email(activatingUserEmail));

        try {
            sendDynamicTemplateEmailUsingSendGrid(SENDGRID_ACTIVATE_ACCOUNT_TEMPLATE_ID, activationEmailPersonalization);
        } catch (Exception e) {
            throw new SendGridException();
        }
    }

    @Override
    public TokenDTO resetPassword(String passwordResetKey, String password) {
        // Find the user via password reset key
        PasswordReset passwordReset = passwordResetRepository.findFirstByPasswordResetKey(passwordResetKey)
                .orElseThrow(InvalidKeyException::new);

        // Check if the activation key is still valid
        long keyExpiryTimeMs =
                passwordReset.getKeyExpiryTimestamp().atZone(ZoneId.of("UTC")).toInstant().toEpochMilli();
        if (keyExpiryTimeMs < System.currentTimeMillis()) {
            throw new InvalidKeyException();
        }

        User resettingUser = passwordReset.getResettingUser();

        // Password reset key is valid, proceed to hash and reset the user's password
        // Hash and set password
        String newHashedPassword = passwordEncoder.encode(password);
        resettingUser.setHashedPassword(newHashedPassword);

        // Save updated hash in database
        Session session = entityManagerFactory.createEntityManager().unwrap(Session.class);
        session.update(resettingUser);
        session.close();

        // Destroy all password reset keys from the activating user
        passwordResetRepository.deleteAllByResettingUser(resettingUser);

        return jwtUtils.generateAccessTokenDTO(resettingUser);
    }

    @Override
    public void requestPasswordReset(String resettingUserEmail) {
        // Check if a user with the email exists
        User resettingPasswordUser = userRepository.findByEmail(resettingUserEmail)
                .orElseThrow(UserNotFoundException::new);

        // User exists, generate password reset key and send to user
        String passwordResetKey = UUID.randomUUID().toString();
        String passwordResetLink = String.format("%s/resetPassword?key=%s", FRONTEND_DOMAIN, passwordResetKey);
        long expiryTimeMs = System.currentTimeMillis() + USER_PASSWORD_RESET_KEY_EXPIRATION_TIME_MS;
        LocalDateTime expiryLocalDateTime = Instant.ofEpochMilli(expiryTimeMs).atZone(ZoneId.of("UTC")).toLocalDateTime();

        PasswordReset passwordReset = new PasswordReset();
        passwordReset.setPasswordResetKey(passwordResetKey);
        passwordReset.setResettingUser(resettingPasswordUser);
        passwordReset.setKeyExpiryTimestamp(expiryLocalDateTime);
        passwordResetRepository.save(passwordReset);

        // Send password reset email to user via SendGrid dynamic template
        Personalization passwordResetEmailPersonalization = new Personalization();
        passwordResetEmailPersonalization.addDynamicTemplateData("firstName", resettingPasswordUser.getFirstName());
        passwordResetEmailPersonalization.addDynamicTemplateData("passwordResetLink", passwordResetLink);
        passwordResetEmailPersonalization.addTo(new Email(resettingPasswordUser.getEmail()));

        try {
            sendDynamicTemplateEmailUsingSendGrid(SENDGRID_RESET_PASSWORD_TEMPLATE_ID, passwordResetEmailPersonalization);
        } catch (Exception e) {
            throw new SendGridException();
        }
    }

    @Override
    public TokenDTO refreshAccessToken(String refreshToken, User refreshingUser) {
        String keyName = String.format("%s:%s", REDIS_REFRESH_TOKEN_NAMESPACE, refreshToken);

        // Throw exception and send 401 Unauthorized if the key is in the blocklist
        Boolean isKeyInBlocklist = refreshTokenBlocklistRedisTemplate.hasKey(keyName);
        if (isKeyInBlocklist != null && isKeyInBlocklist) throw new InvalidTokenException();

        // Generate new access token and corresponding DTO
        return jwtUtils.generateAccessTokenDTO(refreshingUser);
    }

    @Override
    public UserDataDTO getUserData(User user) {
        return new UserDataDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }

    @Override
    public DecisionDTO getApplicationDecision(User user) {
        // Get the user's linked application number from the User model if they have one
        SubmittedApplication userLinkedApplication = user.getLinkedApplication();
        if (userLinkedApplication == null) throw new ApplicationNotFoundException();

        // Due to the way we get the user, Hibernate will throw a LazyInitializationException
        // if we try to use user.getLinkedApplication().getDecision()
        // Get the application through SubmittedApplicationRepository instead since we do have
        // the application number from the User model
        int applicationNumber = user.getLinkedApplication().getApplicationNumber();
        SubmittedApplication foundApplication = submittedApplicationRepository
                .findFirstByApplicationNumber(applicationNumber)
                .orElseThrow(ApplicationNotFoundException::new);

        Decision decision = foundApplication.getDecision();
        return new DecisionDTO(decision);
    }

    private void sendDynamicTemplateEmailUsingSendGrid(String templateId, Personalization personalization) throws IOException {
        Email fromEmail = new Email(SENDGRID_FROM_EMAIL);

        Mail mail = new Mail();
        mail.setFrom(fromEmail);
        mail.setTemplateId(templateId);
        mail.addPersonalization(personalization);

        Request sendGridRequest = new Request();
        sendGridRequest.setMethod(Method.POST);
        sendGridRequest.setEndpoint("mail/send");
        sendGridRequest.setBody(mail.build());

        Response sendGridResponse = sendGrid.api(sendGridRequest);

        if (sendGridResponse.getStatusCode() != 202) {
            throw new SendGridException();
        }
    }
}
