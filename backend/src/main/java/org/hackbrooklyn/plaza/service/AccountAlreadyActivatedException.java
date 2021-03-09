package org.hackbrooklyn.plaza.service;

public class AccountAlreadyActivatedException extends RuntimeException {

    public AccountAlreadyActivatedException() {
    }

    public AccountAlreadyActivatedException(String message) {
        super(message);
    }

    public AccountAlreadyActivatedException(String message, Throwable cause) {
        super(message, cause);
    }

    public AccountAlreadyActivatedException(Throwable cause) {
        super(cause);
    }
}
