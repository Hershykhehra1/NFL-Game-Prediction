import React from 'react';
import { Crosshair, HeartPulse, ShieldCheck } from 'lucide-react';
import { FeatureRow } from './FeatureRow';

/**
 * AnalysisTab renders pregame forecasts, starting QB matchups, roster injury
 * breakdowns, ensemble model probabilities, and feature differentials.
 */
export const AnalysisTab = ({ game, sq, inj, diffItems, model_breakdown, home_team, away_team }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

    {/* Starting QBs */}
    <div style={{
      background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crosshair size={14} color="var(--teal-bright)" />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-2)' }}>
            Starting Quarterback Matchup
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--teal-bright)', fontWeight: 700 }}>
          {game.differentials.qb_epa_diff > 0
            ? `+${game.differentials.qb_epa_diff} EPA Favors ${home_team.abbr}`
            : game.differentials.qb_epa_diff < 0
              ? `+${Math.abs(game.differentials.qb_epa_diff)} EPA Favors ${away_team.abbr}`
              : 'Even QB EPA'}
        </span>
      </div>
      <div className="qb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { abbr: away_team.abbr, name: sq.away_qb, epa: sq.away_epa, cpoe: sq.away_cpoe, color: 'var(--teal-bright)' },
          { abbr: home_team.abbr, name: sq.home_qb, epa: sq.home_epa, cpoe: sq.home_cpoe, color: 'var(--green)' },
        ].map(qb => (
          <div key={qb.abbr} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: qb.color, marginBottom: 4 }}>{qb.abbr} QB</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>{qb.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
              <span>EPA/play: <strong style={{ color: 'var(--text-1)' }}>{qb.epa > 0 ? `+${qb.epa}` : qb.epa}</strong></span>
              <span>CPOE: <strong style={{ color: 'var(--text-1)' }}>{qb.cpoe > 0 ? `+${qb.cpoe}%` : `${qb.cpoe}%`}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Injuries */}
    <div style={{
      background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartPulse size={14} color="#f87171" />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-2)' }}>
            Position-Weighted Roster Injuries
          </span>
        </div>
        <span style={{ fontSize: 10, color: (game.differentials.injury_diff || 0) >= 0 ? 'var(--green)' : '#f87171', fontWeight: 700 }}>
          {(game.differentials.injury_diff || 0) > 0
            ? `Health Advantage: ${home_team.abbr} (+${game.differentials.injury_diff})`
            : (game.differentials.injury_diff || 0) < 0
              ? `Health Advantage: ${away_team.abbr} (+${Math.abs(game.differentials.injury_diff)})`
              : 'Even Health'}
        </span>
      </div>
      <div className="injury-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { abbr: away_team.abbr, index: inj.away_index, injuries: inj.away_injuries, color: 'var(--teal-bright)' },
          { abbr: home_team.abbr, index: inj.home_index, injuries: inj.home_injuries, color: 'var(--green)' },
        ].map(t => (
          <div key={t.abbr} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: t.color }}>{t.abbr} Injuries</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Impact: <strong style={{ color: '#f87171' }}>{t.index} pts</strong></span>
            </div>
            {t.injuries && t.injuries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {t.injuries.slice(0, 4).map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                      {p.name} <span style={{ color: 'var(--text-3)', fontSize: 10 }}>({p.position}{p.is_starter ? ' - Starter' : ''})</span>
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                      background: p.status === 'Out' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                      color: p.status === 'Out' ? '#f87171' : '#facc15',
                    }}>{p.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>No major reported starter injuries</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Ensemble Model Breakdown */}
    <div style={{
      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 14, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ShieldCheck size={14} color="var(--green)" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-3)' }}>
          Ensemble Model Breakdown
        </span>
      </div>
      <div className="model-breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { name: 'Logistic Regression', weight: model_breakdown.logistic_weight, prob: model_breakdown.logistic_home_win_prob },
          { name: 'HistGradientBoosting', weight: model_breakdown.boosted_weight, prob: model_breakdown.boosted_home_win_prob },
        ].map(m => (
          <div key={m.name} style={{
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>
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
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>
        Pregame Feature Differentials (Home − Away)
      </div>
      <div className="feature-diff-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {diffItems.map((item, i) => (
          <FeatureRow key={i} Icon={item.icon} label={item.label} desc={item.desc} value={item.value} favors={item.favors} />
        ))}
      </div>
    </div>
  </div>
);

export default AnalysisTab;
