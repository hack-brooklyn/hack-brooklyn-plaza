package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.TopicOrSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicOrSkillRepository extends JpaRepository<TopicOrSkill, Integer> {

    Optional<TopicOrSkill> findFirstByName(String name);
}
