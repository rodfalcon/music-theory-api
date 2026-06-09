import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tone from 'tone';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SAMPLE_URLS = {
  A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
  A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
  A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
  A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
  A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
  A5: 'A5.mp3', C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
  A6: 'A6.mp3', C7: 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3',
  A7: 'A7.mp3', C8: 'C8.mp3',
};

function parseChord(chord) {
  if (chord.endsWith('dim')) return { root: chord.slice(0, -3), quality: 'dim' };
  if (chord.endsWith('m'))   return { root: chord.slice(0, -1),  quality: 'm'   };
  return { root: chord, quality: '' };
}

function noteAtInterval(root, semitones) {
  const idx = CHROMATIC.indexOf(root);
  if (idx === -1) return root;
  return CHROMATIC[(idx + semitones) % 12];
}

function chordNotes(chord) {
  const { root, quality } = parseChord(chord);
  const third = quality === ''    ? 4 : 3;
  const fifth  = quality === 'dim' ? 6 : 7;
  return [
    `${root}4`,
    `${noteAtInterval(root, third)}4`,
    `${noteAtInterval(root, fifth)}4`,
  ];
}

export const ProgressionsPage = () => {
  const navigate = useNavigate();

  const [selectedKey,  setSelectedKey]  = useState('C');
  const [selectedMode, setSelectedMode] = useState('major');
  const [progressions, setProgressions] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [samplerLoaded, setSamplerLoaded] = useState(false);

  const [activeProgIdx,  setActiveProgIdx]  = useState(null);
  const [currentChordIdx, setCurrentChordIdx] = useState(-1);
  const [currentBeat, setCurrentBeat]         = useState(-1);
  const [isPlaying, setIsPlaying]             = useState(false);
  const [bpm, setBpm]                         = useState(100);

  const samplerRef = useRef(null);
  const seqRef     = useRef(null);
  const beatRepRef = useRef(null);

  // load sampler once
  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: SAMPLE_URLS,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => setSamplerLoaded(true),
    }).toDestination();
    samplerRef.current = sampler;
    return () => { sampler.dispose(); stopTransport(); };
  }, []);

  // fetch progressions when key or mode changes
  useEffect(() => {
    stopTransport();
    setActiveProgIdx(null);
    setCurrentChordIdx(-1);

    const fetch_ = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/progressions?key=${encodeURIComponent(selectedKey)}&mode=${selectedMode}`
        );
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setProgressions(data.progressions ?? []);
      } catch {
        setError('Could not reach the API. Is the backend running?');
        setProgressions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [selectedKey, selectedMode]);

  const stopTransport = useCallback(() => {
    if (seqRef.current) { seqRef.current.stop(); seqRef.current.dispose(); seqRef.current = null; }
    if (beatRepRef.current !== null) { Tone.Transport.clear(beatRepRef.current); beatRepRef.current = null; }
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setIsPlaying(false);
    setCurrentChordIdx(-1);
    setCurrentBeat(-1);
  }, []);

  const startPlaying = useCallback(async (progIdx) => {
    if (!samplerLoaded) return;
    stopTransport();

    await Tone.start();
    Tone.Transport.bpm.value = bpm;

    const chords = progressions[progIdx]?.chords ?? [];
    if (!chords.length) return;

    // beat indicator: fires every quarter note
    const beatCounts = { v: 0 };
    beatRepRef.current = Tone.Transport.scheduleRepeat((time) => {
      const beat = beatCounts.v % 4;
      beatCounts.v++;
      setTimeout(() => setCurrentBeat(beat), 0);
    }, '4n');

    // chord sequence: one chord per measure (4 beats)
    const indices = chords.map((_, i) => i);
    seqRef.current = new Tone.Sequence((time, idx) => {
      const notes = chordNotes(chords[idx]);
      if (samplerRef.current && samplerLoaded) {
        samplerRef.current.triggerAttackRelease(notes, '2n', time);
      }
      setTimeout(() => setCurrentChordIdx(idx), 0);
    }, indices, '1m');

    seqRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
    setActiveProgIdx(progIdx);
  }, [bpm, progressions, samplerLoaded, stopTransport]);

  const handleCardClick = (idx) => {
    if (isPlaying && activeProgIdx === idx) {
      stopTransport();
    } else {
      startPlaying(idx);
    }
  };

  // update BPM live
  const handleBpmChange = (val) => {
    setBpm(val);
    Tone.Transport.bpm.value = val;
  };

  const activeProg = activeProgIdx !== null ? progressions[activeProgIdx] : null;

  return (
    <div className="bg-background text-textMain font-sans antialiased min-h-screen px-4 py-16 relative">

      <button
        onClick={() => { stopTransport(); navigate('/'); }}
        className="absolute top-8 left-8 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm"
      >
        ← Back
      </button>

      <div className="max-w-3xl mx-auto space-y-10 pt-8">

        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-5xl font-bold mb-2">Chord Progressions</h1>
          <p className="text-textMuted text-lg">
            {samplerLoaded ? 'Pick a key, choose a progression, hit play.' : 'Loading piano samples…'}
          </p>
        </div>

        {/* Key selector */}
        <div className="space-y-2">
          <p className="text-xs text-textMuted uppercase tracking-widest font-bold text-center">Key</p>
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

        {/* Mode selector */}
        <div className="space-y-2">
          <p className="text-xs text-textMuted uppercase tracking-widest font-bold text-center">Mode</p>
          <div className="flex justify-center gap-3">
            {['major', 'minor'].map(mode => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all duration-150 ${
                  selectedMode === mode
                    ? 'bg-primary text-black'
                    : 'border border-white/20 text-textMuted hover:border-white hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Progression cards */}
        {loading && (
          <p className="text-center text-textMuted animate-pulse">Loading progressions…</p>
        )}
        {error && (
          <p className="text-center text-red-400 text-sm">{error}</p>
        )}

        {!loading && !error && progressions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {progressions.map((prog, idx) => {
              const isActive   = activeProgIdx === idx;
              const isThisBeat = isActive && isPlaying;

              return (
                <div
                  key={prog.name}
                  onClick={() => handleCardClick(idx)}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(29,185,84,0.15)]'
                      : 'border-white/10 bg-white/3 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-textMuted uppercase tracking-widest font-bold mb-1">
                        {selectedKey} {selectedMode}
                      </p>
                      <h3 className={`font-display font-bold text-xl ${isActive ? 'text-primary' : 'text-white'}`}>
                        {prog.name}
                      </h3>
                    </div>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                      isActive && isPlaying ? 'bg-primary border-primary' : 'border-white/20'
                    }`}>
                      {isActive && isPlaying ? (
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Chord chips */}
                  <div className="flex flex-wrap gap-2">
                    {prog.chords.map((chord, chordIdx) => (
                      <span
                        key={chordIdx}
                        className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-100 ${
                          isThisBeat && currentChordIdx === chordIdx
                            ? 'bg-primary text-black scale-110'
                            : isActive
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-white/5 text-textMuted border border-white/10'
                        }`}
                      >
                        {chord}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Player / Metronome — shown once a progression is active */}
        {activeProg && (
          <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-5">

            {/* Now playing */}
            <div className="text-center">
              <p className="text-xs text-textMuted uppercase tracking-widest font-bold mb-1">Now Playing</p>
              <p className="font-display font-bold text-2xl text-primary">{activeProg.name}</p>
            </div>

            {/* Beat indicator — 4 dots */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map(beat => (
                <div
                  key={beat}
                  className={`w-4 h-4 rounded-full transition-all duration-75 ${
                    isPlaying && currentBeat === beat
                      ? beat === 0 ? 'bg-primary scale-125' : 'bg-white scale-110'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>

            {/* BPM control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-textMuted uppercase tracking-widest font-bold">Tempo</p>
                <span className="text-primary font-bold text-lg">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="200"
                step="1"
                value={bpm}
                onChange={(e) => handleBpmChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-textMuted">
                <span>40</span>
                <span>Slow ← → Fast</span>
                <span>200</span>
              </div>
            </div>

            {/* Play / Stop button */}
            <div className="flex justify-center">
              <button
                onClick={() => isPlaying ? stopTransport() : startPlaying(activeProgIdx)}
                disabled={!samplerLoaded}
                className={`px-10 py-3 rounded-full font-bold text-lg transition-all duration-150 disabled:opacity-40 ${
                  isPlaying
                    ? 'bg-white/10 border border-white/20 hover:bg-white/20 text-white'
                    : 'bg-primary text-black hover:bg-primaryHover'
                }`}
              >
                {isPlaying ? '⏹ Stop' : '▶ Play'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
