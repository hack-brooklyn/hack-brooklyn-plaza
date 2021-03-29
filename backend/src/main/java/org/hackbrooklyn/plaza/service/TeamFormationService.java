package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.CreateTFParticipantAndTeamDTO;
import org.hackbrooklyn.plaza.dto.CreateTFParticipantDTO;
import org.hackbrooklyn.plaza.dto.CreateTFTeamDTO;
import org.hackbrooklyn.plaza.model.User;

public interface TeamFormationService {

    void createParticipant(User user, CreateTFParticipantDTO participantProfileData);

    void createTeam(User user, CreateTFTeamDTO teamData);

    void createParticipantAndTeam(User user, CreateTFParticipantAndTeamDTO participantAndTeamData);
}
