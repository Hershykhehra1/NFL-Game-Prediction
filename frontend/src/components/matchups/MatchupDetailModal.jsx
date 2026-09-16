import React from 'react';
import { TeamBadge, TEAM_INFO } from '../../utils/teamLogos';
import { X, TrendingUp, Zap, Scale, Clock, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

/* ── Feature Row ────────────────────────────────────────────────────── */
const FeatureRow = ({ Icon, label, desc, value, favors }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 14px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 12,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'var(--teal-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={14} color="var(--teal-bright)" />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{desc}</div>
      </div>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div className="font-mono-num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', marginTop: 2 }}>Favors {favors}</div>
    </div>
  </div>
);

/* ── Main Modal ─────────────────────────────────────────────────────── */
export const MatchupDetailModal = ({ game, onClose }) => {
  if (!game) return null;

  const { home_team, away_team, predicted_winner, confidence, differentials, model_breakdown, gameday } = game;

  const awayFullName = away_team.name || TEAM_INFO[away_team.abbr]?.name || away_team.abbr;
  const homeFullName = home_team.name || TEAM_INFO[home_team.abbr]?.name || home_team.abbr;
  const awayRecord = away_team.record || (away_team.wins !== undefined && away_team.losses !== undefined ? `${away_team.wins}-${away_team.losses}` : '0-0');
  const homeRecord = home_team.record || (home_team.wins !== undefined && home_team.losses !== undefined ? `${home_team.wins}-${home_team.losses}` : '0-0');

  const diffItems = [
    { label: 'Elo Rating Diff',       value: differentials.elo_diff > 0 ? `+${differentials.elo_diff}` : differentials.elo_diff,                                                      favors: differentials.elo_diff > 0 ? home_team.abbr : away_team.abbr,           icon: TrendingUp,    desc: 'Includes 55 Elo home field advantage'       },
    { label: 'Net EPA / Play Diff',   value: differentials.net_epa_diff > 0 ? `+${differentials.net_epa_diff}` : differentials.net_epa_diff,                                          favors: differentials.net_epa_diff > 0 ? home_team.abbr : away_team.abbr,       icon: Zap,           desc: 'Offensive vs defensive down efficiency'     },
    { label: 'Success Rate Diff',     value: `${differentials.net_success_diff > 0 ? '+' : ''}${differentials.net_success_diff}%`,                                                    favors: differentials.net_success_diff > 0 ? home_team.abbr : away_team.abbr,   icon: Scale,         desc: 'Percentage of positive EPA plays'           },
    { label: 'Recent 5-Game Margin',  value: differentials.recent_margin_diff > 0 ? `+${differentials.recent_margin_diff} pts` : `${differentials.recent_margin_diff} pts`,          favors: differentials.recent_margin_diff > 0 ? home_team.abbr : away_team.abbr, icon: TrendingUp,    desc: 'Weighted point differential form'           },
    { label: 'Turnover Rate Diff',    value: `${differentials.turnover_rate_diff > 0 ? '+' : ''}${differentials.turnover_rate_diff}%`,                                               favors: differentials.turnover_rate_diff < 0 ? home_team.abbr : away_team.abbr, icon: AlertTriangle, desc: 'Takeaway/giveaway rate per play'            },
    { label: 'Rest Advantage',        value: `${differentials.rest_diff > 0 ? '+' : ''}${differentials.rest_diff} days`,                                                             favors: differentials.rest_diff > 0 ? home_team.abbr : differentials.rest_diff < 0 ? away_team.abbr : 'Even', icon: Clock, desc: 'Rest days relative to opponent' },
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ padding: '24px 16px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 660,
          maxHeight: '88vh',
          overflowY: 'auto',
          background: 'rgba(9,17,24,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '32px 28px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 32px 80px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(20,184,166,0.1) inset',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div style={{ textAlign: 'center', paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--teal-bright)', marginBottom: 4 }}>
            Pregame Deep Dive
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{gameday}</div>
        </div>

        {/* Matchup Banner */}
        <div style={{
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '22px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Away */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
            <TeamBadge abbr={away_team.abbr} size={56} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>{away_team.abbr}</span>
              <span className="team-record-badge">{awayRecord}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{awayFullName}</div>
            <div className="font-mono-num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--teal-bright)' }}>
              {away_team.win_prob}%
            </div>
          </div>

          {/* Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase' }}>AT</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--green-dim)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 99,
              padding: '5px 12px',
            }}>
              <Sparkles size={12} color="var(--green)" className="sparkle-icon" />
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', whiteSpace: 'nowrap' }}>{predicted_winner}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{confidence}% conf.</span>
          </div>

          {/* Home */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
            <TeamBadge abbr={home_team.abbr} size={56} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>{home_team.abbr}</span>
              <span className="team-record-badge">{homeRecord}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{homeFullName}</div>
            <div className="font-mono-num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>
              {home_team.win_prob}%
            </div>
          </div>
        </div>

        {/* Probability Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="prob-label away">{away_team.abbr} {away_team.win_prob}%</span>
            <span className="prob-label home">{home_team.win_prob}% {home_team.abbr}</span>
          </div>
          <div className="prob-bar">
            <div className="prob-bar-segment away" style={{ width: `${away_team.win_prob}%` }} />
            <div className="prob-bar-segment home" style={{ width: `${home_team.win_prob}%` }} />
          </div>
        </div>

        {/* Ensemble Model Breakdown */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(20,184,166,0.15)',
          borderRadius: 14,
          padding: '18px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <ShieldCheck size={14} color="var(--green)" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              Ensemble Model Breakdown
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { name: `Logistic Regression`, weight: model_breakdown.logistic_weight, prob: model_breakdown.logistic_home_prob },
              { name: `HistGradientBoosting`, weight: model_breakdown.boosted_weight, prob: model_breakdown.boosted_home_prob },
            ].map((m) => (
              <div key={m.name} style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 6 }}>
                  {m.name} <span style={{ color: 'var(--teal-bright)', fontWeight: 700 }}>({m.weight}% wt)</span>
                </div>
                <div className="font-mono-num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
                  {m.prob}% <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{home_team.abbr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Differentials */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.8px',
            textTransform: 'uppercase', color: 'var(--text-3)',
            marginBottom: 12,
          }}>
            Pregame Feature Differentials (Home − Away)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {diffItems.map((item, i) => (
              <FeatureRow key={i} Icon={item.icon} label={item.label} desc={item.desc} value={item.value} favors={item.favors} />
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(16,185,129,0.3)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Close Analysis
        </button>
      </div>
    </div>
  );
};
