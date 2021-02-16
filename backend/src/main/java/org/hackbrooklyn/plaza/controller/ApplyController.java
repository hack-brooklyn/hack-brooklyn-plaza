package org.hackbrooklyn.plaza.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.service.ApplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.ConstraintViolation;
import javax.validation.Valid;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.util.Set;

@Slf4j
@RestController
@CrossOrigin
@RequestMapping("/apply")
public class ApplyController {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final ApplyService applyService;
    private final Validator validator;

    @Autowired
    public ApplyController(ApplyService applyService) {
        this.applyService = applyService;
        this.validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    // There are two parts to the uploaded application - the resume file and the submitted application data.
    // The submitted application data is serialized to JSON by the client to retain strong data typing
    @PostMapping
    public ResponseEntity<Void> processApplication(@Valid ApplicationFormRequest applicationFormRequest) throws Exception {
        // Parse the JSON from submitted form multipart data
        ObjectReader reader = objectMapper.reader();
        SubmittedApplication parsedApplication = reader.readValue(applicationFormRequest.getFormDataJson(), SubmittedApplication.class);
        MultipartFile resumeFile = applicationFormRequest.getResumeFile();

        // Because the submitted data is JSON serialized in a multipart form field, we can't automatically verify it
        // Validate the parsed body input before submitting
        Set<ConstraintViolation<SubmittedApplication>> violations = validator.validate(parsedApplication);
        if (violations.size() > 0) {
            throw new MultipartFormDataValidationException(violations);
        }

        // Form data is valid, save the application in the database
        applyService.processApplication(parsedApplication, resumeFile);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/checkPriorityEligibility")
    public ResponseEntity<CheckPriorityEligibilityResponse> checkPriorityEligibility(
            @RequestBody @Valid CheckPriorityEligibilityRequest request) {
        String email = request.getEmail();

        CheckPriorityEligibilityResponse response = new CheckPriorityEligibilityResponse();
        response.setEligible(applyService.checkPriorityEligibility(email));

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @RequiredArgsConstructor
    @Getter
    private static class ApplicationFormRequest {
        private final MultipartFile resumeFile;

        @NotBlank
        private final String formDataJson;
    }

    @Data
    private static class CheckPriorityEligibilityRequest {
        @Email
        private String email;
    }

    @Data
    private static class CheckPriorityEligibilityResponse {
        private boolean eligible;
    }
}
