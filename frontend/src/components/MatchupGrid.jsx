import React, { useState } from 'react';
import { MatchupCard } from './MatchupCard';
import { MatchupDetailModal } from './MatchupDetailModal';
import { Search, Filter, CheckCircle2, Sparkles } from 'lucide-react';

/* ── Skeleton placeholder card ────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="game-card" style={{ cursor: 'default' }}>
    <div className="card-header">
      <div className="skeleton" style={{ width: 80, height: 12 }} />
      <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 99 }} />
    </div>
    <div className="teams-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%' }} />
        <div>
          <div className="skeleton" style={{ width: 48, height: 18, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 72, height: 11 }} />
        </div>
      </div>
      <div className="vs-divider" style={{ opacity: 0.3 }}>@</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: 'row-reverse' }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%' }} />
        <div style={{ textAlign: 'right' }}>
          <div className="skeleton" style={{ width: 48, height: 18, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 72, height: 11 }} />
        </div>
      </div>
    </div>
    <div className="prob-section">
      <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 99 }} />
    </div>
    <div className="card-footer">
      <div className="skeleton" style={{ width: 120, height: 12 }} />
      <div className="skeleton" style={{ width: 64, height: 12 }} />
    </div>
  </div>
);

/* ── Main Grid Component ───────────────────────────────────────────── */
export const MatchupGrid = ({ games = [], isLoading }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterTier, setFilterTier]     = useState('ALL');

  const filteredGames = games.filter((game) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      game.home_team.abbr.toLowerCase().includes(q) ||
      game.away_team.abbr.toLowerCase().includes(q) ||
      game.home_team.name?.toLowerCase().includes(q) ||
      game.away_team.name?.toLowerCase().includes(q);

    const matchesFilter =
      filterTier === 'ALL' ||
      game.confidence_tier?.toUpperCase() === filterTier;

    return matchesSearch && matchesFilter;
  });

  const completedCount = games.filter((g) => g.is_completed).length;
  const correctCount   = games.filter((g) => g.is_completed && g.is_correct).length;
  const accuracyPct    = completedCount > 0
    ? ((correctCount / completedCount) * 100).toFixed(1)
    : null;

  return (
    <div className="content-area">
      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="toolbar">
        <div className="toolbar-left">
          {/* Search */}
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Confidence Filter */}
          <div className="filter-select">
            <Filter size={14} color="var(--green)" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="ALL">All Confidence</option>
              <option value="HIGH">High (&gt;75%)</option>
              <option value="MODERATE">Moderate (60–75%)</option>
              <option value="TOSS-UP">Toss-Up (&lt;60%)</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
            <strong style={{ color: 'var(--green)', fontFamily: 'Space Grotesk, monospace' }}>
              {isLoading ? '—' : filteredGames.length}
            </strong>{' '}
            matchups
          </span>

          {accuracyPct !== null && (
            <span className="stat-pill">
              <CheckCircle2 size={12} />
              Week Accuracy: {accuracyPct}% ({correctCount}/{completedCount})
            </span>
          )}
        </div>
      </div>

      {/* ── Cards Grid ───────────────────────────────── */}
      {isLoading ? (
        <div className="matchup-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: '64px 24px', textAlign: 'center' }}
        >
          <Sparkles size={28} color="var(--text-3)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
            No Matchups Found
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Try adjusting your search or confidence filter.
          </p>
        </div>
      ) : (
        <div className="matchup-grid">
          {filteredGames.map((game) => (
            <MatchupCard
              key={game.game_id}
              game={game}
              onSelect={(g) => setSelectedGame(g)}
            />
          ))}
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────── */}
      {selectedGame && (
        <MatchupDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
};
