package org.hackbrooklyn.plaza.controller;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.SubscribeToPushNotificationDTO;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.service.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/pushNotifications")
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;

    @Autowired
    public PushNotificationController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @PostMapping(path = "subscribe")
    public ResponseEntity<Void> subscribe(
            @RequestBody @Valid SubscribeToPushNotificationDTO reqBody,
            @AuthenticationPrincipal User user
    ) {
        pushNotificationService.subscribe(reqBody, user);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping(path = "subscribe")
    public ResponseEntity<Void> unsubscribe(@AuthenticationPrincipal User user) {
        pushNotificationService.unsubscribe(user);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
