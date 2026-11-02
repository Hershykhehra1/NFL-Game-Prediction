import React from 'react';
import { Sparkles, Search, Loader2, X, Flame, Zap, Shield, Wind, Target } from 'lucide-react';

export const PlayerLeadersHeader = ({
  season,
  isSearchActive,
  searchQuery,
  setSearchQuery,
  isSearching,
  activeCategory,
  setActiveCategory,
  displayLimit,
  setDisplayLimit,
}) => {
  return (
    <div className="glass-panel" style={{
      padding: '24px 28px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle decorative background accent */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 220,
        height: 120,
        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.25), rgba(16, 185, 129, 0.12))',
          border: '1px solid rgba(45, 212, 191, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(20, 184, 166, 0.25)',
        }}>
          <Sparkles size={24} color="var(--teal-bright)" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--teal-bright)' }}>
              PLAYER LEADERBOARDS
            </span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-3)', fontWeight: 600 }}>
              {season || 2026} Regular Season
            </span>
            {isSearchActive && (
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: 'rgba(45, 212, 191, 0.15)', color: 'var(--teal-bright)', fontWeight: 700 }}>
                Filtering for "{searchQuery}"
              </span>
            )}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>
            NFL Player Statistical Standings
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            League leaders and individual player stats in passing, rushing, receiving, tackles, and sacks.
          </p>
        </div>
      </div>

      {/* Category Controls & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Search box (searches across entire NFL player pool) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.45)',
          border: isSearchActive ? '1px solid var(--teal-bright)' : '1px solid var(--border)',
          borderRadius: 10,
          padding: '6px 12px',
          gap: 8,
          width: 230,
          transition: 'border-color 0.2s ease',
        }}>
          {isSearching ? (
            <Loader2 size={14} color="var(--teal-bright)" className="animate-spin" />
          ) : (
            <Search size={14} color={isSearchActive ? 'var(--teal-bright)' : 'var(--text-3)'} />
          )}
          <input
            type="text"
            placeholder="Search any player (e.g. Purdy, Henry)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-1)',
              fontSize: 12,
              width: '100%',
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              title="Clear search"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={13} color="var(--text-3)" />
            </button>
          )}
        </div>

        {/* Category Selector Buttons */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '6px 11px',
              borderRadius: 8,
              border: 'none',
              background: activeCategory === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeCategory === 'all' ? 'var(--text-1)' : 'var(--text-3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            All Categories
          </button>
          <button
            onClick={() => setActiveCategory('passing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              borderRadius: 8,
              border: 'none',
              background: activeCategory === 'passing' ? 'rgba(45, 212, 191, 0.2)' : 'transparent',
              color: activeCategory === 'passing' ? 'var(--teal-bright)' : 'var(--text-3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={13} />
            Passing
          </button>
          <button
            onClick={() => setActiveCategory('rushing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              borderRadius: 8,
              border: 'none',
              background: activeCategory === 'rushing' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeCategory === 'rushing' ? 'var(--green-neon)' : 'var(--text-3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Wind size={13} />
            Rushing
          </button>
          <button
            onClick={() => setActiveCategory('receiving')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              borderRadius: 8,
              border: 'none',
              background: activeCategory === 'receiving' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeCategory === 'receiving' ? '#fbbf24' : 'var(--text-3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Flame size={13} />
            Receiving
          </button>
          <button
            onClick={() => setActiveCategory('tackles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              borderRadius: 8,
              border: 'none',
              background: activeCategory === 'tackles' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeCategory === 'tackles' ? '#c084fc' : 'var(--text-3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={13} />
            Tackles
          </button>
          <button
            onClick={() => setActiveCategory('sacks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              borderRadius: 8,
              border: 'none',
              background: activeCategory === 'sacks' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: activeCategory === 'sacks' ? '#fb7185' : 'var(--text-3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Target size={13} />
            Sacks
          </button>
        </div>

        {/* Limit Toggle (hidden while actively searching) */}
        {!isSearchActive && (
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}>
            {[5, 10].map(cnt => (
              <button
                key={cnt}
                onClick={() => setDisplayLimit(cnt)}
                style={{
                  padding: '5px 9px',
                  borderRadius: 6,
                  border: 'none',
                  background: displayLimit === cnt ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: displayLimit === cnt ? 'var(--text-1)' : 'var(--text-3)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Top {cnt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
