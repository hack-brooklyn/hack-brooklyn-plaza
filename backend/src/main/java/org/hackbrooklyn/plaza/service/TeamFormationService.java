package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.*;
import org.hackbrooklyn.plaza.model.TeamFormationParticipant;
import org.hackbrooklyn.plaza.model.TeamFormationTeam;
import org.hackbrooklyn.plaza.model.User;

public interface TeamFormationService {

    void createParticipant(User user, CreateTFParticipantDTO participantProfileData);

    void createTeam(User user, CreateTFTeamDTO teamData);

    void createParticipantAndTeam(User user, CreateTFParticipantAndTeamDTO participantAndTeamData);

    TeamFormationParticipant getLoggedInParticipantData(User user);

    TeamFormationTeam getLoggedInParticipantTeamData(User user);

    TeamFormationTeamSearchResponse getTeams(int page, int limit, boolean personalized, String searchQuery, User user);

    TeamFormationParticipantSearchResponse getParticipants(int page, int limit, boolean personalized, String searchQuery, User user);
}
