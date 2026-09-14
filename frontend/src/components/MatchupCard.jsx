import React from 'react';
import { TeamBadge, TEAM_INFO } from '../utils/teamLogos';
import { Sparkles, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

/* ── Helpers ─────────────────────────────────────────────────────── */
const confidenceBadge = (tier, pct) => {
  const map = {
    High:     { cls: 'badge badge-high',     label: `High · ${pct}%`     },
    Moderate: { cls: 'badge badge-moderate', label: `Moderate · ${pct}%` },
    'Toss-Up':{ cls: 'badge badge-tossup',   label: `Toss-Up · ${pct}%`  },
  };
  return map[tier] || map['Moderate'];
};

export const MatchupCard = ({ game, onSelect }) => {
  const {
    home_team, away_team,
    predicted_winner, confidence, confidence_tier,
    is_completed, is_correct, gameday,
  } = game;

  const isHomeFavored = predicted_winner === home_team.abbr;
  const isAwayFavored = predicted_winner === away_team.abbr;
  const { cls: badgeCls, label: badgeLabel } = confidenceBadge(confidence_tier, confidence);
  const winnerTeam = isHomeFavored ? home_team : away_team;

  const awayFullName = away_team.name || TEAM_INFO[away_team.abbr]?.name || away_team.abbr;
  const homeFullName = home_team.name || TEAM_INFO[home_team.abbr]?.name || home_team.abbr;
  const awayRecord = away_team.record || (away_team.wins !== undefined && away_team.losses !== undefined ? `${away_team.wins}-${away_team.losses}` : '0-0');
  const homeRecord = home_team.record || (home_team.wins !== undefined && home_team.losses !== undefined ? `${home_team.wins}-${home_team.losses}` : '0-0');

  return (
    <div className="game-card" onClick={() => onSelect(game)}>

      {/* Ambient winner glow */}
      <div
        className="game-card-glow"
        style={{ background: winnerTeam.primary || 'var(--green)' }}
      />

      {/* ── Card Header: Date + Badge ──────────────── */}
      <div className="card-header">
        <span className="card-date">{gameday}</span>

        {is_completed ? (
          is_correct ? (
            <span className="badge badge-correct">
              <CheckCircle2 size={11} /> Correct Pick
            </span>
          ) : (
            <span className="badge badge-wrong">
              <XCircle size={11} /> Upset
            </span>
          )
        ) : (
          <span className={badgeCls}>{badgeLabel}</span>
        )}
      </div>

      {/* ── Teams Row ──────────────────────────────── */}
      <div className="teams-row">

        {/* Away */}
        <div className="team-block away">
          <TeamBadge abbr={away_team.abbr} size={44} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
              <span className={`team-abbr ${isAwayFavored ? 'favored' : ''}`}>
                {away_team.abbr}
              </span>
              {isAwayFavored && (
                <Sparkles size={13} className="sparkle-icon" color="var(--green)" />
              )}
              <span className="team-record-badge">{awayRecord}</span>
            </div>
            <div className="team-name" title={awayFullName}>{awayFullName}</div>
            {is_completed && (
              <div className="team-score">{away_team.score} pts</div>
            )}
          </div>
        </div>

        {/* VS */}
        <div className="vs-divider">@</div>

        {/* Home */}
        <div className="team-block home">
          <TeamBadge abbr={home_team.abbr} size={44} />
          <div style={{ minWidth: 0, overflow: 'hidden', textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, flexWrap: 'nowrap' }}>
              <span className="team-record-badge">{homeRecord}</span>
              {isHomeFavored && (
                <Sparkles size={13} className="sparkle-icon" color="var(--green)" />
              )}
              <span className={`team-abbr ${isHomeFavored ? 'favored' : ''}`}>
                {home_team.abbr}
              </span>
            </div>
            <div className="team-name" title={homeFullName}>{homeFullName}</div>
            {is_completed && (
              <div className="team-score">{home_team.score} pts</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Win Probability Bar ────────────────────── */}
      <div className="prob-section">
        <div className="prob-labels">
          <span className="prob-label away">
            {away_team.abbr} {away_team.win_prob}%
          </span>
          <span className="prob-label home">
            {home_team.win_prob}% {home_team.abbr}
          </span>
        </div>
        <div className="prob-bar">
          <div
            className="prob-bar-segment away"
            style={{ width: `${away_team.win_prob}%` }}
          />
          <div
            className="prob-bar-segment home"
            style={{ width: `${home_team.win_prob}%` }}
          />
        </div>
      </div>

      {/* ── Card Footer ────────────────────────────── */}
      <div className="card-footer">
        <div>
          <span className="predicted-winner-label">Predicted winner</span>
          <span className="predicted-winner-value">{predicted_winner}</span>
        </div>
        <div className="deep-dive-link">
          Deep Dive <ArrowUpRight size={13} />
        </div>
      </div>
    </div>
  );
};
