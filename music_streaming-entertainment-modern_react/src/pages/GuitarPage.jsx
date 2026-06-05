import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fretboard } from '../components/Fretboard';
import { usePianoSampler } from '../hooks/usePianoSampler';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_TYPES = [
  { label: 'Major',         value: 'Ionian'      },
  { label: 'Natural Minor', value: 'Aeolian'     },
  { label: 'Dorian',        value: 'Dorian'      },
  { label: 'Phrygian',      value: 'Phrygian'    },
  { label: 'Lydian',        value: 'Lydian'      },
  { label: 'Mixolydian',    value: 'Mixolydian'  },
  { label: 'Locrian',       value: 'Locrian'     },
];

export const GuitarPage = () => {
  const navigate = useNavigate();
  const { playNote, loaded } = usePianoSampler();

  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('Ionian');
  const [scaleNotes, setScaleNotes] = useState([]);
  const [selectedPos, setSelectedPos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(0.75);

  // Fetch scale whenever key or scale type changes
  useEffect(() => {
    const fetchScale = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/scale/${encodeURIComponent(selectedKey)}/${selectedScale}`
        );
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        // Response: { root: "C", type: "Ionian", notes: ["C","D","E","F","G","A","B"] }
        const data = await res.json();
        setScaleNotes(data.notes);
      } catch (err) {
        setError('Could not reach the API. Is the backend running on port 8081?');
        setScaleNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScale();
  }, [selectedKey, selectedScale]);

  // Clicking a fret plays the note — it no longer changes the scale
  const handleFretClick = (note, octave, stringIdx, fret) => {
    playNote(note, octave);
    setSelectedPos({ stringIdx, fret });
  };

  const scaleLabel = SCALE_TYPES.find(s => s.value === selectedScale)?.label ?? selectedScale;

  return (
    <div className="bg-background text-textMain font-sans antialiased min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">

      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm"
      >
        ← Back
      </button>

      <div className="text-center space-y-8 w-full max-w-6xl">

        {/* Title */}
        <div>
          <h1 className="font-display text-5xl font-bold mb-2">Guitar</h1>
          <p className="text-textMuted text-lg">
            {loaded ? 'Choose a key and scale. Click any fret to hear the note.' : 'Loading samples…'}
          </p>
        </div>

        {/* Key selector */}
        <div className="space-y-2">
          <p className="text-xs text-textMuted uppercase tracking-widest font-bold">Key</p>
          <div className="flex flex-wrap justify-center gap-2">
            {KEYS.map(key => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 ${
                  selectedKey === key
                    ? 'bg-primary text-black'
                    : 'border border-white/20 text-textMuted hover:border-white hover:text-white'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Scale type selector */}
        <div className="space-y-2">
          <p className="text-xs text-textMuted uppercase tracking-widest font-bold">Scale</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SCALE_TYPES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedScale(value)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 ${
                  selectedScale === value
                    ? 'bg-primary text-black'
                    : 'border border-white/20 text-textMuted hover:border-white hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Active scale summary */}
        <p className="text-primary font-bold text-lg tracking-wide">
          {loading ? 'Loading…' : error ? '' : `${selectedKey} ${scaleLabel} — ${scaleNotes.join('  ·  ')}`}
        </p>

        {/* Zoom slider */}
        <div className="flex items-center justify-center gap-3 text-textMuted text-sm">
          <span className="text-lg">🔍−</span>
          <input
            type="range"
            min="0.4"
            max="1.2"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-48 accent-primary cursor-pointer"
          />
          <span className="text-lg">+</span>
          <span className="w-10 text-xs text-left">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Fretboard */}
        <div className="w-full rounded-xl">
          <Fretboard
            onFretClick={handleFretClick}
            highlightedNotes={scaleNotes}
            selectedPos={selectedPos}
            zoom={zoom}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

      </div>
    </div>
  );
};
