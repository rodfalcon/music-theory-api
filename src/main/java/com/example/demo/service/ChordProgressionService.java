package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.example.demo.model.ChordProgression;
import com.example.demo.model.ProgressionEntry;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChordProgressionService {
    private static final Logger log = LoggerFactory.getLogger(ChordProgressionService.class);
    private static final String[] MAJOR_SCALE = {"C", "D", "E", "F", "G", "A", "B"};
    private static final String[] CHROMATIC = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};

    // Major scale intervals in semitones W W H W W W H
    private static final int[] MAJOR_SCALE_INTERVALS = {0, 2, 4, 5, 7, 9, 11};

    // Minor scale intervals in semitones W H W W W H W
    private static final int[] MINOR_SCALE_INTERVALS = {0, 2, 3, 5, 7, 8, 10};

    //Chord qualities per scale degree: major=true, minor=false, dim=null
    private static final String[] MAJOR_QUALITIES = {"", "m", "m", "", "", "m", "dim"};
    
    private static final String[] MINOR_QUALITIES = {"m", "dim", "", "m", "m", "", ""};

    public ChordProgression generateProgression(String key, String mode) {
          // 1. build the 7 diatonic chords for the key+mode
          // 2. construct the 4 named progressions using degree indices
          // 3. return a ChordProgression
          log.info("Generating chord progression for key: {}, mode: {}", key, mode);
          // pick intervals + qualities based on mode
          int[] intervals = mode.equalsIgnoreCase("minor") ? MINOR_SCALE_INTERVALS : MAJOR_SCALE_INTERVALS;
          String[] qualities = mode.equalsIgnoreCase("minor") ? MINOR_QUALITIES : MAJOR_QUALITIES;
          // build the 7 diatonic chords
          String[] diatonic = new String[7];
          for(int i = 0; i < 7; i++) {
            diatonic[i] = buildChord(getNoteAtInterval(key, intervals[i]), qualities[i]);
          }
          // assemble progressions using degree indices
          List<ProgressionEntry> progressions = List.of(
                new ProgressionEntry("I-IV-V-I",  List.of(diatonic[0], diatonic[3],
                diatonic[4], diatonic[0])),
                new ProgressionEntry("I-V-vi-IV", List.of(diatonic[0], diatonic[4],
                diatonic[5], diatonic[3])),
                new ProgressionEntry("ii-V-I",    List.of(diatonic[1], diatonic[4],
                diatonic[0])),
                new ProgressionEntry("I-vi-IV-V", List.of(diatonic[0], diatonic[5],
                diatonic[3], diatonic[4])));
          log.info("Progressions: {}", progressions);
          return new ChordProgression(key, mode, progressions);
        }

    private String buildChord(String root, String quality) {
        log.info("Building chord for root: {}, quality: {}", root, quality);
        // returns root + quality suffix, e.g. "A" + "m" = "Am"
        log.info("Built chord: {}", root + quality);
        return root + quality;
    }

    private String getNoteAtInterval(String root, int semitones) {
        log.info("Getting note at interval: {}, root: {}", semitones, root);
        // find root in CHROMATIC, advance by semitones, return that note
        for(int i = 0; i < CHROMATIC.length; i++) {
            if(CHROMATIC[i].equals(root)) {
                log.info("Found note: {}", CHROMATIC[(i + semitones) % 12]);
                return CHROMATIC[(i + semitones) % 12];
            }
        }      
        return root;
    }
}