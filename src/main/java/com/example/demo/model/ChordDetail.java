package com.example.demo.model;

import java.util.List;

public class ChordDetail {

    private String symbol;
    private String quality;
    private List<String> notes;

    public ChordDetail(String symbol, String quality, List<String> notes) {
        this.symbol = symbol;
        this.quality = quality;
        this.notes = notes;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getQuality() {
        return quality;
    }

    public List<String> getNotes() {
        return notes;
    }
}
