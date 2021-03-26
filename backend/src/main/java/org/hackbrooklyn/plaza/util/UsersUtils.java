package org.hackbrooklyn.plaza.util;

import org.hackbrooklyn.plaza.security.Roles;
import org.springframework.stereotype.Component;

import static org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;

@Component
public class UsersUtils {

    public String getRoleForDecision(Decision decision) {
        switch (decision) {
            case ACCEPTED:
                return Roles.PARTICIPANT;
            case REJECTED:
            case UNDECIDED:
                return Roles.APPLICANT;
            default:
                return Roles.NONE;
        }
    }
}
