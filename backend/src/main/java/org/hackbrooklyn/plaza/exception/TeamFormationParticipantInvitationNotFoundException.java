package org.hackbrooklyn.plaza.exception;

public class TeamFormationParticipantInvitationNotFoundException extends RuntimeException {

    public TeamFormationParticipantInvitationNotFoundException() {
    }

    public TeamFormationParticipantInvitationNotFoundException(String message) {
        super(message);
    }

    public TeamFormationParticipantInvitationNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationParticipantInvitationNotFoundException(Throwable cause) {
        super(cause);
    }
}
