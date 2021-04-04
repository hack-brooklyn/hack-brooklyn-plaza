package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.TeamFormationTeamJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamFormationTeamJoinRequestRepository extends JpaRepository<TeamFormationTeamJoinRequest, Integer> {

}
