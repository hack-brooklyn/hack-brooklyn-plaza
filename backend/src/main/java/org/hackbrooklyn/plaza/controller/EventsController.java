package org.hackbrooklyn.plaza.controller;

import org.hackbrooklyn.plaza.dto.SaveEventDTO;
import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;
import java.util.Collection;

@Validated
@RestController
@RequestMapping("/events")
public class EventsController {

    private final EventService eventService;

    @Autowired
    public EventsController(EventService eventService) {
        this.eventService = eventService;
    }

    @PreAuthorize("hasAuthority(@authorities.EVENTS_READ)")
    @GetMapping
    public ResponseEntity<Collection<Event>> getEvents() {
        Collection<Event> events = eventService.getMultipleEvents();

        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.EVENTS_READ)")
    @GetMapping("/{eventId}")
    public ResponseEntity<Event> getSingleEvent(@PathVariable @Positive int eventId) {
        Event event = eventService.getEventById(eventId);

        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.EVENTS_CREATE)")
    @PostMapping
    public ResponseEntity<Void> addEvent(@RequestBody @Valid SaveEventDTO bodyReq) {
        int id = eventService.createNewEvent(bodyReq);
        String location = "/events" + id;
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", location);

        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority(@authorities.EVENTS_UPDATE)")
    @PutMapping("/{eventId}")
    public ResponseEntity<Void> updateEvent(@PathVariable @Positive int eventId, @RequestBody @Valid SaveEventDTO reqBody) {
        eventService.updateEvent(eventId, reqBody);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.EVENTS_DELETE)")
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable @Positive int eventId) {
        eventService.deleteEvent(eventId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.SAVED_EVENTS_READ)")
    @GetMapping("/save")
    public ResponseEntity<Collection<Integer>> getSavedEvents(@AuthenticationPrincipal User user) {
        Collection<Integer> eventIds = eventService.getFollowedEventIds(user);

        return new ResponseEntity<>(eventIds, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.SAVED_EVENTS_ADD)")
    @PostMapping("/save/{eventId}")
    public ResponseEntity<Void> saveEvent(@AuthenticationPrincipal User user, @PathVariable @Positive int eventId) {
        eventService.saveEvent(eventId, user);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority(@authorities.SAVED_EVENTS_REMOVE)")
    @DeleteMapping("/save/{eventId}")
    public ResponseEntity<Void> unsaveEvent(@AuthenticationPrincipal User user, @PathVariable @Positive int eventId) {
        eventService.unsaveEvent(eventId, user);

        return new ResponseEntity<>(HttpStatus.OK);
    }

}
