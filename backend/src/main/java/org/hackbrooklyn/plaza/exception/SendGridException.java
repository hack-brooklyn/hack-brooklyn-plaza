package org.hackbrooklyn.plaza.exception;

public class SendGridException extends RuntimeException {

    public SendGridException() {
    }

    public SendGridException(String message) {
        super(message);
    }

    public SendGridException(String message, Throwable cause) {
        super(message, cause);
    }

    public SendGridException(Throwable cause) {
        super(cause);
    }
}
