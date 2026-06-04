package com.example.demo.dto;

import java.util.List;

// Returned by GET /chords/{symbol}
// Exposes the parsed chord: its root note, quality name, and the actual notes that make it up
public record ChordResponse(String symbol, String root, String quality, List<String> notes) {}
