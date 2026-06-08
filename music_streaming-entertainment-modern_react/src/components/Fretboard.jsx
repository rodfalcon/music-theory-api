import React, { useMemo } from 'react';
import { DEGREE_COLORS } from '../constants/degreeColors';

// Chromatic note names indexed by semitone (0 = C)
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard tuning, displayed top to bottom (high e on top, low E on bottom — standard tab layout)
const OPEN_STRINGS = [
  { label: 'e', midi: 64 },  // E4
  { label: 'B', midi: 59 },  // B3
  { label: 'G', midi: 55 },  // G3
  { label: 'D', midi: 50 },  // D3
  { label: 'A', midi: 45 },  // A2
  { label: 'E', midi: 40 },  // E2
];


// Fret marker positions (dots on the fretboard body)
const SINGLE_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_MARKERS = [12, 24];

const NUM_FRETS = 24;
const FRET_W = 64;     // width of each fret zone
const STRING_H = 44;   // height of each string row
const LABEL_W = 32;    // left side for string name labels
const HEADER_H = 28;   // top for fret numbers
const DOT_R = 14;      // radius of clickable note circles

// Full unscaled SVG dimensions
// Columns: open (0) + frets 1–12 = 13 total
const NATURAL_W = LABEL_W + (NUM_FRETS + 1) * FRET_W;
const NATURAL_H = HEADER_H + OPEN_STRINGS.length * STRING_H;

// Given a string's open MIDI note and a fret number, compute the resulting note
function getNoteAtFret(openMidi, fret) {
  const midi = openMidi + fret;
  return {
    note: NOTE_NAMES[midi % 12],
    octave: Math.floor(midi / 12) - 1,
  };
}

// onFretClick(note, octave, stringIdx, fret) — called when a position is clicked
// highlightedNotes — plain note names (no octave) to colour green across all strings
// selectedPos — { stringIdx, fret } of the last clicked position (shown with a white ring)
// zoom — 0.3 to 1.0
export const Fretboard = ({
  onFretClick,
  highlightedNotes = [],
  selectedPos = null,
  zoom = 0.8,
}) => {
  // Pre-compute all 78 note positions (6 strings × 13 frets) once
  const positions = useMemo(() =>
    OPEN_STRINGS.flatMap((string, stringIdx) =>
      Array.from({ length: NUM_FRETS + 1 }, (_, fret) => ({
        ...getNoteAtFret(string.midi, fret),
        stringIdx,
        fret,
        // Center of each fret zone
        x: LABEL_W + (fret + 0.5) * FRET_W,
        y: HEADER_H + stringIdx * STRING_H + STRING_H / 2,
      }))
    ), []
  );

  const isHighlighted = (note) => highlightedNotes.includes(note);
  const isSelected = (stringIdx, fret) =>
    selectedPos && selectedPos.stringIdx === stringIdx && selectedPos.fret === fret;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${NATURAL_W} ${NATURAL_H}`}
        width={NATURAL_W * zoom}
        height={NATURAL_H * zoom}
      >
        {/* Fretboard background (dark rosewood look) */}
        <rect
          x={LABEL_W}
          y={HEADER_H}
          width={(NUM_FRETS + 1) * FRET_W}
          height={OPEN_STRINGS.length * STRING_H}
          fill="#1c0f07"
          rx={4}
        />

        {/* Position markers — single dot at frets 3, 5, 7, 9 */}
        {SINGLE_MARKERS.map(fret => (
          <circle
            key={fret}
            cx={LABEL_W + (fret + 0.5) * FRET_W}
            cy={HEADER_H + (OPEN_STRINGS.length / 2) * STRING_H}
            r={7}
            fill="#4a2a10"
          />
        ))}

        {/* Position markers — double dot at fret 12 */}
        {DOUBLE_MARKERS.flatMap(fret => [
          { key: `${fret}-top`,    cy: HEADER_H + 1.5 * STRING_H },
          { key: `${fret}-bottom`, cy: HEADER_H + 4.5 * STRING_H },
        ]).map(({ key, cy }) => (
          <circle
            key={key}
            cx={LABEL_W + (12 + 0.5) * FRET_W}
            cy={cy}
            r={7}
            fill="#4a2a10"
          />
        ))}

        {/* String lines (horizontal) — lower strings are slightly thicker */}
        {OPEN_STRINGS.map((_, i) => (
          <line
            key={i}
            x1={LABEL_W}
            y1={HEADER_H + i * STRING_H + STRING_H / 2}
            x2={NATURAL_W}
            y2={HEADER_H + i * STRING_H + STRING_H / 2}
            stroke="#aaa"
            strokeWidth={i < 2 ? 1 : i < 4 ? 1.5 : 2.5}
          />
        ))}

        {/* Nut (thick bar between open zone and fret 1) */}
        <rect
          x={LABEL_W + FRET_W - 4}
          y={HEADER_H}
          width={6}
          height={OPEN_STRINGS.length * STRING_H}
          fill="#e0d8c8"
          rx={1}
        />

        {/* Fret bars (thin vertical lines for frets 2–12 and end cap) */}
        {Array.from({ length: NUM_FRETS + 1 }, (_, i) => i + 2).map(k => (
          <line
            key={k}
            x1={LABEL_W + k * FRET_W}
            y1={HEADER_H}
            x2={LABEL_W + k * FRET_W}
            y2={HEADER_H + OPEN_STRINGS.length * STRING_H}
            stroke="#888"
            strokeWidth={k === NUM_FRETS + 1 ? 2 : 1}
          />
        ))}

        {/* Fret numbers (header row) */}
        {Array.from({ length: NUM_FRETS + 1 }, (_, fret) => (
          fret > 0 && (
            <text
              key={fret}
              x={LABEL_W + (fret + 0.5) * FRET_W}
              y={HEADER_H - 7}
              textAnchor="middle"
              fontSize="11"
              fill="#555"
              className="select-none"
            >
              {fret}
            </text>
          )
        ))}

        {/* String name labels (left side) */}
        {OPEN_STRINGS.map((string, i) => (
          <text
            key={i}
            x={LABEL_W - 10}
            y={HEADER_H + i * STRING_H + STRING_H / 2 + 4}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#888"
            className="select-none"
          >
            {string.label}
          </text>
        ))}

        {/* Clickable note positions */}
        {positions.map(({ note, octave, stringIdx, fret, x, y }) => {
          const highlighted = isHighlighted(note);
          const selected = isSelected(stringIdx, fret);
          return (
            <g
              key={`${stringIdx}-${fret}`}
              onClick={() => onFretClick(note, octave, stringIdx, fret)}
              className="cursor-pointer"
            >
              <circle
                cx={x}
                cy={y}
                r={DOT_R}
                fill={highlighted ? DEGREE_COLORS[highlightedNotes.indexOf(note)] : 'transparent'}
                stroke={selected ? 'white' : highlighted ? DEGREE_COLORS[highlightedNotes.indexOf(note)] : 'rgba(255,255,255,0.12)'}
                strokeWidth={selected ? 2 : 1}
                className="transition-all duration-150 hover:stroke-white/50"
              />
              {/* Show note name inside highlighted circles */}
              {highlighted && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={selected ? 'white' : '#000'}
                  className="pointer-events-none select-none"
                >
                  {note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
