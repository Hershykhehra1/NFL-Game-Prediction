import React, { useState, useEffect, useCallback } from 'react';
import { TEAM_INFO } from '../../utils/teamLogos';
import { getBoxscore } from '../../services/api';
import {
  TrendingUp, Zap, Scale, Clock, AlertTriangle,
  UserCheck, HeartPulse, Crosshair,
} from 'lucide-react';

/* ─── Sub-components ─────────────────────────────────────────── */
import { ModalTopBar }   from './components/ModalTopBar';
import { MatchupBanner } from './components/MatchupBanner';
import { AnalysisTab }   from './components/AnalysisTab';
import { PlayerStatsTab } from './components/PlayerStatsTab';

/* ─── Main Modal ─────────────────────────────────────────────── */
export const MatchupDetailModal = ({ game, onClose }) => {
  const [activeTab, setActiveTab]               = useState('analysis');
  const [isFullscreen, setIsFullscreen]         = useState(false);
  const [boxscore, setBoxscore]                 = useState(null);
  const [isLoadingBoxscore, setIsLoadingBoxscore] = useState(false);
  const [boxscoreError, setBoxscoreError]       = useState(null);
  const [isVisible, setIsVisible]               = useState(false);

  /* Animate in */
  useEffect(() => {
    const t = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  /* Fetch box score when Player Stats tab is selected and game is completed */
  useEffect(() => {
    if (activeTab === 'players' && game.is_completed && !boxscore && !isLoadingBoxscore) {
      setIsLoadingBoxscore(true);
      setBoxscoreError(null);
      getBoxscore(game.game_id)
        .then(data => {
          setBoxscore(data);
          setIsLoadingBoxscore(false);
        })
        .catch(err => {
          setBoxscoreError(err.message || 'Failed to load player stats');
          setIsLoadingBoxscore(false);
        });
    }
  }, [activeTab, game.is_completed, game.game_id, boxscore, isLoadingBoxscore]);

  /* Close on Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  if (!game) return null;

  const {
    home_team, away_team, predicted_winner, confidence, differentials,
    starting_qbs, injury_breakdown, model_breakdown, gameday,
  } = game;

  const awayFullName = away_team.name  || TEAM_INFO[away_team.abbr]?.name  || away_team.abbr;
  const homeFullName = home_team.name  || TEAM_INFO[home_team.abbr]?.name  || home_team.abbr;
  const awayRecord   = away_team.record || `${away_team.wins  ?? 0}-${away_team.losses  ?? 0}`;
  const homeRecord   = home_team.record || `${home_team.wins  ?? 0}-${home_team.losses  ?? 0}`;

  const sq  = starting_qbs    || { home_qb: 'Starting QB', away_qb: 'Starting QB', home_epa: 0, away_epa: 0, home_cpoe: 0, away_cpoe: 0 };
  const inj = injury_breakdown || { home_index: 0, away_index: 0, home_injuries: [], away_injuries: [] };

  /* ── Feature differential rows passed down to AnalysisTab ── */
  const diffItems = [
    {
      label: 'Elo Rating Diff',
      value: differentials.elo_diff > 0 ? `+${differentials.elo_diff}` : differentials.elo_diff,
      favors: differentials.elo_diff > 0 ? home_team.abbr : away_team.abbr,
      icon: TrendingUp,
      desc: 'Includes 55 Elo home field advantage',
    },
    {
      label: 'Starting QB EPA / Play',
      value: differentials.qb_epa_diff !== undefined
        ? (differentials.qb_epa_diff > 0 ? `+${differentials.qb_epa_diff}` : differentials.qb_epa_diff)
        : '+0.00',
      favors: (differentials.qb_epa_diff || 0) > 0 ? home_team.abbr : away_team.abbr,
      icon: Crosshair,
      desc: 'Rolling QB passing & rushing EPA differential',
    },
    {
      label: 'Starting QB CPOE (%)',
      value: differentials.qb_cpoe_diff !== undefined
        ? `${differentials.qb_cpoe_diff > 0 ? '+' : ''}${differentials.qb_cpoe_diff}%`
        : '+0.0%',
      favors: (differentials.qb_cpoe_diff || 0) > 0 ? home_team.abbr : away_team.abbr,
      icon: UserCheck,
      desc: 'Completion % Over Expected accuracy form',
    },
    {
      label: 'Roster Health Advantage',
      value: differentials.injury_diff !== undefined
        ? `${differentials.injury_diff > 0 ? '+' : ''}${differentials.injury_diff} pts`
        : '0.0 pts',
      favors: (differentials.injury_diff || 0) > 0 ? home_team.abbr : away_team.abbr,
      icon: HeartPulse,
      desc: 'Position-weighted injury impact differential',
    },
    {
      label: 'Net EPA / Play Diff',
      value: differentials.net_epa_diff > 0 ? `+${differentials.net_epa_diff}` : differentials.net_epa_diff,
      favors: differentials.net_epa_diff > 0 ? home_team.abbr : away_team.abbr,
      icon: Zap,
      desc: 'Offensive vs defensive down efficiency',
    },
    {
      label: 'Success Rate Diff',
      value: `${differentials.net_success_diff > 0 ? '+' : ''}${differentials.net_success_diff}%`,
      favors: differentials.net_success_diff > 0 ? home_team.abbr : away_team.abbr,
      icon: Scale,
      desc: 'Percentage of positive EPA plays',
    },
    {
      label: 'Recent 5-Game Margin',
      value: differentials.recent_margin_diff > 0
        ? `+${differentials.recent_margin_diff} pts`
        : `${differentials.recent_margin_diff} pts`,
      favors: differentials.recent_margin_diff > 0 ? home_team.abbr : away_team.abbr,
      icon: TrendingUp,
      desc: 'Weighted point differential form',
    },
    {
      label: 'Turnover Rate Diff',
      value: `${differentials.turnover_rate_diff > 0 ? '+' : ''}${differentials.turnover_rate_diff}%`,
      favors: differentials.turnover_rate_diff < 0 ? home_team.abbr : away_team.abbr,
      icon: AlertTriangle,
      desc: 'Takeaway/giveaway rate per play',
    },
    {
      label: 'Rest Advantage',
      value: `${differentials.rest_diff > 0 ? '+' : ''}${differentials.rest_diff} days`,
      favors: differentials.rest_diff > 0 ? home_team.abbr : differentials.rest_diff < 0 ? away_team.abbr : 'Even',
      icon: Clock,
      desc: 'Rest days relative to opponent',
    },
  ];

  /* ── Modal sizing ── */
  const modalW      = isFullscreen ? '100vw' : 'min(92vw, 780px)';
  const modalH      = isFullscreen ? '100vh' : '92vh';
  const modalRadius = isFullscreen ? 0 : 22;
  const modalPad    = isFullscreen ? '28px 32px' : '28px 24px';

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      style={{
        padding: isFullscreen ? 0 : '20px 12px',
        alignItems: isFullscreen ? 'flex-start' : 'center',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="modal-sheet"
        style={{
          width: modalW,
          maxWidth: '100%',
          height: modalH,
          maxHeight: '100%',
          overflowY: 'auto',
          background: 'rgba(8,16,23,0.98)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: isFullscreen ? 'none' : '1px solid var(--border)',
          borderRadius: modalRadius,
          padding: modalPad,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: isFullscreen
            ? 'none'
            : '0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px rgba(20,184,166,0.1) inset',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), width 0.25s, height 0.25s, border-radius 0.25s',
        }}
      >
        {/* ── Top Bar + Tabs ── */}
        <ModalTopBar
          gameday={gameday}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(v => !v)}
          onClose={handleClose}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          is_completed={game.is_completed}
        />

        {/* ── Matchup Banner + Probability Bar ── */}
        <MatchupBanner
          away_team={away_team}
          home_team={home_team}
          predicted_winner={predicted_winner}
          confidence={confidence}
          awayFullName={awayFullName}
          homeFullName={homeFullName}
          awayRecord={awayRecord}
          homeRecord={homeRecord}
          is_completed={game.is_completed}
        />

        {/* ── Tab Content ── */}
        <div style={{ width: '100%', minHeight: 'auto' }}>
          {activeTab === 'analysis' && (
            <AnalysisTab
              game={game}
              sq={sq}
              inj={inj}
              diffItems={diffItems}
              model_breakdown={model_breakdown}
              home_team={home_team}
              away_team={away_team}
            />
          )}
          {activeTab === 'players' && (
            <PlayerStatsTab
              game={game}
              boxscore={boxscore}
              isLoadingBoxscore={isLoadingBoxscore}
              boxscoreError={boxscoreError}
            />
          )}
        </div>

        {/* ── Footer Close ── */}
        <button
          onClick={handleClose}
          style={{
            flexShrink: 0, width: '100%', padding: '12px 0', borderRadius: 11,
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(16,185,129,0.3)', transition: 'opacity 0.2s',
            marginTop: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Close
        </button>
      </div>
    </div>
  );
};
