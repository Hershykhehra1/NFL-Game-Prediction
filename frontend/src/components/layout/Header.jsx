import React, { useState, useEffect, useRef } from 'react';
import { Shield, BarChart3, Sliders, Trophy, Calendar, RefreshCw, Clock, Menu, X, ChevronDown } from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [menuOpen]);

  // Close menu on tab change
  const handleTabChange = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab);

  return (
    <header className="navbar">
      {/* ── Main Navbar ───────────────────────────── */}
      <div className="navbar-inner" ref={menuRef}>

        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">GAMELYTICS</div>
            <div className="brand-sub hide-mobile">NFL Matchup Forecasting Engine</div>
          </div>
        </div>

        {/* Nav Tabs — Desktop */}
        <nav className="nav-tabs desktop-only">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`nav-tab ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="nav-controls">

          {/* Last Refreshed Time Badge - desktop only */}
          {lastUpdated && (
            <div
              className="sync-badge desktop-only"
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
                  flexShrink: 0,
                }}
              />
              <Clock size={12} color="var(--text-3)" />
              <span>Synced: <strong style={{ color: 'var(--text-2)' }}>{lastUpdated}</strong></span>
            </div>
          )}

          {/* Current Season Badge — desktop only */}
          <div className="season-badge desktop-only">
            <Calendar size={14} color="var(--green)" />
            <span>2026 Season</span>
          </div>

          {/* Refresh Button */}
          <button
            className="icon-btn refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Recalculate models and pull latest injury reports & scores from nflreadpy"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="refresh-label">{isRefreshing ? 'Updating…' : 'Recalculate'}</span>
          </button>

          {/* Hamburger — Mobile only */}
          <button
            className="hamburger-btn mobile-only"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile Dropdown Menu ─────────────────── */}
        {menuOpen && (
          <div className="mobile-menu">
            {/* Active tab indicator */}
            <div className="mobile-menu-section-label">Navigation</div>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`mobile-nav-item ${activeTab === id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {activeTab === id && (
                  <span className="mobile-nav-active-dot" />
                )}
              </button>
            ))}

            {/* Season badge in mobile menu */}
            <div className="mobile-menu-divider" />
            <div className="mobile-menu-section-label">Status</div>
            <div className="mobile-meta-row">
              <Calendar size={13} color="var(--green)" />
              <span>2026 NFL Season</span>
            </div>
            {lastUpdated && (
              <div className="mobile-meta-row">
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isRefreshing ? '#facc15' : 'var(--green)',
                    flexShrink: 0,
                  }}
                />
                <Clock size={13} color="var(--text-3)" />
                <span>Synced: <strong style={{ color: 'var(--teal-bright)' }}>{lastUpdated}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Week Selector ─────────────── */}
      {activeTab === 'matchups' && (
        <>
          {/* Desktop: scrollable pills */}
          <div className="week-bar desktop-only">
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

          {/* Mobile: compact dropdown + prev/next arrows */}
          <div className="week-bar-mobile mobile-only">
            <span className="week-label-mobile">Week</span>

            <div className="week-mobile-controls">
              <button
                className="week-arrow-btn"
                onClick={() => setWeek(w => Math.max(weeks[0], w - 1))}
                disabled={week <= weeks[0]}
                aria-label="Previous week"
              >
                ‹
              </button>

              <div className="week-dropdown-wrap">
                <select
                  value={week}
                  onChange={e => setWeek(Number(e.target.value))}
                  className="week-select"
                >
                  {weeks.map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="week-select-chevron" />
              </div>

              <button
                className="week-arrow-btn"
                onClick={() => setWeek(w => Math.min(weeks[weeks.length - 1], w + 1))}
                disabled={week >= weeks[weeks.length - 1]}
                aria-label="Next week"
              >
                ›
              </button>
            </div>

            <span className="week-season-label">2026 Season</span>
          </div>
        </>
      )}
    </header>
  );
};
