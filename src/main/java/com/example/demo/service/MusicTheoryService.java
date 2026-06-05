package com.example.demo.service;

import com.example.demo.engine.ChordParser;
import com.example.demo.engine.ScaleRecommendationEngine;
import com.example.demo.model.Chord;
import com.example.demo.model.Note;
import com.example.demo.model.Scale;
import com.example.demo.model.ScaleType;
import com.example.demo.dto.ChordResponse;
import com.example.demo.dto.ScaleResponse;
import com.example.demo.dto.KeyResponse;
import com.example.demo.dto.ImproveRequest;
import com.example.demo.dto.ImproveResponse;
import org.springframework.stereotype.Service;
import java.util.List;

// @Service tells Spring to manage this class as a singleton bean.
// Controllers don't instantiate it — Spring injects it automatically via the constructor.
@Service
public class MusicTheoryService {
    private final ChordParser chordParser;
    private final ScaleRecommendationEngine scaleEngine;

    // Constructor injection: Spring sees the two @Component engines and passes them in.
    // No @Autowired needed — with a single constructor, Spring infers it.
    public MusicTheoryService(ChordParser chordParser, ScaleRecommendationEngine scaleEngine) {
        this.chordParser = chordParser;
        this.scaleEngine = scaleEngine;
    }

    // Parses a symbol like "Dm7" into a Chord, then projects it into a ChordResponse DTO.
    // The DTO flattens the Note enums into plain strings so the controller can serialize to JSON.
    public ChordResponse getChord(String chordSymbol) {
        Chord chord = chordParser.parse(chordSymbol);
        return new ChordResponse(
            chord.symbol(),
            chord.root().getSymbol(),
            chord.quality().getDisplayName(),
            chord.notes().stream().map(Note::getSymbol).toList()
        );
    }

    // Recommends scales that fit the given chord symbol.
    // The engine returns domain Scale objects; the stream maps each one to a DTO for the API layer.
    // The `type` param is reserved for future filtering (e.g. only modal scales).
    public List<ScaleResponse> getScales(String chordSymbol, String type) {
        Chord chord = chordParser.parse(chordSymbol);
        return scaleEngine.recommend(chord).stream()
            .map(s -> new ScaleResponse(
                s.root().getSymbol(),
                s.type().getDisplayName(),
                s.notes().stream().map(Note::getSymbol).toList()
            ))
            .toList();
    }

    // Returns the notes in a major key (Ionian mode = the standard major scale formula).
    // Note.fromString() resolves "D" → Note.D, then Scale computes the intervals from there.
    public KeyResponse getKeys(String key) {
        Note root = Note.fromString(key);
        Scale scale = new Scale(root, ScaleType.IONIAN);
        return new KeyResponse(key, scale.notes().stream().map(Note::getSymbol).toList());
    }

    // Returns the notes of a specific scale — root + mode.
    // e.g. getScale("D", "Dorian") → D E F G A B C
    public ScaleResponse getScale(String root, String scaleType) {
        Note rootNote = Note.fromString(root);
        ScaleType type = ScaleType.fromString(scaleType);
        Scale scale = new Scale(rootNote, type);
        return new ScaleResponse(
            rootNote.getSymbol(),
            type.getDisplayName(),
            scale.notes().stream().map(Note::getSymbol).toList()
        );
    }

    // Given a chord symbol, finds all compatible scales and wraps them in a single response.
    // ImproveResponse bundles the original symbol + the scale list so the client has full context.
    public ImproveResponse improvise(ImproveRequest improveRequest) {
        Chord chord = chordParser.parse(improveRequest.chordSymbol());
        List<ScaleResponse> scales = scaleEngine.recommend(chord).stream()
            .map(s -> new ScaleResponse(
                s.root().getSymbol(),
                s.type().getDisplayName(),
                s.notes().stream().map(Note::getSymbol).toList()
            ))
            .toList();
        return new ImproveResponse(improveRequest.chordSymbol(), scales);
    }
}
