package com.example.demo.dto;

// Request body for POST /improvise
// The client sends a chord symbol (e.g. "Dm7") and the engine figures out compatible scales
public record ImproveRequest(String chordSymbol) {}
