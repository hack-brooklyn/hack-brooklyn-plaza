package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.TeamFormationTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamFormationTeamRepository extends JpaRepository<TeamFormationTeam, Integer> {

    Optional<TeamFormationTeam> findFirstByName(String name);
}
