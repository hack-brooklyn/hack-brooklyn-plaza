package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.RegisteredInterestApplicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegisteredInterestApplicantRepository extends JpaRepository<RegisteredInterestApplicant, Integer> {
    RegisteredInterestApplicant findFirstByEmail(String email);
}
