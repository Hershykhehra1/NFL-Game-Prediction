import React from 'react';
import { X, Maximize2, Minimize2, BarChart3, Users } from 'lucide-react';

/**
 * ModalTopBar renders:
 *  - The "Pregame Deep Dive" label + gameday subtitle
 *  - Fullscreen toggle + close button
 *  - Sticky tab switcher (Analysis / Player Stats)
 */
export const ModalTopBar = ({
  gameday,
  isFullscreen,
  onToggleFullscreen,
  onClose,
  activeTab,
  onTabChange,
  is_completed,
}) => {
  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'players', label: 'Player Stats', icon: Users },
  ];

  return (
    <>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--teal-bright)' }}>
            Pregame Deep Dive
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginTop: 2 }}>{gameday}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)',
              color: 'var(--teal-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.1)'; }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: 4,
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 12px', borderRadius: 9,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(20,184,166,0.25), rgba(16,185,129,0.15))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(20,184,166,0.4)' : '1px solid transparent',
                  color: isActive ? 'var(--teal-bright)' : 'var(--text-3)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: 8, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
                    padding: '2px 5px', borderRadius: 4,
                    background: is_completed ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)',
                    color: is_completed ? '#34d399' : '#fbbf24',
                    border: `1px solid ${is_completed ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                  }}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ModalTopBar;
