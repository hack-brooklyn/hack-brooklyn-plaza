package org.hackbrooklyn.plaza.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.NewsletterSubscriptionDTO;
import org.hackbrooklyn.plaza.service.NewsletterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.security.NoSuchAlgorithmException;

@Slf4j
@RestController
@RequestMapping("/newsletter")
public class NewsletterController {

    private final NewsletterService newsletterService;

    @Autowired
    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    /**
     * Subscribes a member to the Hack Brooklyn newsletter on Mailchimp.
     */
    @PostMapping(path = "subscribe")
    public ResponseEntity<Void> subscribeUser(@RequestBody @Valid NewsletterSubscriptionDTO reqBody) throws NoSuchAlgorithmException, JsonProcessingException {
        newsletterService.subscribeUser(reqBody);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
