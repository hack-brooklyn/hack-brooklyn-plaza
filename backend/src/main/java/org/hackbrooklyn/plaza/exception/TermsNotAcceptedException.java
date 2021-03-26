package org.hackbrooklyn.plaza.exception;

public class TermsNotAcceptedException extends RuntimeException {

    public TermsNotAcceptedException() {
    }

    public TermsNotAcceptedException(String message) {
        super(message);
    }

    public TermsNotAcceptedException(String message, Throwable cause) {
        super(message, cause);
    }

    public TermsNotAcceptedException(Throwable cause) {
        super(cause);
    }
}
