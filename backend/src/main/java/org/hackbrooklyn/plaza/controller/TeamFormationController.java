package org.hackbrooklyn.plaza.controller;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.CreateTFParticipantProfileDTO;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.service.TeamFormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Void> createParticipantProfile(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateTFParticipantProfileDTO reqBody) {
        teamFormationService.createParticipantProfile(user, reqBody);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
