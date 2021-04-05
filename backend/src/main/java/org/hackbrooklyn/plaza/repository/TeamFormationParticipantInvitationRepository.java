package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.TeamFormationParticipantInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamFormationParticipantInvitationRepository extends JpaRepository<TeamFormationParticipantInvitation, Integer> {

}
