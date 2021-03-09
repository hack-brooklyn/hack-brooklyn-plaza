package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository;
import org.hackbrooklyn.plaza.repository.UserRepository;
import org.hackbrooklyn.plaza.security.Roles;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsersServiceImpl implements UsersService {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SubmittedApplicationRepository submittedApplicationRepository;

    public UsersServiceImpl(PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, UserRepository userRepository, SubmittedApplicationRepository submittedApplicationRepository) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.submittedApplicationRepository = submittedApplicationRepository;
    }

    public User logInUser(String email, String password) throws BadCredentialsException {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        return (User) auth.getPrincipal();
    }

    public User activateUser(String email, String password) {
        // Check if the applicant was accepted
        SubmittedApplication foundApplication = submittedApplicationRepository.findFirstByEmail(email);
        if (foundApplication == null) {
            throw new ApplicationNotFoundException();
        }

        if (foundApplication.getDecision() == null || !foundApplication.getDecision().equals("Accepted")) {
            throw new ApplicantNotAcceptedException();
        }

        // Check if there is already an account activated with the email
        if (userRepository.findByEmail(email).isPresent()) {
            throw new AccountAlreadyActivatedException();
        }

        // The applicant has been accepted and has not activated their account yet, proceed to activate account
        User activatedUser = new User();
        activatedUser.setFirstName(foundApplication.getFirstName());
        activatedUser.setLastName(foundApplication.getLastName());
        activatedUser.setEmail(email);
        activatedUser.setHashedPassword(passwordEncoder.encode(password));
        activatedUser.setRole(Roles.PARTICIPANT);
        userRepository.save(activatedUser);

        return activatedUser;
    }
}
