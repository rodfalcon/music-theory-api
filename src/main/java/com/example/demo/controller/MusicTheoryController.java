package com.example.demo.controller;

import com.example.demo.dto.ChordResponse;
import com.example.demo.dto.ScaleResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import com.example.demo.service.MusicTheoryService;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.KeyResponse;
import com.example.demo.dto.ImproveRequest;
import com.example.demo.dto.ImproveResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
public class MusicTheoryController {
    private static final Logger log = LoggerFactory.getLogger(MusicTheoryController.class);

    private final MusicTheoryService musicTheoryService;
    public MusicTheoryController(MusicTheoryService musicTheoryService) {
        this.musicTheoryService = musicTheoryService;
    }

    @GetMapping("/chords/{symbol}")
    public ChordResponse getChord(@PathVariable String symbol) {
        log.info("GET /chords/{}", symbol);
        return musicTheoryService.getChord(symbol);
    }

    @GetMapping("/scales/{root}/{type}")
    public List<ScaleResponse> getScales(@PathVariable String root, @PathVariable String type) {
        log.info("GET /scales/{}/{}", root, type);
        return musicTheoryService.getScales(root, type);
    }

    @GetMapping("/scale/{root}/{type}")
    public ScaleResponse getScale(@PathVariable String root, @PathVariable String type) {
        log.info("GET /scale/{}/{}", root, type);
        return musicTheoryService.getScale(root, type);
    }

    @GetMapping("/keys/{key}")
    public KeyResponse getKeys(@PathVariable String key) {
        log.info("GET /keys/{}", key);
        return musicTheoryService.getKeys(key);
    }

    @PostMapping("/improvise")
    public ImproveResponse improvise(@RequestBody ImproveRequest improveRequest) {
        log.info("POST /improvise chord={}", improveRequest.chordSymbol());
        return musicTheoryService.improvise(improveRequest);
    }
}
