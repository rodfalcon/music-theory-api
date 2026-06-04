package com.example.demo.engine;

import java.util.regex.Pattern;
import java.util.regex.Matcher;
import com.example.demo.model.Chord;
import com.example.demo.model.Note;
import com.example.demo.model.ChordQuality;
import org.springframework.stereotype.Component;

@Component

public class ChordParser {

    private static final Pattern CHORD_PATTERN = Pattern.compile("^([A-G][#b]?)(maj7|maj|m7b5|m7|m|dim7|dim|aug|7|sus4|sus2)?$");

    public Chord parse(String symbol) {
          // 1. Run the regex against the input
          // 2. If it doesn't match, throw IllegalArgumentException
          // 3. Extract group(1) → root note via Note.fromString()
          // 4. Extract group(2) → quality suffix, use a switch to map to ChordQuality
          // 5. Return new Chord(symbol, root, quality)
        Matcher matcher = CHORD_PATTERN.matcher(symbol);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Invalid chord symbol: " + symbol);
        }
        String suffix = matcher.group(2) == null ? "" : matcher.group(2);
        ChordQuality quality = switch (suffix) {
            case "", "maj" -> ChordQuality.MAJOR;
            case "m" -> ChordQuality.MINOR;
            case "7" -> ChordQuality.DOMINANT_7;
            case "maj7" -> ChordQuality.MAJOR_7;
            case "m7" -> ChordQuality.MINOR_7;
            case "dim" -> ChordQuality.DIMINISHED;
            case "aug" -> ChordQuality.AUGMENTED;
            case "m7b5" -> ChordQuality.HALF_DIMINISHED;
            case "dim7" -> ChordQuality.DIMINISHED;
            default -> throw new IllegalArgumentException("Invalid chord quality: " + suffix);
        };
        Note root = Note.fromString(matcher.group(1));
        return new Chord(symbol, root, quality);
    }

}
