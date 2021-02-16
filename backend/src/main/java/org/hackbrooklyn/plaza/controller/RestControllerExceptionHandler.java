package org.hackbrooklyn.plaza.controller;

import com.fasterxml.jackson.core.JsonParseException;
import org.hackbrooklyn.plaza.service.FoundDataConflictException;
import org.hackbrooklyn.plaza.service.PriorityApplicantIneligibleException;
import org.hackbrooklyn.plaza.service.RejectedFileTypeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class RestControllerExceptionHandler {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, Object>> handleBindException(BindException e) {
        // Map errored fields and messages from binding result
        BindingResult bindingResult = e.getBindingResult();
        Map<String, String> bindingErrors = new HashMap<>();
        for (FieldError error : bindingResult.getFieldErrors()) {
            bindingErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("message", "The submitted data failed validation. Please correct the listed errors and try again.");
        body.put("errors", bindingErrors);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(RejectedFileTypeException.class)
    public ResponseEntity<Map<String, String>> handleRejectedFileTypeException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "The file you uploaded is not allowed. Please upload a supported file.");

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MultipartFormDataValidationException.class)
    public ResponseEntity<Map<String, Object>> handleMultipartFormDataValidationException(MultipartFormDataValidationException e) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "The submitted multipart form data failed validation. Please correct the listed errors and try again.");
        body.put("errors", e.getViolationsMap());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(JsonParseException.class)
    public ResponseEntity<Map<String, String>> handleJsonParseException(JsonParseException e) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Error parsing JSON. Check your request body for any JSON syntax errors.");
        body.put("error", e.getMessage());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Triggered when an applicant tries to apply during the priority application period, but is ineligible to do so.
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(PriorityApplicantIneligibleException.class)
    public ResponseEntity<Map<String, String>> handlePriorityApplicantIneligibleException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "The submitted priority applicant email is not eligible for priority consideration at this time.");

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(FoundDataConflictException.class)
    public ResponseEntity<Map<String, String>> handleFoundDataConflictException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "There is conflicting data found in the database.");

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }
}
