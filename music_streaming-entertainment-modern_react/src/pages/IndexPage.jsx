import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Link } from '../components/Link';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Image } from '../components/Image';

export const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-textMain font-sans antialiased selection:bg-primary selection:text-black">
      <>
        {/* Navbar */}
        <header>
          <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-black/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-black fill-current" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </Icon>
                  </div>
                  <Text variant="bold" className="font-display font-bold text-2xl tracking-tight">NoteFlow</Text>
                </div>
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMuted">
                  <Link className="hover:text-white transition-colors" href="#instruments">Instruments</Link>
                  <Link className="hover:text-white transition-colors" href="#explore">Explore</Link>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <Button variant="primary" className="md:hidden p-2 rounded-full text-textMuted hover:text-white hover:bg-white/10 focus:outline-none">
                    <Icon className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </Icon>
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section id="instruments" className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
          <div style={{ animationDelay: '2s' }} className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Title */}
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
                Music Theory Explorer
              </div>
              <h1 className="font-display text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                Master{' '}
                <Text className="text-gradient">Music Theory.</Text>
              </h1>
              <p className="text-xl text-textMuted max-w-lg mx-auto leading-relaxed">
                Pick your instrument. Explore scales, chords, and keys.
              </p>
            </div>

            {/* Instrument Cards */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">

              {/* Guitar Card */}
              <div
                onClick={() => navigate('/guitar')}
                className="group cursor-pointer glass-panel rounded-3xl overflow-hidden relative hover:scale-[1.03] transition-all duration-300 hover:shadow-[0_0_40px_rgba(29,185,84,0.2)]"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80"
                    alt="Guitar"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-2xl mb-1">Guitar</h3>
                    <p className="text-textMuted text-sm">Fretboard · Scales · Chords</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <Icon className="w-5 h-5 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </Icon>
                  </div>
                </div>
              </div>

              {/* Piano Card */}
              <div
                onClick={() => navigate('/piano')}
                className="group cursor-pointer glass-panel rounded-3xl overflow-hidden relative hover:scale-[1.03] transition-all duration-300 hover:shadow-[0_0_40px_rgba(29,185,84,0.2)]"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80"
                    alt="Piano"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-2xl mb-1">Piano</h3>
                    <p className="text-textMuted text-sm">Keys · Scales · Chords</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <Icon className="w-5 h-5 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </Icon>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section id="explore" className="py-24 bg-surface relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-display text-4xl font-bold mb-2">Explore</h2>
                <p className="text-textMuted">Scales, modes, and chord theory — all in one place.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: 'Major Scales', desc: 'The foundation of western music.', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80' },
                { title: 'Minor Scales', desc: 'Natural, harmonic, melodic.', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
                { title: 'Modes', desc: 'Dorian, Phrygian, Lydian & more.', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=600&q=80' },
                { title: 'Chord Theory', desc: 'Triads, 7ths, extensions.', img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80' },
              ].map((item) => (
                <div key={item.title} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-textMuted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-surface py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Icon className="w-3 h-3 text-black fill-current" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </Icon>
                </div>
                <Text variant="bold" className="font-display font-bold text-lg">NoteFlow</Text>
              </div>
              <p className="text-xs text-textMuted">© 2026 NoteFlow. Built with Java + React.</p>
            </div>
          </div>
        </footer>
      </>
    </div>
  );
};
