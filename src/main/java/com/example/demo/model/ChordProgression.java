package com.example.demo.model;

import java.util.List;

public class ChordProgression {
    private String key;
    private String mode;
    private List<ProgressionEntry> progressions;

    public ChordProgression(String key, String mode, List<ProgressionEntry> progressions) {
        this.key = key;
        this.mode = mode;
        this.progressions = progressions;
    }

    public String getKey() {
        return key;
    }

    public String getMode() {
        return mode;
    }

    public List<ProgressionEntry> getProgressions() {
        return progressions;
    }
}
