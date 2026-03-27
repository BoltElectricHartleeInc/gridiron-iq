import { useState } from 'react';
import { motion } from 'framer-motion';
import { NFL_TEAMS } from '../../data/teams';
import { NFL_ROSTERS } from '../../data/rosters';
import { useDraftStore } from '../../store/draftStore';
import { getPickValue, getFuturePickValue } from '../../data/tradeChart';
import type { DraftSession, RosterPlayer, FuturePick } from '../../types/draft';

interface Props {
  session: DraftSession;
  onClose: () => void;
}

const C = {
  bg: '#080810',
  surface: '#0d0d1a',
  elevated: '#12121f',
  border: 'rgba(255,255,255,0.08)',
  borderHi: 'rgba(255,255,255,0.15)',
  txt: 'rgba(255,255,255,0.9)',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.2)',
  blue: '#3b82f6',
  green: '#22c55e',
  gold: '#f59e0b',
  red: '#ef4444',
};

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'EDGE', 'DT', 'LB', 'CB', 'S'];

const POS_MULT: Record<string, number> = {
  QB: 2.0, EDGE: 1.4, OT: 1.3, CB: 1.2, WR: 1.2,
  DT: 1.1, S: 1.0, LB: 1.0, TE: 1.0, OG: 0.9,
  RB: 0.8, C: 0.8, K: 0.3, P: 0.3,
};

function playerValue(p: RosterPlayer): number {
  return Math.round(p.rating * p.contractYears * (POS_MULT[p.position] ?? 1.0));
}

function getRatingColor(rating: number): string {
  if (rating >= 90) return C.gold;
  if (rating >= 80) return C.blue;
  if (rating >= 70) return C.green;
  return '#6b7280';
}

type TabType = 'players' | 'picks';

interface ColumnProps {
  label: string;
  teamId: string;
  tab: TabType;
  setTab: (t: TabType) => void;
  search: string;
  setSearch: (s: string) => void;
  posFilter: string;
  setPosFilter: (p: string) => void;
  players: RosterPlayer[];
  selectedPlayerIds: string[];
  togglePlayer: (id: string) => void;
  currentPicks: ReturnType<typeof getDraftPicks>;
  futurePicks2027: FuturePick[];
  futurePicks2028: FuturePick[];
  selectedPickOveralls: number[];
  togglePick: (o: number) => void;
  selectedFutureIds: string[];
  toggleFuturePick: (id: string) => void;
  sendColor: string;
}

function getDraftPicks(session: DraftSession, teamId: string) {
  return session.picks.filter(p => p.teamId === teamId && !p.prospect);
}

function TradeColumn({
  label, teamId, tab, setTab, search, setSearch, posFilter, setPosFilter,
  players, selectedPlayerIds, togglePlayer,
  currentPicks, futurePicks2027, futurePicks2028,
  selectedPickOveralls, togglePick, selectedFutureIds, toggleFuturePick,
  sendColor,
}: ColumnProps) {
  const filteredPlayers = players
    .filter(p => posFilter === 'ALL' || p.position === posFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="flex flex-col" style={{ minWidth: 0 }}>
      {/* Column header */}
      <div className="mb-2 px-1">
        <div className="text-xs font-black uppercase tracking-widest" style={{ color: C.sub }}>
          {label}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(['players', 'picks'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
            style={{
              background: tab === t ? `${sendColor}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === t ? `${sendColor}55` : C.border}`,
              color: tab === t ? sendColor : C.sub,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'players' && (
        <div className="flex flex-col gap-2 min-h-0">
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full px-3 py-1.5 rounded-lg text-xs"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`,
              color: C.txt,
              outline: 'none',
            }}
          />
          {/* Position pills */}
          <div className="flex flex-wrap gap-1">
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className="px-1.5 py-0.5 rounded text-xs font-bold transition-all"
                style={{
                  background: posFilter === pos ? `${sendColor}22` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${posFilter === pos ? `${sendColor}44` : 'transparent'}`,
                  color: posFilter === pos ? sendColor : C.muted,
                  fontSize: '10px',
                }}
              >
                {pos}
              </button>
            ))}
          </div>
          {/* Player list */}
          <div className="overflow-y-auto flex-1 space-y-1" style={{ maxHeight: '280px' }}>
            {filteredPlayers.length === 0 ? (
              <div className="text-xs py-4 text-center" style={{ color: C.muted }}>No players found</div>
            ) : (
              filteredPlayers.map(player => {
                const selected = selectedPlayerIds.includes(player.id);
                return (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className="w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center gap-2"
                    style={{
                      background: selected ? `${sendColor}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selected ? `${sendColor}44` : C.border}`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-black"
                      style={{
                        background: `${getRatingColor(player.rating)}22`,
                        color: getRatingColor(player.rating),
                        fontSize: '10px',
                      }}
                    >
                      {player.rating}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: selected ? sendColor : C.txt }}>
                        {player.name}
                      </div>
                      <div className="text-xs" style={{ color: C.muted }}>
                        {player.position} · ${player.salary}M · {player.contractYears}yr
                      </div>
                    </div>
                    {selected && (
                      <div className="text-xs font-bold flex-shrink-0" style={{ color: sendColor }}>✓</div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === 'picks' && (
        <div className="overflow-y-auto space-y-3" style={{ maxHeight: '360px' }}>
          {/* 2026 Draft Picks */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>
              2026 Draft Picks
            </div>
            <div className="space-y-1">
              {currentPicks.length === 0 ? (
                <div className="text-xs px-2 py-1" style={{ color: C.muted }}>No picks</div>
              ) : (
                currentPicks.map(pick => {
                  const selected = selectedPickOveralls.includes(pick.overall);
                  return (
                    <button
                      key={pick.overall}
                      onClick={() => togglePick(pick.overall)}
                      className="w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center gap-2"
                      style={{
                        background: selected ? `${sendColor}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selected ? `${sendColor}44` : C.border}`,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)', color: C.sub, fontSize: '9px' }}
                      >
                        R{pick.round}
                      </div>
                      <div className="flex-1 text-xs font-semibold" style={{ color: selected ? sendColor : C.txt }}>
                        Pick #{pick.overall}
                      </div>
                      <div className="text-xs font-bold" style={{ color: C.muted }}>
                        {getPickValue(pick.overall)} pts
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2027 Picks */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>
              2027 Picks
            </div>
            <div className="space-y-1">
              {futurePicks2027.length === 0 ? (
                <div className="text-xs px-2 py-1" style={{ color: C.muted }}>No picks</div>
              ) : (
                futurePicks2027.map(pick => {
                  const selected = selectedFutureIds.includes(pick.id);
                  const origTeam = NFL_TEAMS.find(t => t.id === pick.originalTeamId);
                  const label = pick.originalTeamId === teamId
                    ? `R${pick.round} 2027`
                    : `R${pick.round} 2027 (via ${origTeam?.abbreviation ?? pick.originalTeamId})`;
                  return (
                    <button
                      key={pick.id}
                      onClick={() => toggleFuturePick(pick.id)}
                      className="w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center gap-2"
                      style={{
                        background: selected ? `${sendColor}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selected ? `${sendColor}44` : C.border}`,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)', color: C.sub, fontSize: '9px' }}
                      >
                        R{pick.round}
                      </div>
                      <div className="flex-1 text-xs font-semibold" style={{ color: selected ? sendColor : C.txt }}>
                        {label}
                      </div>
                      <div className="text-xs font-bold" style={{ color: C.muted }}>
                        {getFuturePickValue(pick.round, pick.year)} pts
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2028 Picks */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>
              2028 Picks
            </div>
            <div className="space-y-1">
              {futurePicks2028.length === 0 ? (
                <div className="text-xs px-2 py-1" style={{ color: C.muted }}>No picks</div>
              ) : (
                futurePicks2028.map(pick => {
                  const selected = selectedFutureIds.includes(pick.id);
                  const origTeam = NFL_TEAMS.find(t => t.id === pick.originalTeamId);
                  const label = pick.originalTeamId === teamId
                    ? `R${pick.round} 2028`
                    : `R${pick.round} 2028 (via ${origTeam?.abbreviation ?? pick.originalTeamId})`;
                  return (
                    <button
                      key={pick.id}
                      onClick={() => toggleFuturePick(pick.id)}
                      className="w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center gap-2"
                      style={{
                        background: selected ? `${sendColor}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selected ? `${sendColor}44` : C.border}`,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)', color: C.sub, fontSize: '9px' }}
                      >
                        R{pick.round}
                      </div>
                      <div className="flex-1 text-xs font-semibold" style={{ color: selected ? sendColor : C.txt }}>
                        {label}
                      </div>
                      <div className="text-xs font-bold" style={{ color: C.muted }}>
                        {getFuturePickValue(pick.round, pick.year)} pts
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TradeModal({ session, onClose }: Props) {
  const { futurePicks, rosterOverrides, acceptTrade, proposeTrade } = useDraftStore();

  const [targetTeamId, setTargetTeamId] = useState('');
  const [myTab, setMyTab] = useState<TabType>('players');
  const [theirTab, setTheirTab] = useState<TabType>('players');
  const [mySearch, setMySearch] = useState('');
  const [theirSearch, setTheirSearch] = useState('');
  const [myPosFilter, setMyPosFilter] = useState('ALL');
  const [theirPosFilter, setTheirPosFilter] = useState('ALL');
  const [myPlayerIds, setMyPlayerIds] = useState<string[]>([]);
  const [theirPlayerIds, setTheirPlayerIds] = useState<string[]>([]);
  const [myPickIds, setMyPickIds] = useState<number[]>([]);
  const [theirPickIds, setTheirPickIds] = useState<number[]>([]);
  const [myFutureIds, setMyFutureIds] = useState<string[]>([]);
  const [theirFutureIds, setTheirFutureIds] = useState<string[]>([]);
  const [result, setResult] = useState<'accepted' | 'rejected' | null>(null);

  const userTeamId = session.userTeamId;
  const userTeam = NFL_TEAMS.find(t => t.id === userTeamId);
  const targetTeam = NFL_TEAMS.find(t => t.id === targetTeamId);

  // Compute rosters with overrides applied
  const getTeamRoster = (teamId: string): RosterPlayer[] => {
    const base = NFL_ROSTERS[teamId] ?? [];
    // Include players whose override is this team, exclude players whose override is another team
    const overrideAdditions = Object.entries(rosterOverrides)
      .filter(([, newTeam]) => newTeam === teamId)
      .map(([playerId]) => {
        // Find the player in any team's roster
        for (const roster of Object.values(NFL_ROSTERS)) {
          const p = roster.find(r => r.id === playerId);
          if (p) return { ...p, teamId };
        }
        return null;
      })
      .filter((p): p is RosterPlayer => p !== null);

    return [
      ...base.filter(p => (rosterOverrides[p.id] ?? p.teamId) === teamId),
      ...overrideAdditions.filter(p => !base.some(b => b.id === p.id)),
    ];
  };

  const myRoster = getTeamRoster(userTeamId);
  const targetRoster = targetTeamId ? getTeamRoster(targetTeamId) : [];

  // Current draft picks
  const myCurrentPicks = getDraftPicks(session, userTeamId);
  const theirCurrentPicks = targetTeamId ? getDraftPicks(session, targetTeamId) : [];

  // Future picks
  const myFuturePicks2027 = futurePicks.filter(p => p.teamId === userTeamId && p.year === 2027);
  const myFuturePicks2028 = futurePicks.filter(p => p.teamId === userTeamId && p.year === 2028);
  const theirFuturePicks2027 = futurePicks.filter(p => p.teamId === targetTeamId && p.year === 2027);
  const theirFuturePicks2028 = futurePicks.filter(p => p.teamId === targetTeamId && p.year === 2028);

  // Selected items
  const mySelectedPlayers = myRoster.filter(p => myPlayerIds.includes(p.id));
  const theirSelectedPlayers = targetRoster.filter(p => theirPlayerIds.includes(p.id));
  const mySelectedFutures = futurePicks.filter(p => myFutureIds.includes(p.id));
  const theirSelectedFutures = futurePicks.filter(p => theirFutureIds.includes(p.id));

  // Values
  const myPicksValue = myPickIds.reduce((s, o) => s + getPickValue(o), 0);
  const theirPicksValue = theirPickIds.reduce((s, o) => s + getPickValue(o), 0);
  const myFutureValue = mySelectedFutures.reduce((s, p) => s + getFuturePickValue(p.round, p.year), 0);
  const theirFutureValue = theirSelectedFutures.reduce((s, p) => s + getFuturePickValue(p.round, p.year), 0);
  const myPlayerValue = mySelectedPlayers.reduce((s, p) => s + playerValue(p), 0);
  const theirPlayerValue = theirSelectedPlayers.reduce((s, p) => s + playerValue(p), 0);

  const myTotalValue = myPicksValue + myFutureValue + myPlayerValue;
  const theirTotalValue = theirPicksValue + theirFutureValue + theirPlayerValue;
  const hasItems = myTotalValue > 0 || theirTotalValue > 0;

  // Value balance
  const maxVal = Math.max(myTotalValue, theirTotalValue, 1);
  const diff = Math.abs(myTotalValue - theirTotalValue) / maxVal;
  const isFair = diff <= 0.10;
  const isClose = diff <= 0.15;
  const balanceColor = isFair ? C.green : isClose ? C.gold : C.red;

  const toggleMyPlayer = (id: string) =>
    setMyPlayerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleTheirPlayer = (id: string) =>
    setTheirPlayerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleMyPick = (o: number) =>
    setMyPickIds(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  const toggleTheirPick = (o: number) =>
    setTheirPickIds(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  const toggleMyFuture = (id: string) =>
    setMyFutureIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleTheirFuture = (id: string) =>
    setTheirFutureIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handlePropose = () => {
    if (!targetTeamId) return;
    const hasMyOffer = myPlayerIds.length > 0 || myPickIds.length > 0 || myFutureIds.length > 0;
    const hasTheirOffer = theirPlayerIds.length > 0 || theirPickIds.length > 0 || theirFutureIds.length > 0;
    if (!hasMyOffer || !hasTheirOffer) return;

    if (!isClose) {
      setResult('rejected');
      setTimeout(() => setResult(null), 2000);
      return;
    }

    const pkg = {
      offeringTeamId: userTeamId,
      receivingTeamId: targetTeamId,
      offeringPicks: myPickIds,
      receivingPicks: theirPickIds,
      offeringFuturePickIds: myFutureIds,
      receivingFuturePickIds: theirFutureIds,
      jimJohnsonValue: theirTotalValue - myTotalValue,
    };

    const accepted = proposeTrade(pkg);
    if (accepted) {
      acceptTrade(pkg, { outgoing: myPlayerIds, incoming: theirPlayerIds });
      setResult('accepted');
      setTimeout(onClose, 1500);
    } else {
      setResult('rejected');
      setTimeout(() => setResult(null), 2000);
    }
  };

  const canPropose = targetTeamId &&
    (myPlayerIds.length > 0 || myPickIds.length > 0 || myFutureIds.length > 0) &&
    (theirPlayerIds.length > 0 || theirPickIds.length > 0 || theirFutureIds.length > 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl flex flex-col rounded-2xl"
        style={{
          background: `linear-gradient(160deg, ${C.surface} 0%, ${C.bg} 100%)`,
          border: `1px solid ${C.border}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="font-black text-base uppercase tracking-widest" style={{ color: C.txt }}>
            &#8644; TRADE CENTER
          </div>

          {/* Target team selector */}
          <div className="flex-1 flex justify-center">
            <select
              value={targetTeamId}
              onChange={e => {
                setTargetTeamId(e.target.value);
                setTheirPickIds([]);
                setTheirPlayerIds([]);
                setTheirFutureIds([]);
              }}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${C.border}`,
                color: C.txt,
                outline: 'none',
                minWidth: '200px',
              }}
            >
              <option value="" style={{ background: '#0d0d1a' }}>Select target team...</option>
              {NFL_TEAMS.filter(t => t.id !== userTeamId).map(team => (
                <option key={team.id} value={team.id} style={{ background: '#0d0d1a' }}>
                  {team.city} {team.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: C.sub }}
          >
            &#10005;
          </button>
        </div>

        {/* Main workspace */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-2 gap-4 px-5 py-4 overflow-hidden">
            {/* LEFT: You Send */}
            <TradeColumn
              label={`YOU SEND — ${userTeam?.abbreviation ?? userTeamId.toUpperCase()}`}
              teamId={userTeamId}
              tab={myTab}
              setTab={setMyTab}
              search={mySearch}
              setSearch={setMySearch}
              posFilter={myPosFilter}
              setPosFilter={setMyPosFilter}
              players={myRoster}
              selectedPlayerIds={myPlayerIds}
              togglePlayer={toggleMyPlayer}
              currentPicks={myCurrentPicks}
              futurePicks2027={myFuturePicks2027}
              futurePicks2028={myFuturePicks2028}
              selectedPickOveralls={myPickIds}
              togglePick={toggleMyPick}
              selectedFutureIds={myFutureIds}
              toggleFuturePick={toggleMyFuture}
              sendColor={C.red}
            />

            {/* RIGHT: You Receive */}
            <TradeColumn
              label={`YOU RECEIVE — ${targetTeam?.abbreviation ?? (targetTeamId ? targetTeamId.toUpperCase() : '???')}`}
              teamId={targetTeamId}
              tab={theirTab}
              setTab={setTheirTab}
              search={theirSearch}
              setSearch={setTheirSearch}
              posFilter={theirPosFilter}
              setPosFilter={setTheirPosFilter}
              players={targetRoster}
              selectedPlayerIds={theirPlayerIds}
              togglePlayer={toggleTheirPlayer}
              currentPicks={theirCurrentPicks}
              futurePicks2027={theirFuturePicks2027}
              futurePicks2028={theirFuturePicks2028}
              selectedPickOveralls={theirPickIds}
              togglePick={toggleTheirPick}
              selectedFutureIds={theirFutureIds}
              toggleFuturePick={toggleTheirFuture}
              sendColor={C.green}
            />
          </div>

          {/* Value bar */}
          {hasItems && (
            <div
              className="mx-5 mb-3 p-3 rounded-xl"
              style={{ background: C.elevated, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-3">
                <div className="text-center" style={{ minWidth: '80px' }}>
                  <div className="text-xs font-black uppercase tracking-wider" style={{ color: C.red }}>YOUR OFFER</div>
                  <div className="text-base font-black" style={{ color: C.txt }}>{myTotalValue}</div>
                  <div className="text-xs" style={{ color: C.muted }}>pts</div>
                </div>

                <div className="flex-1">
                  {/* Visual bar */}
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    {(myTotalValue > 0 || theirTotalValue > 0) && (
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(5, Math.min(95, (myTotalValue / (myTotalValue + theirTotalValue)) * 100))}%`,
                          background: `linear-gradient(90deg, ${C.red}, ${balanceColor})`,
                        }}
                      />
                    )}
                  </div>
                  <div className="text-center text-xs mt-1 font-bold" style={{ color: balanceColor }}>
                    {isFair
                      ? '✓ Fair Trade'
                      : isClose
                        ? `~${Math.round(diff * 100)}% off — may be accepted`
                        : `✗ ${Math.round(diff * 100)}% imbalanced — likely rejected`}
                  </div>
                </div>

                <div className="text-center" style={{ minWidth: '80px' }}>
                  <div className="text-xs font-black uppercase tracking-wider" style={{ color: C.green }}>YOU RECEIVE</div>
                  <div className="text-base font-black" style={{ color: C.txt }}>{theirTotalValue}</div>
                  <div className="text-xs" style={{ color: C.muted }}>pts</div>
                </div>
              </div>
            </div>
          )}

          {/* Summary chips */}
          {hasItems && (
            <div
              className="mx-5 mb-3 p-3 rounded-xl"
              style={{ background: C.elevated, border: `1px solid ${C.border}` }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: C.red }}>You Send</div>
                  <div className="flex flex-wrap gap-1">
                    {mySelectedPlayers.map(p => (
                      <span key={p.id} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {p.name} {p.position} {p.rating}OVR
                      </span>
                    ))}
                    {myPickIds.map(o => (
                      <span key={o} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        2026 #{o}
                      </span>
                    ))}
                    {mySelectedFutures.map(p => (
                      <span key={p.id} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        R{p.round} {p.year}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: C.green }}>You Receive</div>
                  <div className="flex flex-wrap gap-1">
                    {theirSelectedPlayers.map(p => (
                      <span key={p.id} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        {p.name} {p.position} {p.rating}OVR
                      </span>
                    ))}
                    {theirPickIds.map(o => (
                      <span key={o} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        2026 #{o}
                      </span>
                    ))}
                    {theirSelectedFutures.map(p => (
                      <span key={p.id} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        R{p.round} {p.year}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className="mx-5 mb-3 p-2.5 rounded-xl text-center font-black text-sm uppercase tracking-widest"
              style={{
                background: result === 'accepted' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${result === 'accepted' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: result === 'accepted' ? '#4ade80' : '#f87171',
              }}
            >
              {result === 'accepted' ? '✓ TRADE ACCEPTED!' : '✗ Trade Rejected'}
            </div>
          )}

          {/* Propose button */}
          <div className="px-5 pb-4 flex-shrink-0">
            <button
              onClick={handlePropose}
              disabled={!canPropose}
              className="w-full font-black py-3 rounded-xl transition-all text-sm uppercase tracking-widest"
              style={{
                background: canPropose
                  ? 'linear-gradient(135deg, rgba(180,130,0,0.4), rgba(180,130,0,0.2))'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${canPropose ? 'rgba(180,130,0,0.5)' : C.border}`,
                color: canPropose ? '#fbbf24' : C.muted,
                cursor: canPropose ? 'pointer' : 'not-allowed',
                opacity: canPropose ? 1 : 0.5,
              }}
            >
              Propose Trade
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
