# NoteFlow — Music Theory Explorer

A music theory engine with a visual frontend, event streaming, and full observability. Built as a portfolio project across a modern stack — no LLM wrappers, no shortcuts.

Every scale recommendation, every interval calculation, every chord parse is done by hand-written Java logic. The music theory is **encoded into the software**.

---

## Screenshots

**Landing page**

![NoteFlow home](docs/screenshot-home.png)

**Guitar fretboard** — scale degree color coding, click any fret to hear the note

![Guitar fretboard](docs/screenshot-guitar.png)

**Piano keyboard** — same color encoding, same legend, different instrument

![Piano keyboard](docs/screenshot-piano.png)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21 + Spring Boot 4 |
| Music engine | Custom domain logic (no external music libraries) |
| Frontend | React + Tailwind, served via nginx |
| Event streaming | Apache Kafka 3.7 (KRaft mode, no Zookeeper) |
| Observability | Datadog APM + distributed tracing + structured JSON logs |
| Runtime | Kubernetes (colima) — 3 deployments: backend, frontend, kafka |
| Container | Docker multi-stage build |

---

## Architecture

```
Browser
  ↓
React frontend (NoteFlow UI)
  ↓ HTTP
Spring Boot API  (:8081)
  ├── MusicTheoryController   (@RestController, /api/*)
  ├── MusicTheoryService      (orchestrates engine)
  ├── ChordParser             (regex → Chord model)
  ├── ScaleRecommendationEngine
  └── NoteEventProducer       (publishes to Kafka on each request)
        ↓
      Kafka  (note-events topic)
        ↓
      NoteEventConsumer       (@KafkaListener — logs partition + offset)
```

Datadog APM auto-instruments HTTP spans and the Kafka producer/consumer via the `dd-java-agent`, with trace-log correlation and service map showing `music-theory-api → kafka`.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/chords/{symbol}` | Parse a chord symbol, return notes. e.g. `Dm7` |
| `GET` | `/api/scale/{root}/{type}` | Get a single scale. e.g. `C/ionian` |
| `GET` | `/api/scales/{root}/{type}` | Get all compatible scales for a chord |
| `GET` | `/api/keys/{key}` | Get all notes in a major key. e.g. `G` |
| `POST` | `/api/improvise` | Given a chord, return compatible scales for improvisation |

Every `/api/scale` and `/api/chords` request publishes a `NoteEvent` to the `note-events` Kafka topic.

### Example requests

```bash
# What notes are in a Dm7 chord?
curl http://localhost:8081/api/chords/Dm7

# C Ionian scale
curl http://localhost:8081/api/scale/C/ionian

# What can I improvise over Am7?
curl -X POST http://localhost:8081/api/improvise \
  -H "Content-Type: application/json" \
  -d '{"chordSymbol": "Am7"}'
```

---

## Running locally (Kubernetes via colima)

**Prerequisites:** Docker, colima, kubectl

```bash
# Start colima with Kubernetes
colima start --kubernetes

# Build and load backend image
docker build -t music-theory-api:0.1.0 .
docker save music-theory-api:0.1.0 | colima ssh -- sudo ctr -n k8s.io images import /dev/stdin

# Pull and load Kafka image
docker pull apache/kafka:3.7.0
docker save apache/kafka:3.7.0 | colima ssh -- sudo ctr -n k8s.io images import /dev/stdin

# Deploy everything
kubectl apply -f k8s/

# Port-forward to access locally
kubectl port-forward svc/music-theory-api 8081:8081 -n music-theory --context colima
kubectl port-forward svc/frontend 3000:80 -n music-theory --context colima
```

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Engine + API | ✅ Done | Music theory engine, REST endpoints, Datadog APM |
| 2 — Frontend | ✅ Done | React frontend — guitar fretboard + piano keyboard with scale degree colors |
| 3 — Kafka + K8s | ✅ Done | Event streaming on every request, deployed on Kubernetes, DD service map |
| 4 — AI Advisor | Planned | `POST /coach` — Claude as advisor on top of engine output |

---

## Domain model highlights

**`Note`** — enum of 12 chromatic notes with semitone values and a `transpose(int)` method.

**`ChordQuality`** — enum of 8 chord types (major, minor, dom7, maj7, min7, dim, aug, half-dim), each carrying its interval formula as `int[]`.

**`ScaleType`** — enum of 7 modes (Ionian through Locrian), each with its own interval formula.

**`ChordParser`** — regex-based parser that splits a symbol like `"Dm7"` into root (`D`) + quality (`MINOR_7`).

**`ScaleRecommendationEngine`** — generates all 84 possible scales (12 roots × 7 modes) and filters to those whose note set is a superset of the chord tones.

**`NoteEvent`** — Java record DTO published to Kafka on every scale/chord request: `{type, root, scale, timestamp}`.

---

## UI color system

Scale notes are color-coded by **scale degree** — the root is always red, the 2nd always orange, etc. — regardless of which string or octave you're playing on. The legend below the instrument shows which color maps to which note and degree. This helps beginners answer "where do I play next?" without memorising positions.
