package org.hackbrooklyn.plaza.service;

import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.hackbrooklyn.plaza.dto.ApplicationNumbersDTO;
import org.hackbrooklyn.plaza.dto.LinkDTO;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.model.SubmittedApplication;

import java.io.IOException;

import static org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;
import static org.hackbrooklyn.plaza.model.SubmittedApplication.ExportFormat;

public interface ApplicationsService {

    MultipleApplicationsResponse getMultipleApplications(int page, int limit, String searchQuery, Decision decision);

    SubmittedApplication getIndividualApplication(int applicationNumber);

    void setApplicationDecision(int applicationNumber, Decision decision);

    void deleteApplication(int applicationNumber);

    LinkDTO getResumeLink(int applicationNumber);

    ApplicationNumbersDTO getUndecidedApplicationNumbers();

    byte[] exportApplications(ExportFormat exportType) throws IOException, CsvDataTypeMismatchException, CsvRequiredFieldEmptyException;
}
