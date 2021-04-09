package org.hackbrooklyn.plaza.exception;

public class TeamFormationParticipantNotFoundException extends RuntimeException {

    public TeamFormationParticipantNotFoundException() {
    }

    public TeamFormationParticipantNotFoundException(String message) {
        super(message);
    }

    public TeamFormationParticipantNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationParticipantNotFoundException(Throwable cause) {
        super(cause);
    }
}
