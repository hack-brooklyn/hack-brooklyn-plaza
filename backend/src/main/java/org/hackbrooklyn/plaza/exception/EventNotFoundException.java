package org.hackbrooklyn.plaza.exception;

public class EventNotFoundException extends RuntimeException {

    public EventNotFoundException() {
    }

    public EventNotFoundException(String message) { super(message); }

    public EventNotFoundException(String message, Throwable cause) { super(message, cause); }

    public EventNotFoundException(Throwable cause) { super(cause); }

}
