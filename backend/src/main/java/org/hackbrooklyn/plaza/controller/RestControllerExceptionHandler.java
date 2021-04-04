package org.hackbrooklyn.plaza.controller;

import com.fasterxml.jackson.core.JsonParseException;
import org.hackbrooklyn.plaza.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.validation.ConstraintViolationException;
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

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(ApplicationNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleApplicationNotFoundException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "No application was found with the provided data.");

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ApplicantNotAcceptedException.class)
    public ResponseEntity<Map<String, String>> handleApplicantNotAcceptedException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "The applicant with this email has not been accepted to Hack Brooklyn.");

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(AccountAlreadyActivatedException.class)
    public ResponseEntity<Map<String, String>> handleAccountAlreadyActivatedException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "An account has already been activated with the email provided.");

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentialsException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "The email or password provided is incorrect. Please try again.");

        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ResponseStatus(HttpStatus.BAD_GATEWAY)
    @ExceptionHandler(SendGridException.class)
    public ResponseEntity<Map<String, String>> handleSendGridException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "An error occurred while sending an email. Please try again.");

        return new ResponseEntity<>(body, HttpStatus.BAD_GATEWAY);
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(InvalidKeyException.class)
    public ResponseEntity<Map<String, String>> handleInvalidKeyException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "The key provided is invalid. Please try again.");

        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidTokenException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "The token provided is invalid and/or has expired. Please try again.");

        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFoundException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "No user was found. Please try again.");

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolationException(ConstraintViolationException e) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "One or more submitted values failed validation. Please try again.");
        body.put("errors", e.getLocalizedMessage());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "There were errors with your request. Please correct them and try again.");
        body.put("error", e.getLocalizedMessage());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(ResumeNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResumeNotFoundException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "No uploaded resume was found for the requested application.");

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "There were invalid parameters passed with the request. Please correct them and try again.");
        body.put("error", e.getMessage());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(TeamFormationParticipantAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleTeamFormationParticipantAlreadyExistsException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "You have already created a team formation participant profile.");

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(TeamFormationParticipantNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleTeamFormationParticipantNotFoundException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "No team formation participant was found.");

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
    
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(AnnouncementNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleAnnouncementNotFoundException() {
        Map<String, String> body = new HashMap<>();
        body.put("message", "No announcement was found with the requested id");

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
}
