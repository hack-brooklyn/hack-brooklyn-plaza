package org.hackbrooklyn.plaza.exception;

public class TeamFormationTeamNameConflictException extends RuntimeException {

    public TeamFormationTeamNameConflictException() {
    }

    public TeamFormationTeamNameConflictException(String message) {
        super(message);
    }

    public TeamFormationTeamNameConflictException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationTeamNameConflictException(Throwable cause) {
        super(cause);
    }
}
