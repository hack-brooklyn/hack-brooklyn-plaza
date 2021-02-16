package org.hackbrooklyn.plaza.service;

public class FoundDataConflictException extends RuntimeException {

    public FoundDataConflictException() {
    }

    public FoundDataConflictException(String message) {
        super(message);
    }

    public FoundDataConflictException(String message, Throwable cause) {
        super(message, cause);
    }

    public FoundDataConflictException(Throwable cause) {
        super(cause);
    }
}
