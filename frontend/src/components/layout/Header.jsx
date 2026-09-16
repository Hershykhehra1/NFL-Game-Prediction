import React from 'react';
import { Shield, BarChart3, Sliders, Trophy, Calendar, RefreshCw } from 'lucide-react';

const TABS = [
  { id: 'matchups',  label: 'Matchups',       Icon: Shield    },
  { id: 'analytics', label: 'Model Metrics',  Icon: BarChart3 },
  { id: 'sandbox',   label: 'Sandbox',        Icon: Sliders   },
  { id: 'teams',     label: 'Power Rankings', Icon: Trophy    },
];

export const Header = ({
  season,
  setSeason,
  availableSeasons = [2026, 2025, 2024],
  week,
  setWeek,
  weeks = Array.from({ length: 18 }, (_, i) => i + 1),
  activeTab,
  setActiveTab,
  isLoaded,
  isRefreshing,
  onRefresh,
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
        <div className="nav-controls">
          {/* Season Picker */}
          <div className="season-select">
            <Calendar size={14} color="var(--green)" />
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Season</span>
            <select
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
            >
              {availableSeasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            className="icon-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh predictions"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
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
