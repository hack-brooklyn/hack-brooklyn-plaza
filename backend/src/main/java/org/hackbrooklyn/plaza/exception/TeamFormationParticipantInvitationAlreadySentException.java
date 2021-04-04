package org.hackbrooklyn.plaza.exception;

public class TeamFormationParticipantInvitationAlreadySentException extends RuntimeException {

    public TeamFormationParticipantInvitationAlreadySentException() {
    }

    public TeamFormationParticipantInvitationAlreadySentException(String message) {
        super(message);
    }

    public TeamFormationParticipantInvitationAlreadySentException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationParticipantInvitationAlreadySentException(Throwable cause) {
        super(cause);
    }
}
