package org.hackbrooklyn.plaza.exception;

public class TeamFormationParticipantAlreadyExistsException extends RuntimeException {

    public TeamFormationParticipantAlreadyExistsException() {
    }

    public TeamFormationParticipantAlreadyExistsException(String message) {
        super(message);
    }

    public TeamFormationParticipantAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationParticipantAlreadyExistsException(Throwable cause) {
        super(cause);
    }
}
