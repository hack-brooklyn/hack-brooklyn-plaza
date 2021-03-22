package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmittedApplicationRepository extends JpaRepository<SubmittedApplication, Integer> {
    Page<SubmittedApplication> findAll(Specification<SubmittedApplication> spec, Pageable pageable);

    Optional<SubmittedApplication> findFirstByEmail(String email);

    Optional<SubmittedApplication> findFirstByApplicationNumber(int applicationNumber);

    SubmittedApplication findFirstByEmailOrPriorityApplicantEmail(String email, String priorityApplicantEmail);

    long countByDecision(Decision decision);

    @Transactional
    void deleteByApplicationNumber(int applicationNumber);

    List<ApplicationNumbersOnly> findAllByDecisionOrderByApplicationNumber(Decision decision);

    interface ApplicationNumbersOnly {
        int getApplicationNumber();
    }
}
