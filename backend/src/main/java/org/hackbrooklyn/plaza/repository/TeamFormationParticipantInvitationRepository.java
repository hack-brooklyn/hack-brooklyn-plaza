package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.TeamFormationParticipant;
import org.hackbrooklyn.plaza.model.TeamFormationParticipantInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamFormationParticipantInvitationRepository extends JpaRepository<TeamFormationParticipantInvitation, Integer> {

    List<InvitationIdsOnly> findAllByInvitedParticipantAndInvitationAcceptedNullOrderByInvitationTimestamp(TeamFormationParticipant invitedParticipant);

    @Query("select inv from TeamFormationParticipantInvitation inv join fetch inv.invitingTeam where inv.invitationId = ?1")
    Optional<TeamFormationParticipantInvitation> findByIdLoadTeam(int id);

    interface InvitationIdsOnly {

        int getInvitationId();
    }
}
