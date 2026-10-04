import React, { useState } from 'react';
import { StatHeaderCell } from '../../common/StatInfoBubble';

export const fmt = (v, decimals = 1, fallback = '—') => {
  if (v === null || v === undefined || (typeof v === 'number' && isNaN(v))) return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : n.toFixed(decimals);
};

export const fmtInt = (v, fallback = '—') => {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : String(Math.round(n));
};

export const epaColor = (v) => {
  const n = Number(v);
  if (isNaN(n)) return 'var(--text-3)';
  return n > 0 ? '#34d399' : n < 0 ? '#f87171' : 'var(--text-3)';
};

export const fmtEpa = (v) => {
  const n = Number(v);
  if (isNaN(n)) return '—';
  return (n > 0 ? '+' : '') + n.toFixed(3);
};

export const StatTable = ({ category = '', columns, rows, emptyMsg = 'No data available' }) => {
  const [activeHeaderKey, setActiveHeaderKey] = useState(null);

  const handleToggle = (key) => {
    setActiveHeaderKey((prev) => (prev === key ? null : key));
  };
  const handleClose = () => setActiveHeaderKey(null);

  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-3)', fontSize: 12, fontStyle: 'italic' }}>
        {emptyMsg}
      </div>
    );
  }
  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {columns.map((col) => (
              <StatHeaderCell
                key={col.key}
                col={col}
                category={category}
                activeKey={activeHeaderKey}
                onToggle={handleToggle}
                onClose={handleClose}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              {columns.map((col) => {
                const val = row[col.key];
                const isName = col.key === 'name';
                const isPos = col.key === 'position';
                const isTeam = col.key === '_team';
                const isEpa = col.key?.includes('epa') || col.key === 'cpoe';
                const cellColor = isEpa ? epaColor(val) : isName ? 'var(--text-1)' : isTeam ? (row._color || 'var(--teal-bright)') : 'var(--text-2)';
                const displayVal = isEpa ? fmtEpa(val) : val ?? '—';
                return (
                  <td key={col.key} style={{
                    padding: '8px 10px', textAlign: col.align || 'right',
                    color: cellColor, fontWeight: (isName || isTeam) ? 700 : 500,
                    whiteSpace: isName ? 'nowrap' : 'normal',
                    fontFamily: (!isName && !isPos && !isTeam) ? 'Space Grotesk, monospace' : 'inherit',
                    fontSize: isName ? 12 : 11,
                  }}>
                    {isPos ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 6px', borderRadius: 5,
                        background: 'rgba(20,184,166,0.12)', color: 'var(--teal-bright)',
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.4px'
                      }}>{displayVal}</span>
                    ) : isTeam ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 5px', borderRadius: 4,
                        background: 'rgba(255,255,255,0.06)',
                        color: row._color || 'var(--teal-bright)',
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.5px'
                      }}>{displayVal}</span>
                    ) : String(displayVal)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatTable;
