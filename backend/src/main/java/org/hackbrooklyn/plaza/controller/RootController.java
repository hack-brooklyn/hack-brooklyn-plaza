package org.hackbrooklyn.plaza.controller;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.ChecklistLinksDTO;
import org.hackbrooklyn.plaza.service.RootService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/")
public class RootController {

    private final RootService rootService;

    @Autowired
    public RootController(RootService rootService) {
        this.rootService = rootService;
    }

    @GetMapping
    public ResponseEntity<Void> pingRoot() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.PARTICIPANT_CHECKLIST_READ)")
    @GetMapping(path = "checklistLinks")
    public ResponseEntity<ChecklistLinksDTO> getChecklistLinks() {
        ChecklistLinksDTO response = rootService.getChecklistLinks();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
