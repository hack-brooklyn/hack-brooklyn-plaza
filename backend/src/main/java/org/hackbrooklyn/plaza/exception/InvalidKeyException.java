package org.hackbrooklyn.plaza.exception;

public class InvalidKeyException extends RuntimeException {

    public InvalidKeyException() {
    }

    public InvalidKeyException(String message) {
        super(message);
    }

    public InvalidKeyException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidKeyException(Throwable cause) {
        super(cause);
    }
}
