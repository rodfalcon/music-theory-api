package com.example.demo.dto;

// Returned by the GlobalExceptionHandler for any 400/404/500 error
// Wraps the error message in a consistent JSON shape: { "message": "..." }
public record ErrorResponse(String message) {}
