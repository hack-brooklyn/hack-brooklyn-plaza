package org.hackbrooklyn.plaza.service;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.model.PreviousSubmittedApplication;
import org.hackbrooklyn.plaza.model.RegisteredInterestApplicant;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.repository.PreviousSubmittedApplicationRepository;
import org.hackbrooklyn.plaza.repository.RegisteredInterestApplicantRepository;
import org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository;
import org.hackbrooklyn.plaza.util.AwsS3Utils;
import org.hackbrooklyn.plaza.util.GeneralUtils;
import org.hibernate.Session;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManagerFactory;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
public class ApplyServiceImpl implements ApplyService {

    @Value("${AWS_S3_RESUME_DEST}")
    private String AWS_S3_RESUME_DEST;

    @Value("${PRIORITY_APPLICATIONS_ACTIVE}")
    private boolean PRIORITY_APPLICATIONS_ACTIVE;

    private static final Set<String> ALLOWED_RESUME_CONTENT_TYPES = new HashSet<>(Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/vnd.oasis.opendocument.text",
            "application/vnd.apple.pages",
            "application/rtf",
            "text/plain",
            "image/png",
            "image/jpeg"
    ));

    private final AwsS3Utils awsS3Utils;
    private final EntityManagerFactory entityManagerFactory;
    private final SubmittedApplicationRepository submittedApplicationRepository;
    private final PreviousSubmittedApplicationRepository previousSubmittedApplicationRepository;
    private final RegisteredInterestApplicantRepository registeredInterestApplicantRepository;

    @Autowired
    public ApplyServiceImpl(AwsS3Utils awsS3Utils, SubmittedApplicationRepository submittedApplicationRepository, EntityManagerFactory entityManagerFactory, PreviousSubmittedApplicationRepository previousSubmittedApplicationRepository, RegisteredInterestApplicantRepository registeredInterestApplicantRepository) {
        this.awsS3Utils = awsS3Utils;
        this.submittedApplicationRepository = submittedApplicationRepository;
        this.entityManagerFactory = entityManagerFactory;
        this.previousSubmittedApplicationRepository = previousSubmittedApplicationRepository;
        this.registeredInterestApplicantRepository = registeredInterestApplicantRepository;
    }

    @Override
    @Transactional
    public void processApplication(SubmittedApplication parsedApplication, MultipartFile resumeFile) throws Exception {
        SubmittedApplication processedApplication = new SubmittedApplication();
        BeanUtils.copyProperties(parsedApplication, processedApplication);

        // Upload resume to AWS S3 if one was submitted and retrieve file URL
        if (resumeFile != null) {
            log.info("Uploading resume to S3");
            // Validate the uploaded file before uploading
            if (!ALLOWED_RESUME_CONTENT_TYPES.contains(resumeFile.getContentType())) {
                throw new RejectedFileTypeException();
            }

            // Upload resume to S3 and save the key
            String resumeKey = awsS3Utils.uploadFormFileToAwsS3(resumeFile, AWS_S3_RESUME_DEST);
            processedApplication.setResumeKeyS3(resumeKey);

            log.info("Upload successful.");
        }

        if (PRIORITY_APPLICATIONS_ACTIVE) {
            // Check if priority applicant email is eligible
            String priorityApplicantEmail = processedApplication.getPriorityApplicantEmail();
            if (checkPriorityEligibility(priorityApplicantEmail)) {
                processedApplication.setPriorityApplicant(true);

                // Try to find a previous applicant with the email to get its application id
                // May not exist if the applicant has a Brooklyn College email but didn't apply previously
                PreviousSubmittedApplication foundApplication =
                        previousSubmittedApplicationRepository.findFirstByEmailOrSchoolEmail(priorityApplicantEmail, priorityApplicantEmail);
                if (foundApplication != null) {
                    processedApplication.setPreviousApplication(foundApplication);
                }
            } else {
                throw new PriorityApplicantIneligibleException();
            }
        }

        // Check if the applicant registered their interest early on
        String email = processedApplication.getEmail();
        RegisteredInterestApplicant foundInterestedApplicant =
                registeredInterestApplicantRepository.findFirstByEmail(email);

        if (foundInterestedApplicant != null) {
            processedApplication.setRegisteredInterest(true);
            processedApplication.setRegisteredInterestApplicant(foundInterestedApplicant);
        }

        // Save the processed application in the database
        submittedApplicationRepository.save(processedApplication);
    }

    /**
     * Checks if an applicant is eligible to be a priority applicant.
     * An applicant is eligible if they have applied before and/or are a Brooklyn College student.
     *
     * @param email The applicant's email to check.
     * @return Whether or not the applicant is eligible to be a priority applicant.
     */
    @Override
    @Transactional
    public boolean checkPriorityEligibility(String email) {
        // Check if the email is a Brooklyn College email first
        if (GeneralUtils.checkIsBrooklynCollegeEmail(email)) {
            return true;
        }

        // Email is not a Brooklyn College email, check if the applicant applied before by checking if the applicant's
        // email is in the previous applicant table
        //
        // Hibernate does not have support for UNIONs
        // Get Hibernate's JDBC connection and run custom SQL query
        // https://hibernate.atlassian.net/browse/HHH-1050
        Session session = entityManagerFactory.createEntityManager().unwrap(Session.class);

        // Execute custom query and check if email exists in the union
        boolean isApplicantEligible = session.doReturningWork(connection -> {
            // Prepare email search statement to avoid SQL injection
            String emailStatement = "SELECT email FROM (SELECT email FROM previous_submitted_applications UNION DISTINCT SELECT school_email FROM previous_submitted_applications) AS all_emails WHERE all_emails.email = ?;";
            PreparedStatement preparedStatement = connection.prepareStatement(emailStatement);
            preparedStatement.setString(1, email);

            // If there is no email found, the applicant hasn't applied before
            ResultSet resultSet = preparedStatement.executeQuery();
            return resultSet.isBeforeFirst();
        });

        // Close created factory session before returning
        session.close();
        return isApplicantEligible;
    }
}