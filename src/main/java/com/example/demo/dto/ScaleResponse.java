package com.example.demo.dto;

import java.util.List;

// Returned by GET /scales/{root}/{type} and embedded inside ImproveResponse
// Exposes the scale's root, mode name, and the ordered list of notes
public record ScaleResponse(String root, String type, List<String> notes) {}
