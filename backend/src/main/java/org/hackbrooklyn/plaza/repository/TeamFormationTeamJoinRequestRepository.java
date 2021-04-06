package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.TeamFormationTeam;
import org.hackbrooklyn.plaza.model.TeamFormationTeamJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamFormationTeamJoinRequestRepository extends JpaRepository<TeamFormationTeamJoinRequest, Integer> {

    List<RequestIdsOnly> findAllByRequestedTeamAndRequestAcceptedNullOrderByRequestTimestamp(TeamFormationTeam requestedTeam);

    @Query("select jr from TeamFormationTeamJoinRequest jr join fetch jr.requestingParticipant where jr.requestId = ?1")
    Optional<TeamFormationTeamJoinRequest> findByIdLoadParticipant(int id);

    interface RequestIdsOnly {

        int getRequestId();
    }
}
