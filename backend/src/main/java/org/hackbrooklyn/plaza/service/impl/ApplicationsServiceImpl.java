package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.dto.ApplicationManagerEntryDTO;
import org.hackbrooklyn.plaza.dto.LinkDTO;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.exception.ApplicationNotFoundException;
import org.hackbrooklyn.plaza.exception.ResumeNotFoundException;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.SubmittedApplication_;
import org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository;
import org.hackbrooklyn.plaza.service.ApplicationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class ApplicationsServiceImpl implements ApplicationsService {

    @Value("${AWS_S3_BUCKET}")
    private String AWS_S3_BUCKET;

    @Value("${AWS_SIGNED_URL_DURATION_MS}")
    private long AWS_SIGNED_URL_DURATION_MS;

    private final SubmittedApplicationRepository submittedApplicationRepository;
    private final EntityManager entityManager;
    private final S3Presigner s3Presigner;

    @Autowired
    public ApplicationsServiceImpl(SubmittedApplicationRepository submittedApplicationRepository, EntityManager entityManager, S3Presigner s3Presigner) {
        this.submittedApplicationRepository = submittedApplicationRepository;
        this.entityManager = entityManager;
        this.s3Presigner = s3Presigner;
    }

    @Override
    public MultipleApplicationsResponse getMultipleApplications(int page, int limit, String searchQuery, SubmittedApplication.Decision decision) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<SubmittedApplication> query = cb.createQuery(SubmittedApplication.class);

        // Query for submitted applications and apply sorting and filters if provided
        Root<SubmittedApplication> applications = query.from(SubmittedApplication.class);
        query.select(applications);

        // Filter by search query on first name, last name, and email if a query was provided
        if (searchQuery != null) {
            String searchQueryPattern = "%" + searchQuery.toLowerCase() + "%";
            query.where(cb.or(
                    cb.like(cb.lower(applications.get(SubmittedApplication_.firstName)), searchQueryPattern),
                    cb.like(cb.lower(applications.get(SubmittedApplication_.lastName)), searchQueryPattern),
                    cb.like(cb.lower(applications.get(SubmittedApplication_.email)), searchQueryPattern)
            ));
        }

        // Filter by decision if one was provided
        if (decision != null) {
            query.where(cb.equal(applications.get(SubmittedApplication_.decision), decision));
        }

        // Finish query and get results
        query.orderBy(cb.asc(applications.get(SubmittedApplication_.applicationNumber)));
        TypedQuery<SubmittedApplication> typedQuery = entityManager.createQuery(query);

        // Get total count and results from query
        long foundApplicationsCount = typedQuery.getResultList().size();
        int totalPages = (int) Math.ceil((double) foundApplicationsCount / limit);

        // Get paginated applications from query
        typedQuery.setFirstResult((page - 1) * limit);
        typedQuery.setMaxResults(limit);
        List<SubmittedApplication> foundApplications = typedQuery.getResultList();

        // Map each submitted application to application manager entry DTOs
        Collection<ApplicationManagerEntryDTO> applicationManagerEntries = new ArrayList<>(foundApplications.size());
        for (SubmittedApplication application : foundApplications) {
            applicationManagerEntries.add(new ApplicationManagerEntryDTO(
                    application.getApplicationNumber(),
                    application.getApplicationTimestamp(),
                    application.getFirstName(),
                    application.getLastName(),
                    application.getEmail(),
                    application.getDecision()
            ));
        }

        // Retrieve the amount of undecided applications in the database independent of the request's queries
        long totalUndecidedApplications = submittedApplicationRepository.countByDecision(SubmittedApplication.Decision.UNDECIDED);

        return new MultipleApplicationsResponse(
                applicationManagerEntries,
                totalPages,
                foundApplicationsCount,
                totalUndecidedApplications
        );
    }

    @Override
    public SubmittedApplication getIndividualApplication(int applicationNumber) {
        return submittedApplicationRepository
                .findFirstByApplicationNumber(applicationNumber)
                .orElseThrow(ApplicationNotFoundException::new);
    }

    @Override
    public void setApplicationDecision(int applicationNumber, SubmittedApplication.Decision decision) {
        SubmittedApplication foundApplication = submittedApplicationRepository
                .findFirstByApplicationNumber(applicationNumber)
                .orElseThrow(ApplicationNotFoundException::new);

        foundApplication.setDecision(decision);

        submittedApplicationRepository.save(foundApplication);
    }

    @Override
    public void deleteApplication(int applicationNumber) {
        // Check if the application exists and throw a 404 Not Found error if it doesn't exist
        submittedApplicationRepository
                .findFirstByApplicationNumber(applicationNumber)
                .orElseThrow(ApplicationNotFoundException::new);

        // Application exists, proceed to delete it
        submittedApplicationRepository.deleteByApplicationNumber(applicationNumber);
    }

    @Override
    public LinkDTO getResumeLink(int applicationNumber) {
        SubmittedApplication application = submittedApplicationRepository
                .findFirstByApplicationNumber(applicationNumber)
                .orElseThrow(ApplicationNotFoundException::new);

        if (application.getResumeKeyS3() == null) {
            throw new ResumeNotFoundException();
        }

        // Resume exists, generate a presigned URL to the uploaded resume on AWS S3
        GetObjectRequest getObjectRequest =
                GetObjectRequest.builder()
                        .bucket(AWS_S3_BUCKET)
                        .key(application.getResumeKeyS3())
                        .build();

        GetObjectPresignRequest getObjectPresignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMillis(AWS_SIGNED_URL_DURATION_MS))
                        .getObjectRequest(getObjectRequest)
                        .build();

        PresignedGetObjectRequest presignedGetObjectRequest =
                s3Presigner.presignGetObject(getObjectPresignRequest);

        return new LinkDTO(presignedGetObjectRequest.url().toString());
    }
}
