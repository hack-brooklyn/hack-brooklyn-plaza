package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmittedApplicationRepository extends JpaRepository<SubmittedApplication, Integer> {
    Optional<SubmittedApplication> findFirstByEmail(String email);

    SubmittedApplication findFirstByEmailOrPriorityApplicantEmail(String email, String priorityApplicantEmail);
}
