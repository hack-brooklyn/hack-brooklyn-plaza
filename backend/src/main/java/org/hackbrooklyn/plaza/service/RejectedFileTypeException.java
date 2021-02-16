package org.hackbrooklyn.plaza.service;

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
