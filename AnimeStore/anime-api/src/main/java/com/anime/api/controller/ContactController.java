package com.anime.api.controller;

import com.anime.api.model.ContactMessage;
import com.anime.api.storage.FileStorage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final FileStorage storage;

    public ContactController(FileStorage storage) {
        this.storage = storage;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@RequestBody ContactMessage message) throws Exception {
        storage.saveMessage(message);
        return ResponseEntity.ok(Map.of("success", true, "message", "Message received"));
    }
}
