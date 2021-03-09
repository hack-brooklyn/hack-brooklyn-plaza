package org.hackbrooklyn.plaza.security;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.UserRepository;
import org.hackbrooklyn.plaza.util.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    @Value("${JWT_COOKIE_NAME}")
    private String JWT_COOKIE_NAME;

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public JwtTokenFilter(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        final String jwt;
        if (request.getRequestURI().equals("/users/refreshAccessToken")) {
            // Check for JWT from the refresh token cookie
            final Cookie[] cookies = request.getCookies();
            if (cookies == null) {
                chain.doFilter(request, response);
                return;
            }

            // Iterate through cookies and find the JWT
            Cookie jwtCookie = null;
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(JWT_COOKIE_NAME)) {
                    jwtCookie = cookie;
                    break;
                }
            }

            if (jwtCookie == null) {
                chain.doFilter(request, response);
                return;
            }

            jwt = jwtCookie.getValue();
        } else {
            // Extract JWT from authorization header
            final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
                chain.doFilter(request, response);
                return;
            }

            jwt = header.split(" ")[1].trim();
        }

        // Validate JWT
        if (!jwtUtils.validateJwt(jwt)) {
            chain.doFilter(request, response);
            return;
        }

        // Get user identity and set it on the Spring security context
        User foundUser = userRepository.findById(jwtUtils.getUserIdFromJwt(jwt)).orElse(null);
        if (foundUser == null) {
            chain.doFilter(request, response);
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(foundUser, null, foundUser.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        chain.doFilter(request, response);
    }
}
