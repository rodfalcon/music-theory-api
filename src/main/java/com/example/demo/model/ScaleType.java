package com.example.demo.model;

public enum ScaleType {

    // The 7 modes of the major scale. Each encodes its interval formula as semitone distances
    // from the root — this is the music theory rule system living directly in the data.
    // Example: Dorian {0,2,3,5,7,9,10} means the 3rd and 7th are flatted vs. Ionian.
    IONIAN("Ionian", new int[]{0, 2, 4, 5, 7, 9, 11}),
    DORIAN("Dorian", new int[]{0, 2, 3, 5, 7, 9, 10}),
    PHRYGIAN("Phrygian", new int[]{0, 1, 3, 5, 7, 8, 10}),
    LYDIAN("Lydian", new int[]{0, 2, 4, 6, 7, 9, 11}),
    MIXOLYDIAN("Mixolydian", new int[]{0, 2, 4, 5, 7, 9, 10}),
    AEOLIAN("Aeolian", new int[]{0, 2, 3, 5, 7, 8, 10}),
    LOCRIAN("Locrian", new int[]{0, 1, 3, 5, 6, 8, 10});

    private final String displayName;
    private final int[] intervals;

    ScaleType(String displayName, int[] intervals) {
        this.displayName = displayName;
        this.intervals = intervals;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int[] getIntervals() {
        return intervals;
    }

    // Parses a URL path variable like "dorian" into the DORIAN constant.
    // Case-insensitive so the API accepts "Dorian", "dorian", or "DORIAN".
    public static ScaleType fromString(String s) {
        for (ScaleType type : values()) {
            if (type.displayName.equalsIgnoreCase(s)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown scale type: " + s + ". Valid: ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian");
    }
}
