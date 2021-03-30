package org.hackbrooklyn.plaza.controller;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.CreateTFParticipantAndTeamDTO;
import org.hackbrooklyn.plaza.dto.CreateTFParticipantDTO;
import org.hackbrooklyn.plaza.dto.CreateTFTeamDTO;
import org.hackbrooklyn.plaza.model.TeamFormationParticipant;
import org.hackbrooklyn.plaza.model.TeamFormationTeam;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.service.TeamFormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;


@Slf4j
@RestController
@RequestMapping("teamFormation")
public class TeamFormationController {

    private final TeamFormationService teamFormationService;

    @Autowired
    public TeamFormationController(TeamFormationService teamFormationService) {
        this.teamFormationService = teamFormationService;
    }

    @PreAuthorize("hasAuthority(@authorities.TEAM_FORMATION_CREATE_PARTICIPANT)")
    @PostMapping("/participants")
    public ResponseEntity<Void> createParticipant(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateTFParticipantDTO reqBody) {
        teamFormationService.createParticipant(user, reqBody);

        return new ResponseEntity<>(HttpStatus.OK);
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
}
