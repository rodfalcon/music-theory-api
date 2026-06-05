import React, { useMemo } from 'react';

// Natural (unscaled) white key dimensions
const BASE_W = 40;
const WH = 160;  // white key height
const BW = 23;   // black key width (~58% of white key)
const BH = 100;  // black key height

const OCTAVES = [2, 3, 4, 5, 6, 7, 8]; // C2 → B8

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Black keys and which white key index they sit after within an octave
// e.g. C# sits after C (index 0), D# after D (index 1), no black between E and F
const BLACK_NOTE_DEFS = [
  { name: 'C#', offset: 0 },
  { name: 'D#', offset: 1 },
  { name: 'F#', offset: 3 },
  { name: 'G#', offset: 4 },
  { name: 'A#', offset: 5 },
];

// Full unscaled width: 7 octaves × 7 white keys × BASE_W = 1960px
const NATURAL_WIDTH = OCTAVES.length * 7 * BASE_W;

// onKeyClick(note, octave) — called when a key is pressed
// highlightedNotes — plain note names (no octave) to colour green across all octaves
// zoom — 0.3 to 1.0, controls rendered pixel size of the SVG
export const PianoKeyboard = ({ onKeyClick, highlightedNotes = [], zoom = 0.5 }) => {

  // Build the key data once — positions never change
  const { whiteKeys, blackKeys } = useMemo(() => {
    const whites = [];
    const blacks = [];

    OCTAVES.forEach((octave, octaveIdx) => {
      WHITE_NOTES.forEach((note, noteIdx) => {
        const globalIdx = octaveIdx * 7 + noteIdx;
        whites.push({ note, octave, x: globalIdx * BASE_W });
      });

      BLACK_NOTE_DEFS.forEach(({ name, offset }) => {
        const globalWhiteIdx = octaveIdx * 7 + offset;
        // Black key starts 70% into the white key it overlaps
        blacks.push({ note: name, octave, x: globalWhiteIdx * BASE_W + BASE_W * 0.7 });
      });
    });

    return { whiteKeys: whites, blackKeys: blacks };
  }, []);

  const isHighlighted = (note) => highlightedNotes.includes(note);

  return (
    // overflow-x-auto acts as a fallback for very low zoom or narrow screens
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${NATURAL_WIDTH} ${WH + 2}`}
        width={NATURAL_WIDTH * zoom}
        height={(WH + 2) * zoom}
      >
        {/* White keys rendered first so black keys appear on top */}
        {whiteKeys.map(({ note, octave, x }) => (
          <g key={`${note}${octave}`} onClick={() => onKeyClick(note, octave)} className="cursor-pointer">
            <rect
              x={x + 1}
              y={1}
              width={BASE_W - 2}
              height={WH}
              rx={3}
              fill={isHighlighted(note) ? '#1db954' : 'white'}
              stroke="#333"
              strokeWidth={1}
              className="transition-colors duration-150 hover:opacity-80"
            />
            {/* Only label C keys — marks each octave boundary */}
            {note === 'C' && (
              <text
                x={x + BASE_W / 2}
                y={WH - 8}
                textAnchor="middle"
                fontSize="10"
                fill={isHighlighted(note) ? '#000' : '#888'}
                className="pointer-events-none select-none"
              >
                C{octave}
              </text>
            )}
          </g>
        ))}

        {/* Black keys rendered on top of white keys */}
        {blackKeys.map(({ note, octave, x }) => (
          <g key={`${note}${octave}`} onClick={() => onKeyClick(note, octave)} className="cursor-pointer">
            <rect
              x={x}
              y={1}
              width={BW}
              height={BH}
              rx={3}
              fill={isHighlighted(note) ? '#1db954' : '#111'}
              stroke="#000"
              strokeWidth={1}
              className="transition-colors duration-150 hover:opacity-70"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
