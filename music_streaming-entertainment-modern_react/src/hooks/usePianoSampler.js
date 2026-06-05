import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

// Salamander Grand Piano — free, high-quality samples hosted by the Tone.js team.
// The sampler only loads a subset of notes; Tone.js interpolates the ones in between.
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

export const usePianoSampler = () => {
  const samplerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Create the sampler and connect it to the speakers
    const sampler = new Tone.Sampler({
      urls: SAMPLE_URLS,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => setLoaded(true),
    }).toDestination();

    samplerRef.current = sampler;

    // Clean up the audio node when the component unmounts
    return () => sampler.dispose();
  }, []);

  const playNote = async (note, octave) => {
    // Browsers block audio until the user has interacted with the page.
    // Tone.start() resumes the AudioContext — must be called inside a user event handler.
    await Tone.start();

    if (samplerRef.current && loaded) {
      // '2n' = half note duration. The note format Tone.js expects is e.g. "C#4"
      samplerRef.current.triggerAttackRelease(`${note}${octave}`, '2n');
    }
  };

  return { playNote, loaded };
};
