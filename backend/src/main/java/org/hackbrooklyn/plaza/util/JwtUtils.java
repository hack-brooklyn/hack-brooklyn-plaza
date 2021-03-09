package org.hackbrooklyn.plaza.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtUtils {

    @Value("${JWT_SECRET}")
    private String JWT_SECRET;

    @Value("${JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS}")
    private long JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS;

    @Value("${JWT_REFRESH_TOKEN_EXPIRATION_TIME_MS}")
    private long JWT_REFRESH_TOKEN_EXPIRATION_TIME_MS;

    @Value("${BACKEND_DOMAIN}")
    private String BACKEND_DOMAIN;

    public boolean validateJwt(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(JWT_SECRET).build().parseClaimsJws(token);
            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature - {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token - {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token - {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token - {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty - {}", e.getMessage());
        }
        return false;
    }

    public String generateJwt(User user, JwtTypes jwtType) {
        final long jwtExpirationTimeMs;
        switch (jwtType) {
            case ACCESS:
                jwtExpirationTimeMs = JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS;
                break;
            case REFRESH:
                jwtExpirationTimeMs = JWT_REFRESH_TOKEN_EXPIRATION_TIME_MS;
                break;
            default:
                jwtExpirationTimeMs = 900000;  // Default to 15 minutes if none was provided
        }

        return Jwts.builder()
                .setSubject(String.format("%s,%s", user.getId(), user.getEmail()))
                .setIssuer(BACKEND_DOMAIN)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationTimeMs))
                .signWith(getSigningKey())
                .compact();
    }

    public int getUserIdFromJwt(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(JWT_SECRET).build()
                .parseClaimsJws(token)
                .getBody();

        return Integer.parseInt(claims.getSubject().split(",")[0]);
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(JWT_SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public enum JwtTypes {
        ACCESS,
        REFRESH
    }
}
