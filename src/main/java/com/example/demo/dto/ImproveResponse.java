package com.example.demo.dto;

import java.util.List;

// Returned by POST /improvise
// Echoes back the chord symbol and contains the full list of scales compatible with that chord
public record ImproveResponse(String chordSymbol, List<ScaleResponse> recommendedScales) {}
