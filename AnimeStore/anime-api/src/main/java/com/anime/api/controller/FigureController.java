package com.anime.api.controller;

import com.anime.api.model.Figure;
import com.anime.api.storage.FileStorage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/figures")
public class FigureController {

    private final FileStorage storage;

    public FigureController(FileStorage storage) {
        this.storage = storage;
    }

    @GetMapping
    public List<Figure> getAll() throws Exception {
        return storage.getFigures();
    }

    @PostMapping
    public ResponseEntity<Figure> add(@RequestBody Figure figure) throws Exception {
        Figure saved = storage.addFigure(figure);
        return ResponseEntity.status(201).body(saved);
    }
}
