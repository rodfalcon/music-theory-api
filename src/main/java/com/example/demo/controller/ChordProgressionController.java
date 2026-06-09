package com.example.demo.controller;

import com.example.demo.model.ChordProgression;
import com.example.demo.service.ChordProgressionService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/progressions")
public class ChordProgressionController {

    private final ChordProgressionService chordProgressionService;

    public ChordProgressionController(ChordProgressionService chordProgressionService) {
        this.chordProgressionService = chordProgressionService;
    }

    @GetMapping
    public ChordProgression getProgression(@RequestParam String key, @RequestParam(defaultValue = "major") String mode) {
        return chordProgressionService.generateProgression(key, mode);
    }
}
