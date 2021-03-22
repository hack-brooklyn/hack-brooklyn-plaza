package org.hackbrooklyn.plaza.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class Roles {
    public static final String ADMIN = "ROLE_ADMIN";
    public static final String VOLUNTEER = "ROLE_VOLUNTEER";
    public static final String PARTICIPANT = "ROLE_PARTICIPANT";
    public static final String APPLICANT = "ROLE_APPLICANT";
    public static final String NONE = "ROLE_NONE";

    public static final Set<GrantedAuthority> ADMIN_GRANTED_AUTHORITIES;
    public static final Set<GrantedAuthority> VOLUNTEER_GRANTED_AUTHORITIES;
    public static final Set<GrantedAuthority> PARTICIPANT_GRANTED_AUTHORITIES;
    public static final Set<GrantedAuthority> APPLICANT_GRANTED_AUTHORITIES;
    public static final Set<GrantedAuthority> NONE_GRANTED_AUTHORITIES;

    // Each role inherits the role directly under it, with the exception of Admin
    // Admin has its own unique set of roles that supersedes all of the other roles
    // and effectively serves as a listing of all available roles in each category
    static {
        // Admins
        List<String> adminAuthorities = Arrays.asList(
                // Announcements
                Authorities.ANNOUNCEMENTS_CREATE,
                Authorities.ANNOUNCEMENTS_READ_PUBLIC,
                Authorities.ANNOUNCEMENTS_READ_PARTICIPANTS_ONLY,
                Authorities.ANNOUNCEMENTS_UPDATE,
                Authorities.ANNOUNCEMENTS_DELETE,

                // Applications
                Authorities.APPLICATIONS_READ,
                Authorities.APPLICATIONS_UPDATE_DECISION,
                Authorities.APPLICATIONS_DELETE,

                // Events
                Authorities.EVENTS_CREATE,
                Authorities.EVENTS_READ,
                Authorities.EVENTS_UPDATE,
                Authorities.EVENTS_DELETE,

                // Saved Events
                Authorities.SAVED_EVENTS_ADD,
                Authorities.SAVED_EVENTS_REMOVE,
                Authorities.SAVED_EVENTS_READ,

                // Users
                Authorities.USERS_CREATE,
                Authorities.USERS_UPDATE_ROLE
        );

        // Volunteers
        List<String> volunteerAuthorities = Arrays.asList(
                // TODO: Add volunteer authorities
        );

        // Participants
        List<String> participantAuthorities = Arrays.asList(
                // Announcements
                Authorities.ANNOUNCEMENTS_READ_PARTICIPANTS_ONLY,

                // Events
                Authorities.EVENTS_READ,

                // Saved Events
                Authorities.SAVED_EVENTS_ADD,
                Authorities.SAVED_EVENTS_REMOVE,
                Authorities.SAVED_EVENTS_READ
        );

        // Participants
        List<String> applicantAuthorities = Arrays.asList(
                // Announcements
                Authorities.ANNOUNCEMENTS_READ_PUBLIC
        );

        // Inherit roles
        List<String> participantCombinedAuthorities = Stream
                .concat(applicantAuthorities.stream(), participantAuthorities.stream())
                .collect(Collectors.toList());
        List<String> volunteerCombinedAuthorities = Stream
                .concat(participantCombinedAuthorities.stream(), volunteerAuthorities.stream())
                .collect(Collectors.toList());

        APPLICANT_GRANTED_AUTHORITIES = createGrantedAuthoritySet(applicantAuthorities);
        PARTICIPANT_GRANTED_AUTHORITIES = createGrantedAuthoritySet(participantCombinedAuthorities);
        VOLUNTEER_GRANTED_AUTHORITIES = createGrantedAuthoritySet(volunteerCombinedAuthorities);
        ADMIN_GRANTED_AUTHORITIES = createGrantedAuthoritySet(adminAuthorities);
        NONE_GRANTED_AUTHORITIES = Collections.unmodifiableSet(new HashSet<>(0));
    }

    public static Set<GrantedAuthority> getGrantedAuthoritiesForRole(String role) {
        switch (role) {
            case "ROLE_ADMIN":
                return ADMIN_GRANTED_AUTHORITIES;
            case "ROLE_VOLUNTEER":
                return VOLUNTEER_GRANTED_AUTHORITIES;
            case "ROLE_PARTICIPANT":
                return PARTICIPANT_GRANTED_AUTHORITIES;
            case "ROLE_APPLICANT":
                return APPLICANT_GRANTED_AUTHORITIES;
            default:
                return NONE_GRANTED_AUTHORITIES;
        }
    }

    private static Set<GrantedAuthority> createGrantedAuthoritySet(List<String> authorities) {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>(authorities.size());
        authorities.forEach(authority -> grantedAuthorities.add(new SimpleGrantedAuthority(authority)));
        return Collections.unmodifiableSet(new HashSet<>(grantedAuthorities));
    }
}
