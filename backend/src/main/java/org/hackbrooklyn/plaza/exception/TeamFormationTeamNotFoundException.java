package org.hackbrooklyn.plaza.exception;

public class TeamFormationTeamNotFoundException extends RuntimeException {

    public TeamFormationTeamNotFoundException() {
    }

    public TeamFormationTeamNotFoundException(String message) {
        super(message);
    }

    public TeamFormationTeamNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationTeamNotFoundException(Throwable cause) {
        super(cause);
    }
}
