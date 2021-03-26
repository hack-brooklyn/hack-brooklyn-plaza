package org.hackbrooklyn.plaza.exception;

public class ApplicantNotAcceptedException extends RuntimeException {

    public ApplicantNotAcceptedException() {
    }

    public ApplicantNotAcceptedException(String message) {
        super(message);
    }

    public ApplicantNotAcceptedException(String message, Throwable cause) {
        super(message, cause);
    }

    public ApplicantNotAcceptedException(Throwable cause) {
        super(cause);
    }
}
