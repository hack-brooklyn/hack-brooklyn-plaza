package org.hackbrooklyn.plaza.exception;

public class TeamFormationTeamJoinRequestAlreadySentException extends RuntimeException {

    public TeamFormationTeamJoinRequestAlreadySentException() {
    }

    public TeamFormationTeamJoinRequestAlreadySentException(String message) {
        super(message);
    }

    public TeamFormationTeamJoinRequestAlreadySentException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationTeamJoinRequestAlreadySentException(Throwable cause) {
        super(cause);
    }
}
