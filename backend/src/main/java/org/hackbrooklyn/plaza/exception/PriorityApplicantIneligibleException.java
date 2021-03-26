package org.hackbrooklyn.plaza.exception;

public class PriorityApplicantIneligibleException extends RuntimeException {
    public PriorityApplicantIneligibleException() {
    }

    public PriorityApplicantIneligibleException(String message) {
        super(message);
    }

    public PriorityApplicantIneligibleException(String message, Throwable cause) {
        super(message, cause);
    }

    public PriorityApplicantIneligibleException(Throwable cause) {
        super(cause);
    }
}
