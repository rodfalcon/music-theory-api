package com.example.demo.model;

import java.util.Arrays;

public enum Note {
    // Each constant calls the constructor below: (semitom, symbol)
    // The semitone is the distance from the root note in semitones
    // The symbol is the letter name of the note
    C(0, "C"),
    C_SUSTENIDO(1, "C#"),
    D(2, "D"),
    D_SUSTENIDO(3, "D#"),
    E(4, "E"),
    F(5, "F"),
    F_SUSTENIDO(6, "F#"),
    G(7, "G"),
    G_SUSTENIDO(8, "G#"),
    A(9, "A"),
    A_SUSTENIDO(10, "A#"),
    B(11, "B");

    private final int semitom;
    private final String symbol;

    Note(int semitom, String symbol) {
        this.semitom = semitom;
        this.symbol = symbol;
    }

    public static Note fromString(String s) {
        return switch (s.toUpperCase()) {
            case "C" -> C;
            case "C#" -> C_SUSTENIDO;
            case "D" -> D;
            case "D#" -> D_SUSTENIDO;
            case "E" -> E;
            case "F" -> F;
            case "F#" -> F_SUSTENIDO;
            case "G" -> G;
            case "G#" -> G_SUSTENIDO;
            case "A" -> A;
            case "A#" -> A_SUSTENIDO;
            case "B" -> B;
            default -> throw new IllegalArgumentException("Unknown note: " + s);
        };
    }

    public int getSemitom() {
        return semitom;
    }

    public String getSymbol() {
        return symbol;
    }

    public Note transpose(int semitones) {
        int target = (this.semitom + semitones + 12) % 12;
        return Arrays.stream(values())
                .filter(n -> n.semitom == target)
                .findFirst()
                .orElseThrow();
    }
}
