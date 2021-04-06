package org.hackbrooklyn.plaza.exception;

public class TeamFormationTeamJoinRequestNotFoundException extends RuntimeException {

    public TeamFormationTeamJoinRequestNotFoundException() {
    }

    public TeamFormationTeamJoinRequestNotFoundException(String message) {
        super(message);
    }

    public TeamFormationTeamJoinRequestNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationTeamJoinRequestNotFoundException(Throwable cause) {
        super(cause);
    }
}
