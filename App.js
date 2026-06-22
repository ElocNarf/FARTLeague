import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CreateLeague from './pages/CreateLeague';
import JoinLeague from './pages/JoinLeague';
import League from './pages/League';
import ComposerPanel from './pages/ComposerPanel';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateLeague />} />
        <Route path="/join/:inviteCode" element={<JoinLeague />} />
        <Route path="/league/:leagueId" element={<League />} />
        <Route path="/league/:leagueId/composer" element={<ComposerPanel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
