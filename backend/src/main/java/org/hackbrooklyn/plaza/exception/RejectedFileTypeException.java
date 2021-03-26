package org.hackbrooklyn.plaza.exception;

public class RejectedFileTypeException extends RuntimeException {
    public RejectedFileTypeException() {
    }

    public RejectedFileTypeException(String message) {
        super(message);
    }

    public RejectedFileTypeException(String message, Throwable cause) {
        super(message, cause);
    }

    public RejectedFileTypeException(Throwable cause) {
        super(cause);
    }
}
