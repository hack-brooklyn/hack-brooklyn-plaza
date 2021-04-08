package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.*;
import org.hackbrooklyn.plaza.model.*;

public interface TeamFormationService {

    void createParticipant(User user, TeamFormationParticipantFormDataDTO participantProfileData);

    void createTeam(User user, TeamFormationTeamFormDataDTO teamData);

    void createParticipantAndTeam(CreateTeamFormationParticipantAndTeamDTO participantAndTeamData, User user);

    TeamFormationParticipant getLoggedInParticipantData(User user);

    TeamFormationTeam getLoggedInParticipantTeamData(User user);

    TeamFormationTeamSearchDTO getTeams(int page, int limit, boolean personalized, boolean hideSentJoinRequests, String searchQuery, User user);

    TeamFormationParticipantSearchDTO getParticipants(int page, int limit, boolean personalized, boolean hideSentInvitations, String searchQuery, User user);

    void requestToJoinTeam(int teamId, MessageDTO requestData, User user);

    void inviteParticipantToTeam(int participantId, MessageDTO resBody, User user);

    TeamFormationTeamInboxDTO getTeamInbox(int page, int limit, User user);

    TeamFormationMessageIdsDTO getTeamInboxMessageIds(User user);

    TeamFormationTeamJoinRequest getTeamJoinRequestDetails(int joinRequestId, User user);

    void setTeamJoinRequestAccepted(int joinRequestId, Boolean requestAccepted, User user);

    TeamFormationParticipantInboxDTO getParticipantInbox(int page, int limit, User user);

    TeamFormationMessageIdsDTO getParticipantInboxMessageIds(User user);

    TeamFormationParticipantInvitation getParticipantInvitationDetails(int invitationId, User user);

    void setParticipantInvitationAccepted(int invitationId, Boolean invitationAccepted, User user);

    void updateLoggedInParticipantData(TeamFormationParticipantFormDataWithBrowserVisibilityDTO submittedData, User user);

    void updateLoggedInParticipantTeamData(TeamFormationTeamFormDataWithBrowserVisibilityDTO submittedData, User user);

    void removeMemberFromLoggedInParticipantTeam(int participantId, User user);

    void deleteLoggedInParticipantTeam(User user);

    void leaveTeam(User user);
}
