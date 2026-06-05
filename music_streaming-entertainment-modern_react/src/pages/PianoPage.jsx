import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { usePianoSampler } from '../hooks/usePianoSampler';

export const PianoPage = () => {
  const navigate = useNavigate();

  // loaded = piano samples have finished downloading, safe to play
  const { playNote, loaded } = usePianoSampler();

  const [selectedKey, setSelectedKey] = useState(null);
  const [scaleNotes, setScaleNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // zoom: 0.3 = see all 7 octaves at once, 1.0 = large keys, need to scroll
  const [zoom, setZoom] = useState(0.45);

  const handleKeyClick = async (note, octave) => {
    // Play sound — note + octave gives Tone.js e.g. "C#4"
    playNote(note, octave);

    // API only cares about the note name, not the octave
    setSelectedKey(note);
    setLoading(true);
    setError(null);

    try {
      // encodeURIComponent turns "C#" into "C%23" so the URL is valid
      const res = await fetch(`http://localhost:8081/api/keys/${encodeURIComponent(note)}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      // Response: { key: "C", notes: ["C","D","E","F","G","A","B"] }
      const data = await res.json();
      setScaleNotes(data.notes);
    } catch (err) {
      setError('Could not reach the API. Is the backend running on port 8081?');
      setScaleNotes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-textMain font-sans antialiased min-h-screen flex flex-col items-center justify-center px-4 relative">

      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm"
      >
        ← Back
      </button>

      <div className="text-center space-y-8 w-full max-w-6xl">

        {/* Title */}
        <div>
          <h1 className="font-display text-5xl font-bold mb-2">Piano</h1>
          <p className="text-textMuted text-lg">
            {loaded
              ? 'Click any key to hear it and see its major scale.'
              : 'Loading piano samples…'}
          </p>
        </div>

        {/* Zoom slider */}
        <div className="flex items-center justify-center gap-3 text-textMuted text-sm">
          <span className="text-lg">🔍−</span>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-48 accent-primary cursor-pointer"
          />
          <span className="text-lg">+</span>
          <span className="w-10 text-xs text-left">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Piano keyboard */}
        <div className="w-full rounded-xl">
          <PianoKeyboard
            onKeyClick={handleKeyClick}
            highlightedNotes={scaleNotes}
            zoom={zoom}
          />
        </div>

        {/* Scale result — only shown after a key is clicked */}
        {selectedKey && (
          <div className="glass-panel rounded-2xl p-6 text-left">
            <p className="text-sm text-primary font-bold uppercase tracking-wider mb-4">
              {loading ? 'Loading…' : `Key of ${selectedKey} major — notes`}
            </p>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {!loading && !error && (
              <div className="flex flex-wrap gap-2">
                {scaleNotes.map((note) => (
                  <span
                    key={note}
                    className="px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary font-bold text-sm"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
