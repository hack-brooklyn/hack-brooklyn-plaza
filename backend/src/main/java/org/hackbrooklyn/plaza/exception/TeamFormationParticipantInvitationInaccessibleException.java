package org.hackbrooklyn.plaza.exception;

public class TeamFormationParticipantInvitationInaccessibleException extends RuntimeException {

    public TeamFormationParticipantInvitationInaccessibleException() {
    }

    public TeamFormationParticipantInvitationInaccessibleException(String message) {
        super(message);
    }

    public TeamFormationParticipantInvitationInaccessibleException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationParticipantInvitationInaccessibleException(Throwable cause) {
        super(cause);
    }
}
