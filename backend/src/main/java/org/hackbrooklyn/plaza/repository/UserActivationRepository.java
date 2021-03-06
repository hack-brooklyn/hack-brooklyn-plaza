package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.model.UserActivation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserActivationRepository extends JpaRepository<UserActivation, Integer> {
    Optional<UserActivation> findFirstByActivationKey(String activationKey);

    @Transactional
    void deleteAllByActivatingApplication(SubmittedApplication activatingApplication);
}
