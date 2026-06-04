# Music Theory API

A REST API that encodes music theory logic in pure Java — no AI, no shortcuts. Given a chord or key, it tells you what scales fit, what notes are in play, and what to improvise over.

Built as a portfolio project to demonstrate custom domain logic engineering across a modern stack.

---

## What this is

Most "music theory" tools today are just wrappers around an LLM. This one isn't.

Every scale recommendation, every interval calculation, every chord parse is done by hand-written Java logic — enums with interval formulas, a regex-based chord parser, a scale recommendation engine that cross-checks 84 scale candidates against chord tones. The music theory is **encoded into the software**, not delegated to a model.

Claude comes in at Phase 3, as an advisor layered on top of the engine — not as the brain.

---

## Stack

- **Backend:** Java 21 + Spring Boot 4
- **Engine:** Custom music theory logic (no external music libraries)
- **Observability:** Datadog APM + structured JSON logs (trace-log correlation enabled)
- **Frontend:** Angular (Phase 2 — in progress)
- **Events:** Kafka (Phase 3)
- **AI advisor:** Claude (Phase 4)

---

## Architecture

```
HTTP Request
    ↓
MusicTheoryController   (@RestController, /api)
    ↓
MusicTheoryService      (orchestrates engine calls)
    ↓
ChordParser             (regex → Chord model)
ScaleRecommendationEngine (Chord → List<Scale>)
    ↓
Note / ChordQuality / ScaleType / Chord / Scale  (domain models)
```

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/chords/{symbol}` | Parse a chord symbol and return its notes. e.g. `Dm7` |
| `GET` | `/api/scales/{root}/{type}` | Get scales that fit a chord. e.g. `D/minor` |
| `GET` | `/api/keys/{key}` | Get all notes in a major key. e.g. `G` |
| `POST` | `/api/improvise` | Given a chord, return compatible scales for improvisation |

### Example requests

```bash
# What notes are in a Dm7 chord?
curl http://localhost:8080/api/chords/Dm7

# What scales fit over E minor?
curl http://localhost:8080/api/scales/E/minor

# What notes are in the key of G?
curl http://localhost:8080/api/keys/G

# What can I improvise over Am7?
curl -X POST http://localhost:8080/api/improvise \
  -H "Content-Type: application/json" \
  -d '{"chordSymbol": "Am7"}'
```

---

## Running locally

**Prerequisites:** Java 21, Maven, Datadog Agent running on `localhost:8126`

```bash
mvn spring-boot:run
```

The Datadog Java agent (`dd-java-agent 1.63.0`) is downloaded automatically on first run via the Maven dependency plugin. DD environment variables are scoped to the Maven plugin — no global env pollution.

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Engine + API | ✅ Done | Music theory engine, REST endpoints, Datadog APM |
| 2 — UI | 🔨 In progress | Angular frontend — guitar fretboard + piano keyboard visualizer |
| 3 — Kafka | Planned | Event streaming: `ChordProgressionRequested`, `ScaleSuggested` |
| 4 — AI Advisor | Planned | `POST /coach` — Claude as advisor on top of engine output |

---

## Domain model highlights

**`Note`** — enum of 12 chromatic notes with semitone values and a `transpose(int)` method that does the interval math.

**`ChordQuality`** — enum of 8 chord types (major, minor, dom7, maj7, min7, dim, aug, half-dim), each carrying its interval formula as `int[]`.

**`ScaleType`** — enum of 7 modes (Ionian through Locrian), each with its own interval formula.

**`ChordParser`** — regex-based parser that splits a symbol like `"Dm7"` into root (`D`) + quality (`MINOR_7`), validated against all supported chord types.

**`ScaleRecommendationEngine`** — generates all 84 possible scales (12 roots × 7 modes) and filters to those whose note set is a superset of the chord tones. A scale is compatible when every chord tone appears in it.
