import React from 'react';
import { Sparkles } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamLogos';

/**
 * MatchupBanner displays the full team header for the modal:
 * away team | center prediction pill | home team, plus the probability bar.
 */
export const MatchupBanner = ({
  away_team,
  home_team,
  predicted_winner,
  confidence,
  awayFullName,
  homeFullName,
  awayRecord,
  homeRecord,
  is_completed,
}) => (
  <>
    {/* ── Matchup Header Grid ── */}
    <div
      className="modal-matchup-banner"
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 12px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}
    >
      {/* Away */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5 }}>
        <TeamBadge abbr={away_team.abbr} size={52} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{away_team.abbr}</span>
          <span className="team-record-badge">{awayRecord}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>{awayFullName}</div>
        <div className="font-mono-num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal-bright)' }}>
          {away_team.win_prob}%
        </div>
        {is_completed && away_team.score !== null && away_team.score !== undefined && (
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)' }}>{away_team.score}</div>
        )}
      </div>

      {/* Center */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase' }}>AT</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 99, padding: '4px 10px',
        }}>
          <Sparkles size={11} color="var(--green)" className="sparkle-icon" />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)' }}>{predicted_winner}</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>{confidence}% conf.</span>
      </div>

      {/* Home */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5 }}>
        <TeamBadge abbr={home_team.abbr} size={52} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{home_team.abbr}</span>
          <span className="team-record-badge">{homeRecord}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>{homeFullName}</div>
        <div className="font-mono-num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>
          {home_team.win_prob}%
        </div>
        {is_completed && home_team.score !== null && home_team.score !== undefined && (
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)' }}>{home_team.score}</div>
        )}
      </div>
    </div>

    {/* ── Probability Bar ── */}
    <div style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span className="prob-label away">{away_team.abbr} {away_team.win_prob}%</span>
        <span className="prob-label home">{home_team.win_prob}% {home_team.abbr}</span>
      </div>
      <div className="prob-bar">
        <div className="prob-bar-segment away" style={{ width: `${away_team.win_prob}%` }} />
        <div className="prob-bar-segment home" style={{ width: `${home_team.win_prob}%` }} />
      </div>
    </div>
  </>
);

export default MatchupBanner;
