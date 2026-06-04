package com.example.demo.model;

public enum ChordQuality {
      // Each constant calls the constructor below: (displayName, suffix, intervals)
      // The suffix is what gets appended to the root note in chord notation ("Dm7", "G7", "Cmaj7")
      // The intervals are semitone distances from the root — this is the actual music theory encoded in software
    MAJOR("major", "", new int[]{0, 4, 7}), //C does not need a suffix because it's the root note
    MINOR("minor", "m", new int[]{0, 3, 7}),           // Cm
    DOMINANT_7("dominant 7th", "7", new int[]{0, 4, 7, 10}),   // G7
    MAJOR_7("major 7th", "maj7", new int[]{0, 4, 7, 11}),      // Cmaj7
    MINOR_7("minor 7th", "m7", new int[]{0, 3, 7, 10}),        // Dm7
    DIMINISHED("diminished", "dim", new int[]{0, 3, 6}),        // Bdim
    AUGMENTED("augmented", "aug", new int[]{0, 4, 8}),          // Caug
    HALF_DIMINISHED("half-diminished", "m7b5", new int[]{0, 3, 6, 10}); // Bm7b5

    private final String displayName;
    private final String suffix;
    private final int[] intervals;

      // This constructor is called by each constant above
      ChordQuality(String displayName, String suffix, int[] intervals) {
        this.displayName = displayName;
        this.suffix = suffix;
        this.intervals = intervals;
    }

      // Getters — the only way outside code can read these fields
    public String getDisplayName() {
        return displayName;
    }

    public String getSuffix() {
        return suffix;
    }

    public int[] getIntervals() {
        return intervals;
    }
}
