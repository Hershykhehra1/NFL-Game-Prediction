import React from 'react';

/**
 * FeatureRow displays a single pregame differential metric with an icon,
 * descriptive label, formatted value, and team favor tag.
 */
export const FeatureRow = ({ Icon, label, desc, value, favors }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, padding: '11px 13px',
    background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: 'var(--teal-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={13} color="var(--teal-bright)" />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{desc}</div>
      </div>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div className="font-mono-num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)', marginTop: 2 }}>Favors {favors}</div>
    </div>
  </div>
);

export default FeatureRow;
