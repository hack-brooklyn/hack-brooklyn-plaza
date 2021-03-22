package org.hackbrooklyn.plaza.controller;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.LinkDTO;
import org.hackbrooklyn.plaza.dto.LinkDTO;
import org.hackbrooklyn.plaza.dto.ApplicationNumbersDTO;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;
import org.hackbrooklyn.plaza.service.ApplicationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;


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
            @RequestParam(required = false) SubmittedApplication.Decision decision) {
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

    @Data
    private static class SetApplicationDecisionRequest {

        @NotNull(message = "must be one of ACCEPTED, REJECTED, or UNDECIDED")
        private Decision decision;
    }
}
