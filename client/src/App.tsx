import { Routes, Route, Navigate } from 'react-router-dom';
import { TeamSelectPage } from './pages/TeamSelectPage';
import { DraftBoardPage } from './pages/DraftBoardPage';
import { DraftResultsPage } from './pages/DraftResultsPage';
import { PreDraftPage } from './pages/PreDraftPage';
import { LandingPage } from './pages/LandingPage';
import { GameSelectPage } from './pages/GameSelectPage';
import { GamePlayPage } from './pages/GamePlayPage';
import { GameModesPage } from './pages/GameModesPage';
import { SeasonModePage } from './pages/SeasonModePage';
import { FranchiseModePage } from './pages/FranchiseModePage';
import { PlayoffsPage } from './pages/PlayoffsPage';
import { ScoutingPage } from './pages/ScoutingPage';
import { FantasyHubPage } from './pages/FantasyHubPage';
import { FantasyDraftPage } from './pages/FantasyDraftPage';
import { FantasyLeaguePage } from './pages/FantasyLeaguePage';
import { DFSPage } from './pages/DFSPage';
import { RecruitingPage } from './pages/RecruitingPage';
import { ContractNegotiationPage } from './pages/ContractNegotiationPage';
import { RebuildChallengePage } from './pages/RebuildChallengePage';
import { HistoricalErasPage } from './pages/HistoricalErasPage';
import CareerModePage from './pages/CareerModePage';
import CombinePage from './pages/CombinePage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import PresserPage from './pages/PresserPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/draft/select" element={<TeamSelectPage />} />
        <Route path="/draft/pregame" element={<PreDraftPage />} />
        <Route path="/draft/board" element={<DraftBoardPage />} />
        <Route path="/draft/results" element={<DraftResultsPage />} />
        {/* Game Modes */}
        <Route path="/game" element={<GameModesPage />} />
        <Route path="/game/select" element={<GameSelectPage />} />
        <Route path="/game/play" element={<GamePlayPage />} />
        <Route path="/game/season" element={<SeasonModePage />} />
        <Route path="/game/franchise" element={<FranchiseModePage />} />
        <Route path="/game/playoffs" element={<PlayoffsPage />} />
        <Route path="/scouting" element={<ScoutingPage />} />
        {/* Fantasy */}
        <Route path="/fantasy" element={<FantasyHubPage />} />
        <Route path="/fantasy/draft" element={<FantasyDraftPage />} />
        <Route path="/fantasy/league" element={<FantasyLeaguePage />} />
        <Route path="/fantasy/dfs" element={<DFSPage />} />
        {/* Recruiting */}
        <Route path="/recruiting" element={<RecruitingPage />} />
        {/* Franchise — Contract Negotiations */}
        <Route path="/franchise/contract" element={<ContractNegotiationPage />} />
        {/* Rebuild Challenge */}
        <Route path="/rebuild" element={<RebuildChallengePage />} />
        {/* Historical Eras */}
        <Route path="/game/historical" element={<HistoricalErasPage />} />
        {/* Career Mode */}
        <Route path="/career" element={<CareerModePage />} />
        {/* Draft Combine */}
        <Route path="/combine" element={<CombinePage />} />
        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        {/* Press Conference */}
        <Route path="/presser" element={<PresserPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
