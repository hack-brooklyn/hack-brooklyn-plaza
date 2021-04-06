package org.hackbrooklyn.plaza.exception;

public class TeamFormationTeamJoinRequestInaccessibleException extends RuntimeException {

    public TeamFormationTeamJoinRequestInaccessibleException() {
    }

    public TeamFormationTeamJoinRequestInaccessibleException(String message) {
        super(message);
    }

    public TeamFormationTeamJoinRequestInaccessibleException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationTeamJoinRequestInaccessibleException(Throwable cause) {
        super(cause);
    }
}
