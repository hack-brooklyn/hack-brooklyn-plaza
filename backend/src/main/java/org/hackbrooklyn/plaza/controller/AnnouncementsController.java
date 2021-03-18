package org.hackbrooklyn.plaza.controller;

import org.hackbrooklyn.plaza.model.Announcement;
import org.hackbrooklyn.plaza.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping
    public ResponseEntity<Collection<Announcement>> getAnnouncements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        Collection<Announcement> announcements = announcementService.getMultipleAnnouncements(page, limit);
        return new ResponseEntity<>(announcements, HttpStatus.OK);
    }

}
