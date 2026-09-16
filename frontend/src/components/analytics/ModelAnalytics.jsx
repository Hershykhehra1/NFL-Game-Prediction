import React, { useEffect, useState } from 'react';
import { Award, PieChart, Layers, TrendingUp } from 'lucide-react';
import { getModelPerformance } from '../../services/api';

/* ── Stat Tile ─────────────────────────────────────────────────────── */
const StatTile = ({ label, value, color = 'var(--green)' }) => (
  <div style={{
    background: 'rgba(0,0,0,0.45)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '18px 20px',
    textAlign: 'center',
  }}>
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      color: 'var(--text-3)',
      marginBottom: 8,
    }}>
      {label}
    </div>
    <div className="font-mono-num" style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
      {value}
    </div>
  </div>
);

/* ── Weight Bar ─────────────────────────────────────────────────────── */
const WeightBar = ({ label, pct, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
      <span className="font-mono-num" style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
    </div>
    <div style={{
      height: 8, borderRadius: 99,
      background: 'rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', borderRadius: 99,
        width: `${pct}%`,
        background: color,
        transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────── */
export const ModelAnalytics = () => {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getModelPerformance()
      .then((d) => { setData(d); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="content-area">
      <div className="glass-panel" style={{ padding: '64px 40px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px' }} />
        <div className="skeleton" style={{ width: 200, height: 20, margin: '0 auto 10px' }} />
        <div className="skeleton" style={{ width: 300, height: 14, margin: '0 auto' }} />
      </div>
    </div>
  );

  if (!data) return null;

  const { weights, summary, by_season } = data;

  return (
    <div className="content-area" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Hero Banner ──────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '32px 36px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Award size={15} color="var(--green)" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--teal-bright)' }}>
              Walk-Forward Time Series Validation
            </span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', marginBottom: 10, lineHeight: 1.2 }}>
            Leakage-Free Model Performance
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.75, maxWidth: 520 }}>
            Models are trained and evaluated using strictly out-of-sample time series splits across historical seasons. Ensemble weights are derived from inverse Brier scores to prioritize calibrated probabilities.
          </p>
        </div>

        {/* Ensemble Weight Panel */}
        <div style={{
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <PieChart size={14} color="var(--green)" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              Ensemble Weighting
            </span>
          </div>
          <WeightBar label="HistGradientBoosting" pct={weights?.boosted ?? 50} color="var(--green)" />
          <WeightBar label="Logistic Regression" pct={weights?.logistic ?? 50} color="var(--teal-bright)" />
        </div>
      </div>

      {/* ── Model Summary Cards ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {summary?.map((m) => (
          <div key={m.model} className="glass-panel" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--green-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Layers size={16} color="var(--green)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', textTransform: 'capitalize' }}>
                    {m.model} Model
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                    Out-of-sample evaluation
                  </div>
                </div>
              </div>
              <span className="badge badge-high">{m.weight}% Weight</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <StatTile label="Accuracy" value={`${m.accuracy}%`} color="var(--green)" />
              <StatTile label="Brier Score" value={m.brier_score} color="var(--teal-bright)" />
              <StatTile label="Log Loss" value={m.log_loss} color="var(--text-2)" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Season-by-Season Table ───────────────────── */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--green-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={16} color="var(--green)" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Season-by-Season Results</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Historical walk-forward evaluation per season</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(20,184,166,0.18)' }}>
                {['Season', 'Model', 'Games', 'Accuracy', 'Brier Score', 'Log Loss'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    color: 'var(--text-3)',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {by_season?.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="font-mono-num" style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                    {row.season}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>
                    {row.model}
                  </td>
                  <td className="font-mono-num" style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-3)' }}>
                    {row.games}
                  </td>
                  <td className="font-mono-num" style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
                    {row.accuracy}%
                  </td>
                  <td className="font-mono-num" style={{ padding: '13px 16px', fontSize: 12, color: 'var(--teal-bright)' }}>
                    {row.brier}
                  </td>
                  <td className="font-mono-num" style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-2)' }}>
                    {row.log_loss}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
