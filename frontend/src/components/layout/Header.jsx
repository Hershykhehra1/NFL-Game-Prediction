import React from 'react';
import { Shield, BarChart3, Sliders, Trophy, Calendar, RefreshCw, Clock } from 'lucide-react';

const TABS = [
  { id: 'matchups',  label: 'Matchups',       Icon: Shield    },
  { id: 'analytics', label: 'Model Metrics',  Icon: BarChart3 },
  { id: 'sandbox',   label: 'Sandbox',        Icon: Sliders   },
  { id: 'teams',     label: 'Power Rankings', Icon: Trophy    },
];

export const Header = ({
  season,
  setSeason,
  availableSeasons = [2026, 2025, 2024, 2023, 2022, 2021],
  week,
  setWeek,
  weeks = Array.from({ length: 18 }, (_, i) => i + 1),
  activeTab,
  setActiveTab,
  isLoaded,
  isRefreshing,
  onRefresh,
  lastUpdated,
}) => {
  return (
    <header className="navbar">
      {/* ── Main Navbar ───────────────────────────── */}
      <div className="navbar-inner">

        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">GAMELYTICS</div>
            <div className="brand-sub">NFL Matchup Forecasting Engine</div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="nav-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-tab ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Last Refreshed Time Badge */}
          {lastUpdated && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '6px 10px',
                fontSize: 11,
                color: 'var(--text-3)',
              }}
              title="Timestamp when NFL data and player injuries were last synchronized into model memory"
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isRefreshing ? '#facc15' : 'var(--green)',
                  boxShadow: isRefreshing ? '0 0 8px #facc15' : '0 0 8px var(--green)',
                  display: 'inline-block',
                }}
              />
              <Clock size={12} color="var(--text-3)" />
              <span>Synced: <strong style={{ color: 'var(--text-2)' }}>{lastUpdated}</strong></span>
            </div>
          )}

          {/* Season Picker */}
          <div className="season-select">
            <Calendar size={14} color="var(--green)" />
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Season</span>
            <select
              value={season}
              onChange={(e) => {
                const s = Number(e.target.value);
                setSeason(s);
                if (setWeek) setWeek(1);
              }}
            >
              {availableSeasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            className="icon-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              width: 'auto',
              borderRadius: 10,
            }}
            title="Recalculate models and pull latest injury reports & scores from nflreadpy"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>
              {isRefreshing ? 'Updating…' : 'Recalculate'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Week Selector (Matchups only) ─────────── */}
      {activeTab === 'matchups' && (
        <div className="week-bar">
          <span className="week-label">Regular Season</span>
          {weeks.map((w) => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className={`week-pill ${week === w ? 'active' : ''}`}
            >
              Wk {w}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
