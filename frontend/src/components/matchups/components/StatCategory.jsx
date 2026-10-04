import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StatTable } from './StatTable';

/**
 * StatCategory renders a collapsible category block (Passing, Rushing, etc.)
 * containing the associated StatTable.
 */
export const StatCategory = ({ categoryKey, title, icon, iconColor, accent, columns, rows, emptyMsg }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', padding: 0, marginBottom: open ? 10 : 0,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 9, padding: '8px 12px', background: accent,
          borderRadius: 9, border: `1px solid ${iconColor}33`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {React.createElement(icon, { size: 13, color: iconColor })}
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.7px', textTransform: 'uppercase', color: iconColor }}>{title}</span>
            {rows && rows.length > 0 && (
              <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>({rows.length})</span>
            )}
          </div>
          {open ? <ChevronUp size={13} color={iconColor} /> : <ChevronDown size={13} color={iconColor} />}
        </div>
      </button>
      {open && (
        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, overflow: 'visible',
        }}>
          <StatTable category={categoryKey} columns={columns} rows={rows} emptyMsg={emptyMsg} />
        </div>
      )}
    </div>
  );
};

export default StatCategory;
