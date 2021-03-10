package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.PasswordReset;
import org.hackbrooklyn.plaza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Integer> {
    Optional<PasswordReset> findFirstByPasswordResetKey(String passwordResetKey);

    @Transactional
    void deleteAllByResettingUser(User user);
}
