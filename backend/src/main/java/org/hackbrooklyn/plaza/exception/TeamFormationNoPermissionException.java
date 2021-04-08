package org.hackbrooklyn.plaza.exception;

public class TeamFormationNoPermissionException extends RuntimeException {

    public TeamFormationNoPermissionException() {
    }

    public TeamFormationNoPermissionException(String message) {
        super(message);
    }

    public TeamFormationNoPermissionException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeamFormationNoPermissionException(Throwable cause) {
        super(cause);
    }
}
