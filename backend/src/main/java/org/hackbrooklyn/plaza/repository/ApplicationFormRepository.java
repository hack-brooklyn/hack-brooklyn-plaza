package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.ApplicationForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationFormRepository extends JpaRepository<ApplicationForm, Integer> {

}
