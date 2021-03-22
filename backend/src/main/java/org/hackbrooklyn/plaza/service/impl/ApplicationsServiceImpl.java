package org.hackbrooklyn.plaza.service.impl;

import com.google.common.primitives.Ints;
import org.hackbrooklyn.plaza.dto.ApplicationManagerEntryDTO;
import org.hackbrooklyn.plaza.dto.ApplicationNumbersDTO;
import org.hackbrooklyn.plaza.dto.MultipleApplicationsResponse;
import org.hackbrooklyn.plaza.exception.ApplicationNotFoundException;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.SubmittedApplication_;
import org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository;
import org.hackbrooklyn.plaza.service.ApplicationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import static org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;
import static org.hackbrooklyn.plaza.repository.SubmittedApplicationRepository.ApplicationNumbersOnly;

@Service
public class ApplicationsServiceImpl implements ApplicationsService {

    private final SubmittedApplicationRepository submittedApplicationRepository;
    private final EntityManager entityManager;

    @Autowired
    public ApplicationsServiceImpl(SubmittedApplicationRepository submittedApplicationRepository, EntityManager entityManager) {
        this.submittedApplicationRepository = submittedApplicationRepository;
        this.entityManager = entityManager;
    }

    @Override
    public MultipleApplicationsResponse getMultipleApplications(int page, int limit, String searchQuery, Decision decision) {
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
        long totalUndecidedApplications = submittedApplicationRepository.countByDecision(Decision.UNDECIDED);

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
    public void setApplicationDecision(int applicationNumber, Decision decision) {
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
    public ApplicationNumbersDTO getUndecidedApplicationNumbers() {
        List<ApplicationNumbersOnly> applications = submittedApplicationRepository.findAllByDecisionOrderByApplicationNumber(Decision.UNDECIDED);

        // Convert ApplicationNumbersOnly projection to list of Integers
        List<Integer> applicationNumbers = applications.stream()
                .map(ApplicationNumbersOnly::getApplicationNumber)
                .collect(Collectors.toList());

        return new ApplicationNumbersDTO(Ints.toArray(applicationNumbers));
    }
}
