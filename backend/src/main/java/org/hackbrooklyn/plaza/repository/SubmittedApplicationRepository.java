package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmittedApplicationRepository extends JpaRepository<SubmittedApplication, Integer> {
    Page<SubmittedApplication> findAll(Specification<SubmittedApplication> spec, Pageable pageable);

    Optional<SubmittedApplication> findFirstByEmail(String email);

    Optional<SubmittedApplication> findFirstByApplicationNumber(int applicationNumber);

    SubmittedApplication findFirstByEmailOrPriorityApplicantEmail(String email, String priorityApplicantEmail);

    long countByDecision(SubmittedApplication.Decision decision);
}
