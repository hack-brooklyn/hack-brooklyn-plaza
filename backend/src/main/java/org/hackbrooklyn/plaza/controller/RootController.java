package org.hackbrooklyn.plaza.controller;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/")
public class RootController {

    @GetMapping
    public ResponseEntity<Void> pingRoot() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.ANNOUNCEMENTS_READ_PUBLIC)")
    @GetMapping("restrictedRoute")
    public ResponseEntity<Void> restrictedRoute(@AuthenticationPrincipal User user) {
        log.info(String.valueOf(user));
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.ANNOUNCEMENTS_CREATE)")
    @GetMapping("superRestrictedRoute")
    public ResponseEntity<Void> superRestrictedRoute() {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
