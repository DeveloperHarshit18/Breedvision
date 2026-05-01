import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import Navbar from './components/Navbar';

export default function App() {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <Router>
      <Navbar onHelpClick={() => setShowHelpModal(true)} />
      <Routes>
        <Route path="/" element={<HomePage showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/history" element={<HistoryPage showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />} />
      </Routes>
    </Router>
  );
}
