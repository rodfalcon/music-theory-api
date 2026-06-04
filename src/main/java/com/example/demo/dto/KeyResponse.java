package com.example.demo.dto;

import java.util.List;

// Returned by GET /keys/{key}
// A key is just a major scale — exposes the key name and its 7 notes
public record KeyResponse(String key, List<String> notes) {}
