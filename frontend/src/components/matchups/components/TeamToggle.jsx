import React from 'react';

/**
 * TeamToggle selector allows switching between Away team, Both teams, and Home team views.
 */
export const TeamToggle = ({ away, home, selected, onChange }) => (
  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
    {[away, 'both', home].map((t) => (
      <button
        key={t}
        type="button"
        onClick={() => onChange(t)}
        style={{
          flex: 1, padding: '7px 4px', borderRadius: 8,
          border: `1px solid ${selected === t ? 'rgba(20,184,166,0.6)' : 'rgba(255,255,255,0.08)'}`,
          background: selected === t ? 'var(--teal-dim)' : 'rgba(0,0,0,0.3)',
          color: selected === t ? 'var(--teal-bright)' : 'var(--text-3)',
          fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', cursor: 'pointer',
          transition: 'all 0.18s', textTransform: 'uppercase',
        }}
      >
        {t === 'both' ? 'Both Teams' : t}
      </button>
    ))}
  </div>
);

export default TeamToggle;
