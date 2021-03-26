package org.hackbrooklyn.plaza.controller;

import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.ApplicationNumbersDTO;
import org.hackbrooklyn.plaza.dto.LinkDTO;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;
import org.hackbrooklyn.plaza.service.ApplicationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.io.IOException;

import static org.hackbrooklyn.plaza.model.SubmittedApplication.ExportFormat;


@Slf4j
@Validated
@RestController
@RequestMapping("applications")
public class ApplicationsController {

    private final ApplicationsService applicationsService;

    @Autowired
    public ApplicationsController(ApplicationsService applicationsService) {
        this.applicationsService = applicationsService;
    }

    @PreAuthorize("hasAuthority(@authorities.APPLICATIONS_READ)")
    @GetMapping
    public ResponseEntity<MultipleApplicationsResponse> getMultipleApplications(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "25") @Min(1) int limit,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false) Decision decision) {
        MultipleApplicationsResponse foundApplications = applicationsService.getMultipleApplications(page, limit, searchQuery, decision);

        return new ResponseEntity<>(foundApplications, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.APPLICATIONS_READ)")
    @GetMapping("/{applicationNumber}")
    public ResponseEntity<SubmittedApplication> getSingleApplication(@PathVariable @Valid int applicationNumber) {
        SubmittedApplication foundApplication = applicationsService.getIndividualApplication(applicationNumber);

        return new ResponseEntity<>(foundApplication, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.APPLICATIONS_DELETE)")
    @DeleteMapping("/{applicationNumber}")
    public ResponseEntity<Void> deleteApplication(@PathVariable @Valid int applicationNumber) {
        applicationsService.deleteApplication(applicationNumber);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.APPLICATIONS_READ)")
    @GetMapping("/undecidedApplicationNumbers")
    public ResponseEntity<ApplicationNumbersDTO> getUndecidedApplicationNumbers() {
        ApplicationNumbersDTO applicationNumbers = applicationsService.getUndecidedApplicationNumbers();

        return new ResponseEntity<>(applicationNumbers, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.APPLICATIONS_UPDATE_DECISION)")
    @PostMapping("/{applicationNumber}/setDecision")
    public ResponseEntity<Void> setApplicationDecision(
            @PathVariable @Valid int applicationNumber,
            @RequestBody @Valid SetApplicationDecisionRequest reqBody) {
        Decision newDecision = reqBody.getDecision();
        applicationsService.setApplicationDecision(applicationNumber, newDecision);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.APPLICATIONS_RESUME_DOWNLOAD)")
    @GetMapping("/{applicationNumber}/generateResumeLink")
    public ResponseEntity<LinkDTO> getResumeLink(@PathVariable @Valid int applicationNumber) {
        LinkDTO resumeLinkS3 = applicationsService.getResumeLink(applicationNumber);

        return new ResponseEntity<>(resumeLinkS3, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.APPLICATIONS_READ)")
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportApplications(@RequestParam @Valid ExportFormat type)
            throws CsvRequiredFieldEmptyException, IOException, CsvDataTypeMismatchException {
        byte[] exportedFile = applicationsService.exportApplications(type);

        String contentType;
        switch (type) {
            case CSV:
                contentType = "text/csv";
                break;
            case JSON:
                contentType = "application/json";
                break;
            case XML:
                contentType = "application/xml";
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + type);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", contentType);

        return new ResponseEntity<>(exportedFile, headers, HttpStatus.OK);
    }

    @Data
    private static class SetApplicationDecisionRequest {

        @NotNull(message = "must be one of ACCEPTED, REJECTED, or UNDECIDED")
        private Decision decision;
    }
}
