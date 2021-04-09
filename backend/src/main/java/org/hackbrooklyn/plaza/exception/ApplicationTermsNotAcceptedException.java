package org.hackbrooklyn.plaza.exception;

public class ApplicationTermsNotAcceptedException extends RuntimeException {

    public ApplicationTermsNotAcceptedException() {
    }

    public ApplicationTermsNotAcceptedException(String message) {
        super(message);
    }

    public ApplicationTermsNotAcceptedException(String message, Throwable cause) {
        super(message, cause);
    }

    public ApplicationTermsNotAcceptedException(Throwable cause) {
        super(cause);
    }
}
