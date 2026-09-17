import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import TrackedPage from './pages/TrackedPage';
import ReloadPrompt from './components/ReloadPrompt';
import { TrackingProvider } from './context/TrackingContext';

function App() {
  return (
    <TrackingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tracked" element={<TrackedPage />} />
        </Routes>
        <ReloadPrompt />
      </BrowserRouter>
    </TrackingProvider>
  );
}

export default App;
