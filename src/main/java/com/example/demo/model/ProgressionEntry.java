package com.example.demo.model;

import java.util.List;

public class ProgressionEntry {
    private String name;
    private List<String> chords;

    public ProgressionEntry(String name, List<String> chords) {
        this.name = name;
        this.chords = chords;
    }

    public String getName() {
        return name;
    }
    
    public List<String> getChords() {
        return chords;
    }
}