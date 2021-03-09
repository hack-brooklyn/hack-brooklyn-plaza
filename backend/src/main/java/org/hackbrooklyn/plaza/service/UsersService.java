package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.model.User;
import org.springframework.security.authentication.BadCredentialsException;

public interface UsersService {

    User logInUser(String email, String password) throws BadCredentialsException;

    User activateUser(String email, String password);
}
