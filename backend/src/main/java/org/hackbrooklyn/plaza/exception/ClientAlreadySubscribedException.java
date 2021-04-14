package org.hackbrooklyn.plaza.exception;

public class ClientAlreadySubscribedException extends RuntimeException {
    public ClientAlreadySubscribedException() {
    }

    public ClientAlreadySubscribedException(String message) {
        super(message);
    }

    public ClientAlreadySubscribedException(String message, Throwable cause) {
        super(message, cause);
    }

    public ClientAlreadySubscribedException(Throwable cause) {
        super(cause);
    }
}
