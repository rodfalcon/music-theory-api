import React from 'react';
import { DEGREE_COLORS } from '../constants/degreeColors';

const DEGREE_LABELS = ['1 — Root', '2', '3', '4', '5', '6', '7'];

export const ScaleLegend = ({ scaleNotes }) => {
  if (!scaleNotes || scaleNotes.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {scaleNotes.map((note, i) => (
        <div key={note} className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
            style={{ backgroundColor: DEGREE_COLORS[i] }}
          >
            {note}
          </div>
          <span className="text-xs text-textMuted">{DEGREE_LABELS[i]}</span>
        </div>
      ))}
    </div>
  );
};
