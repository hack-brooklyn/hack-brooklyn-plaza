package org.hackbrooklyn.plaza.exception;

public class TeamFormationParticipantNotInTeamException extends RuntimeException {

    public TeamFormationParticipantNotInTeamException() {
    }

    public TeamFormationParticipantNotInTeamException(String message) {
        super(message);
    }

    public TeamFormationParticipantNotInTeamException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationParticipantNotInTeamException(Throwable cause) {
        super(cause);
    }
}
