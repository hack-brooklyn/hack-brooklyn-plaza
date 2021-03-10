package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.model.User;
import org.springframework.security.authentication.BadCredentialsException;

public interface UsersService {

    User logInUser(String email, String password) throws BadCredentialsException;

    User activateUser(String key, String password);

    void requestActivation(String email);

    User resetPassword(String key, String password);

    void requestPasswordReset(String email);
}
