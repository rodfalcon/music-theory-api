package com.example.demo.model;

import java.util.Arrays;
import java.util.List;

// Represents a specific scale instance: a root note + a mode.
// "D Dorian" is root=D, type=DORIAN — two different roots with the same type are two different scales.
public record Scale(Note root, ScaleType type) {

    // Applies the mode's interval formula to the root to produce the actual notes.
    // Same mechanism as Chord.notes() — the intervals do the math, transpose() does the movement.
    public List<Note> notes() {
        return Arrays.stream(type.getIntervals())
                .mapToObj(root::transpose)
                .toList();
    }

    // Produces the human-readable name used in API responses: "D Dorian", "G Mixolydian", etc.
    public String displayName() {
        return root.getSymbol() + " " + type.getDisplayName();
    }
}