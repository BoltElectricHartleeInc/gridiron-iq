import { Routes, Route, Navigate } from 'react-router-dom';
import { TeamSelectPage } from './pages/TeamSelectPage';
import { DraftBoardPage } from './pages/DraftBoardPage';
import { DraftResultsPage } from './pages/DraftResultsPage';
import { PreDraftPage } from './pages/PreDraftPage';
import { LandingPage } from './pages/LandingPage';
import { GameSelectPage } from './pages/GameSelectPage';
import { GamePlayPage } from './pages/GamePlayPage';
import { ScoutingPage } from './pages/ScoutingPage';
import { FantasyHubPage } from './pages/FantasyHubPage';
import { FantasyDraftPage } from './pages/FantasyDraftPage';
import { FantasyLeaguePage } from './pages/FantasyLeaguePage';
import { DFSPage } from './pages/DFSPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/draft/select" element={<TeamSelectPage />} />
        <Route path="/draft/pregame" element={<PreDraftPage />} />
        <Route path="/draft/board" element={<DraftBoardPage />} />
        <Route path="/draft/results" element={<DraftResultsPage />} />
        <Route path="/game/select" element={<GameSelectPage />} />
        <Route path="/game/play" element={<GamePlayPage />} />
        <Route path="/scouting" element={<ScoutingPage />} />
        {/* Fantasy */}
        <Route path="/fantasy" element={<FantasyHubPage />} />
        <Route path="/fantasy/draft" element={<FantasyDraftPage />} />
        <Route path="/fantasy/league" element={<FantasyLeaguePage />} />
        <Route path="/fantasy/dfs" element={<DFSPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
