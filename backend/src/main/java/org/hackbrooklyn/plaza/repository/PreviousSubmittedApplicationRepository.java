package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.PreviousSubmittedApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PreviousSubmittedApplicationRepository extends JpaRepository<PreviousSubmittedApplication, Integer> {
    PreviousSubmittedApplication findFirstByEmailOrSchoolEmail(String email, String schoolEmail);
}
