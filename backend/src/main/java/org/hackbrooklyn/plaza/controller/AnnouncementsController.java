package org.hackbrooklyn.plaza.controller;

import lombok.Data;
import org.hackbrooklyn.plaza.model.Announcement;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Positive;
import java.util.Collection;

@Validated
@RestController
@RequestMapping("/announcements")
public class AnnouncementsController {

    private final AnnouncementService announcementService;

    @Autowired
    public AnnouncementsController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PreAuthorize("hasAuthority(@authorities.ANNOUNCEMENTS_READ_PUBLIC)")
    @GetMapping
    public ResponseEntity<Collection<Announcement>> getAnnouncements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        Collection<Announcement> announcements = announcementService.getMultipleAnnouncements(page, limit);
        return new ResponseEntity<>(announcements, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.ANNOUNCEMENTS_CREATE)")
    @PostMapping
    public ResponseEntity<Void> addAnnouncement(@AuthenticationPrincipal User user, @RequestBody @Valid AnnouncementBodyRequest reqBody) {
        int id = announcementService.createNewAnnouncement(reqBody.getBody(), user);
        String location = "/announcements/" + id;
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", location);

        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority(@authorities.ANNOUNCEMENTS_UPDATE)")
    @PutMapping("/{announcementId}")
    public ResponseEntity<Void> updateAnnouncement(@PathVariable @Positive int announcementId, @RequestBody @Valid AnnouncementBodyRequest reqBody) {
        announcementService.updateAnnouncement(announcementId, reqBody.getBody());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Data
    private static class AnnouncementBodyRequest {

        @NotBlank
        private String body;

    }

}
