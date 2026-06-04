package com.example.demo.engine;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import com.example.demo.model.Chord;
import com.example.demo.model.Note;
import com.example.demo.model.Scale;
import com.example.demo.model.ScaleType;

// Marks this class as a Spring-managed bean so it can be @Autowired into the service layer
@Component
public class ScaleRecommendationEngine {

    public List<Scale> recommend(Chord chord) {
        // Convert the chord's notes to a Set for O(1) containsAll lookup.
        // chord.notes() returns a List built by transposing the root by each interval in the quality.
        Set<Note> chordNotes = new HashSet<>(chord.notes());

        // Outer loop: every one of the 12 chromatic roots (C, C#, D, … B)
        return Arrays.stream(Note.values())
                // Inner loop: for each root, produce all 7 scale types → 84 candidates total.
                // flatMap collapses the nested stream into a single stream of Scale objects.
                .flatMap(root -> Arrays.stream(ScaleType.values())
                        .map(type -> new Scale(root, type))
                        // Keep only scales whose note set is a superset of the chord tones.
                        // A scale is compatible with a chord when every chord tone appears in the scale.
                        .filter(scale -> new HashSet<>(scale.notes()).containsAll(chordNotes)))
                .collect(Collectors.toList());
    }

}
