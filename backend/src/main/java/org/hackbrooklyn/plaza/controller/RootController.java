package org.hackbrooklyn.plaza.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
@RequestMapping("/")
public class RootController {

    @GetMapping
    public ResponseEntity<Void> pingRoot() {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
