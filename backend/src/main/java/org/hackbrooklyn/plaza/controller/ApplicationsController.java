package org.hackbrooklyn.plaza.controller;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.service.ApplicationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.Min;


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
}
