package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.LinkDTO;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.model.SubmittedApplication;

public interface ApplicationsService {

    MultipleApplicationsResponse getMultipleApplications(int page, int limit, String searchQuery, SubmittedApplication.Decision decision);

    SubmittedApplication getIndividualApplication(int applicationNumber);

    void setApplicationDecision(int applicationNumber, SubmittedApplication.Decision decision);

    void deleteApplication(int applicationNumber);

    LinkDTO getResumeLink(int applicationNumber);
}
