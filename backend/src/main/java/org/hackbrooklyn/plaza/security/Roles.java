package org.hackbrooklyn.plaza.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.*;

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

    static {
        // Admins
        String[] adminAuthorities = {
                // Applications
                Authorities.APPLICATIONS_READ,
                Authorities.APPLICATIONS_UPDATE_DECISION,
                Authorities.APPLICATIONS_DELETE,

                // Announcements
                Authorities.ANNOUNCEMENTS_CREATE,
                Authorities.ANNOUNCEMENTS_READ,
                Authorities.ANNOUNCEMENTS_UPDATE,
                Authorities.ANNOUNCEMENTS_DELETE,

                // Users
                Authorities.USERS_CREATE,
                Authorities.USERS_UPDATE_ROLE,

                // Events
                Authorities.EVENTS_CREATE,
                Authorities.EVENTS_READ,
                Authorities.EVENTS_UPDATE,
                Authorities.EVENTS_DELETE,

                // Saved Events
                Authorities.SAVED_EVENTS_ADD,
                Authorities.SAVED_EVENTS_REMOVE,
                Authorities.SAVED_EVENTS_READ,
        };

        // Volunteers
        String[] volunteerAuthorities = {
                // Announcements
                Authorities.ANNOUNCEMENTS_READ,

                // Events
                Authorities.EVENTS_READ,

                // Saved Events
                Authorities.SAVED_EVENTS_ADD,
                Authorities.SAVED_EVENTS_REMOVE,
                Authorities.SAVED_EVENTS_READ,
        };

        // Participants
        String[] participantAuthorities = {
                // Announcements
                Authorities.ANNOUNCEMENTS_READ,

                // Events
                Authorities.EVENTS_READ,

                // Saved Events
                Authorities.SAVED_EVENTS_ADD,
                Authorities.SAVED_EVENTS_REMOVE,
                Authorities.SAVED_EVENTS_READ,
        };

        // Participants
        String[] applicantAuthorities = {
                // Announcements
                Authorities.ANNOUNCEMENTS_READ
        };

        APPLICANT_GRANTED_AUTHORITIES = createGrantedAuthoritySet(applicantAuthorities);
        PARTICIPANT_GRANTED_AUTHORITIES = createGrantedAuthoritySet(participantAuthorities);
        VOLUNTEER_GRANTED_AUTHORITIES = createGrantedAuthoritySet(volunteerAuthorities);
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
            case "ROLE_NONE":
                return NONE_GRANTED_AUTHORITIES;
            default:
                return null;
        }
    }

    private static Set<GrantedAuthority> createGrantedAuthoritySet(String[] authorities) {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>(authorities.length);
        Arrays.asList(authorities).forEach(authority -> grantedAuthorities.add(new SimpleGrantedAuthority(authority)));
        return Collections.unmodifiableSet(new HashSet<>(grantedAuthorities));
    }
}
