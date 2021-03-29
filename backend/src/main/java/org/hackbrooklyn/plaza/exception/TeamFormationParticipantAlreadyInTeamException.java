package org.hackbrooklyn.plaza.exception;

public class TeamFormationParticipantAlreadyInTeamException extends RuntimeException {

    public TeamFormationParticipantAlreadyInTeamException() {
    }

    public TeamFormationParticipantAlreadyInTeamException(String message) {
        super(message);
    }

    public TeamFormationParticipantAlreadyInTeamException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationParticipantAlreadyInTeamException(Throwable cause) {
        super(cause);
    }
}
