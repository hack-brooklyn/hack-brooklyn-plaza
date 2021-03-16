package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.dto.ApplicationManagerDTO;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository;
import org.hackbrooklyn.plaza.service.ApplicationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ApplicationsServiceImpl implements ApplicationsService {

    private final SubmittedApplicationRepository submittedApplicationRepository;

    @Autowired
    public ApplicationsServiceImpl(SubmittedApplicationRepository submittedApplicationRepository) {
        this.submittedApplicationRepository = submittedApplicationRepository;
    }

    @Override
    public MultipleApplicationsResponse getMultipleApplications(int page, int limit, String searchQuery, SubmittedApplication.Decision decision) {
        Pageable pageRequest = PageRequest.of(page - 1, limit, Sort.by("applicationNumber"));
        Page<SubmittedApplication> applicationsPage;

        if (searchQuery != null) {
            applicationsPage = submittedApplicationRepository.findAll(containsTextInNameOrEmail(searchQuery), pageRequest);
        } else {
            applicationsPage = submittedApplicationRepository.findAll(pageRequest);
        }

        List<SubmittedApplication> applicationList = applicationsPage.toList();

        // Return only queried decisions
        if (decision != null) {
            applicationList = applicationList.stream()
                    .filter(application -> application.getDecision() == decision)
                    .collect(Collectors.toList());
        }

        // Map each submitted application to application lite DTOs
        Collection<ApplicationManagerDTO> applicationLites = new ArrayList<>(applicationList.size());
        for (SubmittedApplication application : applicationList) {
            applicationLites.add(new ApplicationManagerDTO(
                    application.getApplicationNumber(),
                    application.getApplicationTimestamp(),
                    application.getFirstName(),
                    application.getLastName(),
                    application.getEmail(),
                    application.getDecision()
            ));
        }

        int totalPages = applicationsPage.getTotalPages();
        long totalApplications = applicationsPage.getTotalElements();
        long totalUndecidedApplications = submittedApplicationRepository.countByDecision(SubmittedApplication.Decision.UNDECIDED);

        return new MultipleApplicationsResponse(
                applicationLites,
                totalPages,
                totalApplications,
                totalUndecidedApplications
        );
    }

    private Specification<SubmittedApplication> containsTextInNameOrEmail(String text) {
        if (!text.contains("%")) {
            text = "%" + text + "%";
        }

        String finalText = text.toLowerCase(Locale.ROOT);
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("firstName")), finalText),
                builder.like(builder.lower(root.get("lastName")), finalText),
                builder.like(builder.lower(root.get("email")), finalText)
        );
    }
}
