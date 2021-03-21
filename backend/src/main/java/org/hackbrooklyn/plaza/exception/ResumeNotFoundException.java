package org.hackbrooklyn.plaza.exception;

public class ResumeNotFoundException extends RuntimeException {

    public ResumeNotFoundException() {
    }

    public ResumeNotFoundException(String message) {
        super(message);
    }

    public ResumeNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public ResumeNotFoundException(Throwable cause) {
        super(cause);
    }
}
