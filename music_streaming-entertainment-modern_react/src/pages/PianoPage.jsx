import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PianoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-textMain font-sans antialiased min-h-screen flex flex-col items-center justify-center">
      <h1 className="font-display text-5xl font-bold mb-4">Piano</h1>
      <p className="text-textMuted text-xl mb-8">Keyboard coming soon.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
};
