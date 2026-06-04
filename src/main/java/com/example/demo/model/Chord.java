package com.example.demo.model;

import java.util.Arrays;
import java.util.List;

// A record is a pure data carrier — Java auto-generates the constructor and accessors (symbol(), root(), quality()).
// Represents a specific chord: "Dm7" = root D + quality MINOR_7.
public record Chord(String symbol, Note root, ChordQuality quality) {

    // Computes the actual notes by applying each interval from the quality to the root.
    // Example: Dm7 → D.transpose(0,3,7,10) → D, F, A, C
    public List<Note> notes() {
        return Arrays.stream(quality.getIntervals())
                .mapToObj(root::transpose)
                .toList();
    }
}
