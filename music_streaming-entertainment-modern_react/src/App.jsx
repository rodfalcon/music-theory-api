import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import './styles/globals.css';
import { IndexPage } from './pages/IndexPage';
import { GuitarPage } from './pages/GuitarPage';
import { PianoPage } from './pages/PianoPage';

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/guitar" element={<GuitarPage />} />
        <Route path="/piano" element={<PianoPage />} />
      </Routes>
    </Router>
  );
};

export default App;
