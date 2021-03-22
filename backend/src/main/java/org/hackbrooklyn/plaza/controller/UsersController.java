package org.hackbrooklyn.plaza.controller;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.DecisionDTO;
import org.hackbrooklyn.plaza.dto.TokenDTO;
import org.hackbrooklyn.plaza.dto.UserDataDTO;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.service.UsersService;
import org.hackbrooklyn.plaza.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Slf4j
@RestController
@RequestMapping("/users")
public class UsersController {

    @Value("${JWT_COOKIE_NAME}")
    private String JWT_COOKIE_NAME;

    private final JwtUtils jwtUtils;
    private final UsersService usersService;

    @Autowired
    public UsersController(JwtUtils jwtUtils, UsersService usersService) {
        this.jwtUtils = jwtUtils;
        this.usersService = usersService;
    }

    /**
     * Logs a user in and generates a refresh token and an access token.
     */
    @PostMapping("login")
    public ResponseEntity<TokenDTO> login(@RequestBody @Valid AuthRequest reqBody, HttpServletResponse response) {
        // Check user credentials and get authenticating user
        User authenticatingUser = usersService.logInUser(reqBody.getEmail(), reqBody.getPassword());

        // Generate access and refresh tokens for the response
        TokenDTO resBody = jwtUtils.generateAccessTokenDTO(authenticatingUser);
        Cookie jwtCookie = jwtUtils.generateRefreshTokenCookie(authenticatingUser);
        response.addCookie(jwtCookie);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    @PostMapping("logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        // Add the refresh token to the blocklist if one was provided
        final Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(JWT_COOKIE_NAME)) {
                    usersService.addRefreshTokenToBlocklist(cookie.getValue());
                    break;
                }
            }
        }

        // Remove the refresh token cookie from the client by generating
        // and sending an instantly expiring cookie
        Cookie expiredJwtCookie = new Cookie(JWT_COOKIE_NAME, "");
        expiredJwtCookie.setPath("/users/refreshAccessToken");
        expiredJwtCookie.setMaxAge(0);
        expiredJwtCookie.setHttpOnly(true);
        response.addCookie(expiredJwtCookie);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Activates a user's account and generates a refresh token and an access token.
     */
    @PostMapping("activate")
    public ResponseEntity<TokenDTO> activate(@RequestBody @Valid KeyPasswordBodyRequest reqBody, HttpServletResponse response) {
        TokenDTO resBody = usersService.activateUser(reqBody.getKey(), reqBody.getPassword());

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    @PostMapping("activate/request")
    public ResponseEntity<Void> requestActivation(@RequestBody @Valid EmailBodyRequest reqBody) {
        usersService.requestActivation(reqBody.getEmail());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Resets a user's password given a password reset key and generates a refresh token and an access token.
     */
    @PostMapping("resetPassword")
    public ResponseEntity<TokenDTO> resetPassword(@RequestBody @Valid KeyPasswordBodyRequest reqBody, HttpServletResponse response) {
        TokenDTO resBody = usersService.resetPassword(reqBody.getKey(), reqBody.getPassword());

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    @PostMapping("resetPassword/request")
    public ResponseEntity<Void> requestPasswordReset(@RequestBody @Valid EmailBodyRequest reqBody) {
        usersService.requestPasswordReset(reqBody.getEmail());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Generates an access token for the user.
     * Accepts a refresh token in the cookie for authentication.
     */
    @PostMapping("refreshAccessToken")
    public ResponseEntity<TokenDTO> refreshAccessToken(@AuthenticationPrincipal User refreshingUser, Authentication authentication) {
        // Check if the refresh token is in the blocklist
        // Will throw an exception and respond with 401 Unauthorized if it is
        String refreshToken = (String) authentication.getCredentials();
        TokenDTO resBody = usersService.refreshAccessToken(refreshToken, refreshingUser);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    /**
     * Gets selected user data for the logged in user.
     */
    @GetMapping("data")
    public ResponseEntity<UserDataDTO> getUserData(@AuthenticationPrincipal User user) {
        UserDataDTO resBody = usersService.getUserData(user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    /**
     * Separate endpoint for getting decisions since we have to look up the application as well as the user
     */
    @GetMapping("applicationDecision")
    public ResponseEntity<DecisionDTO> getApplicationDecision(@AuthenticationPrincipal User user) {
        DecisionDTO resBody = usersService.getApplicationDecision(user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    @Data
    private static class EmailBodyRequest {

        @Email
        @NotBlank
        private String email;
    }

    @Data
    private static class KeyPasswordBodyRequest {

        @NotBlank
        private String key;

        @Size(min = 12)
        @NotBlank
        private String password;
    }

    @Data
    private static class AuthRequest {

        @Email
        @NotBlank
        private String email;

        @Size(min = 12)
        @NotBlank
        private String password;
    }
}
