package org.hackbrooklyn.plaza.exception;

public class AnnouncementNotFoundException extends RuntimeException {

    public AnnouncementNotFoundException() {
    }

    public AnnouncementNotFoundException(String message) { super(message); }

    public AnnouncementNotFoundException(String message, Throwable cause) { super(message, cause); }

    public AnnouncementNotFoundException(Throwable cause) { super(cause); }

}
