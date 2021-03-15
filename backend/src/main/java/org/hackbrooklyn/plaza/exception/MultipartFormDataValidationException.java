package org.hackbrooklyn.plaza.exception;

import lombok.Getter;
import org.hackbrooklyn.plaza.model.SubmittedApplication;

import javax.validation.ConstraintViolation;
import javax.validation.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class MultipartFormDataValidationException extends RuntimeException {
    @Getter
    private final Map<Path, String> violationsMap = new HashMap<>();

    public MultipartFormDataValidationException() {
    }

    public MultipartFormDataValidationException(String message) {
        super(message);
    }

    public MultipartFormDataValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    public MultipartFormDataValidationException(Throwable cause) {
        super(cause);
    }

    public MultipartFormDataValidationException(Set<ConstraintViolation<SubmittedApplication>> violations) {
        // Iterate through violations and map the violation's property to its message
        for (ConstraintViolation<SubmittedApplication> violation : violations) {
            this.violationsMap.put(violation.getPropertyPath(), violation.getMessage());
        }
    }
}
