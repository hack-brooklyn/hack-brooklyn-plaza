package org.hackbrooklyn.plaza.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.*;
import org.hackbrooklyn.plaza.model.*;
import org.hackbrooklyn.plaza.service.TeamFormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.Positive;

@Slf4j
@RestController
@RequestMapping("teamFormation")
public class TeamFormationController {

    private final TeamFormationService teamFormationService;

    @Autowired
    public TeamFormationController(TeamFormationService teamFormationService) {
        this.teamFormationService = teamFormationService;
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_PARTICIPANT)")
    @GetMapping("/participants")
    public ResponseEntity<TeamFormationParticipantSearchDTO> getParticipants(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "8") @Min(1) int limit,
            @RequestParam(defaultValue = "false") boolean personalized,
            @RequestParam(defaultValue = "false") boolean hideSentInvitations,
            @RequestParam(required = false) String searchQuery,
            @AuthenticationPrincipal User user
    ) {
        TeamFormationParticipantSearchDTO participants = teamFormationService.getParticipants(page, limit, personalized, hideSentInvitations, searchQuery, user);

        return new ResponseEntity<>(participants, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_CREATE_PARTICIPANT)")
    @PostMapping("/participants")
    public ResponseEntity<Void> createParticipant(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateTFParticipantDTO reqBody) {
        teamFormationService.createParticipant(user, reqBody);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_TEAM)")
    @GetMapping("/teams")
    public ResponseEntity<TeamFormationTeamSearchDTO> getTeams(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "8") @Min(1) int limit,
            @RequestParam(defaultValue = "false") boolean personalized,
            @RequestParam(defaultValue = "false") boolean hideSentJoinRequests,
            @RequestParam(required = false) String searchQuery,
            @AuthenticationPrincipal User user
    ) {
        TeamFormationTeamSearchDTO teams = teamFormationService.getTeams(page, limit, personalized, hideSentJoinRequests, searchQuery, user);

        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_CREATE_TEAM)")
    @PostMapping("/teams")
    public ResponseEntity<Void> createTeam(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateTFTeamDTO reqBody) {
        teamFormationService.createTeam(user, reqBody);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Creates a new participant profile and a new team at the same time, intended for a user's initial team formation setup.
     * Rolls back both actions if either participant creation or team creation fails.
     */
    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_CREATE_PARTICIPANT) and hasAuthority(@authorities.TEAM_FORMATION_CREATE_TEAM)")
    @PostMapping("/createParticipantAndTeam")
    public ResponseEntity<Void> createParticipantAndTeam(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateTFParticipantAndTeamDTO reqBody) {
        teamFormationService.createParticipantAndTeam(user, reqBody);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_PARTICIPANT)")
    @GetMapping("/participants/userData")
    public ResponseEntity<TeamFormationParticipant> getLoggedInParticipantData(
            @AuthenticationPrincipal User user) {
        TeamFormationParticipant foundParticipant = teamFormationService.getLoggedInParticipantData(user);

        return new ResponseEntity<>(foundParticipant, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_TEAM)")
    @GetMapping("/teams/userData")
    public ResponseEntity<TeamFormationTeam> getLoggedInParticipantTeamData(
            @AuthenticationPrincipal User user) {
        TeamFormationTeam foundTeam = teamFormationService.getLoggedInParticipantTeamData(user);

        return new ResponseEntity<>(foundTeam, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_UPDATE_PARTICIPANT)")
    @PostMapping("/teams/{teamId}/requestToJoin")
    public ResponseEntity<Void> requestToJoinTeam(
            @PathVariable @Positive int teamId,
            @RequestBody @Valid MessageDTO resBody,
            @AuthenticationPrincipal User user) {
        teamFormationService.requestToJoinTeam(teamId, resBody, user);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_UPDATE_TEAM)")
    @PostMapping("/participants/{participantId}/inviteToTeam")
    public ResponseEntity<Void> inviteParticipantToTeam(
            @PathVariable @Positive int participantId,
            @RequestBody @Valid MessageDTO resBody,
            @AuthenticationPrincipal User user) {
        teamFormationService.inviteParticipantToTeam(participantId, resBody, user);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Gets a pageable list of the messages in the requesting team's inbox.
     */
    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_TEAM)")
    @GetMapping("/teams/joinRequests")
    public ResponseEntity<TeamFormationTeamInboxDTO> getTeamInbox(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) int limit,
            @AuthenticationPrincipal User user) {
        TeamFormationTeamInboxDTO resBody = teamFormationService.getTeamInbox(page, limit, user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    /**
     * Gets a full list of the message IDs in the requesting team's inbox.
     * Includes the IDs only.
     */
    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_TEAM)")
    @GetMapping("/teams/inbox")
    public ResponseEntity<TeamFormationMessageIdsDTO> getTeamInboxMessageIds(
            @AuthenticationPrincipal User user) {
        TeamFormationMessageIdsDTO resBody = teamFormationService.getTeamInboxMessageIds(user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    /**
     * Gets the details about a single join request for a team. Only join requests that a team has received can be
     * viewed.
     */
    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_TEAM)")
    @GetMapping("/teams/joinRequests/{joinRequestId}")
    public ResponseEntity<TeamFormationTeamJoinRequest> getTeamJoinRequestDetails(
            @PathVariable @Positive int joinRequestId,
            @AuthenticationPrincipal User user) {
        TeamFormationTeamJoinRequest resBody = teamFormationService.getTeamJoinRequestDetails(joinRequestId, user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_UPDATE_TEAM)")
    @PostMapping("/teams/joinRequests/{joinRequestId}/setRequestAccepted")
    public ResponseEntity<Void> setJoinRequestAccepted(
            @PathVariable @Positive int joinRequestId,
            @RequestBody @Valid SetAcceptedRequest reqBody,
            @AuthenticationPrincipal User user) {
        teamFormationService.setTeamJoinRequestAccepted(joinRequestId, reqBody.getAccepted(), user);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Gets a pageable list of the messages in the participant's inbox.
     */
    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_PARTICIPANT)")
    @GetMapping("/participants/invitations")
    public ResponseEntity<TeamFormationParticipantInboxDTO> getParticipantInbox(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) int limit,
            @AuthenticationPrincipal User user) {
        TeamFormationParticipantInboxDTO resBody = teamFormationService.getParticipantInbox(page, limit, user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    /**
     * Gets a full list of the message IDs in the participant's inbox.
     * Includes the IDs only.
     */
    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_PARTICIPANT)")
    @GetMapping("/participants/inbox")
    public ResponseEntity<TeamFormationMessageIdsDTO> getParticipantInboxMessageIds(
            @AuthenticationPrincipal User user) {
        TeamFormationMessageIdsDTO resBody = teamFormationService.getParticipantInboxMessageIds(user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    /**
     * Gets the details about a single invitation for a participant. Only invitations that a participant has received
     * can be viewed.
     */
    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_READ_PARTICIPANT)")
    @GetMapping("/participants/invitations/{invitationId}")
    public ResponseEntity<TeamFormationParticipantInvitation> getParticipantInvitationDetails(
            @PathVariable @Positive int invitationId,
            @AuthenticationPrincipal User user) {
        TeamFormationParticipantInvitation resBody = teamFormationService.getParticipantInvitationDetails(invitationId, user);

        return new ResponseEntity<>(resBody, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_UPDATE_PARTICIPANT)")
    @PostMapping("/participants/invitations/{invitationId}/setInvitationAccepted")
    public ResponseEntity<Void> setParticipantInvitationAccepted(
            @PathVariable @Positive int invitationId,
            @RequestBody @Valid SetAcceptedRequest reqBody,
            @AuthenticationPrincipal User user) {
        teamFormationService.setParticipantInvitationAccepted(invitationId, reqBody.getAccepted(), user);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Data
    @AllArgsConstructor
    @RequiredArgsConstructor
    private static class SetAcceptedRequest {

        private Boolean accepted;
    }
}
