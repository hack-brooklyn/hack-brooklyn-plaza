package org.hackbrooklyn.plaza.exception;

public class TeamFormationTeamFullException extends RuntimeException {

    public TeamFormationTeamFullException() {
    }

    public TeamFormationTeamFullException(String message) {
        super(message);
    }

    public TeamFormationTeamFullException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationTeamFullException(Throwable cause) {
        super(cause);
    }
}
