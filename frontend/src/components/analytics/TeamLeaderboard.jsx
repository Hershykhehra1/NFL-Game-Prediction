import React, { useState, useEffect } from 'react';
import { TeamBadge } from '../../utils/teamLogos';
import { Trophy, Search, Users } from 'lucide-react';
import { getTeams } from '../../services/api';

export const TeamLeaderboard = () => {
  const [teams, setTeams]           = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading]   = useState(true);

  useEffect(() => {
    getTeams()
      .then((d) => { if (d.teams) setTeams(d.teams); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredTeams = teams.filter((t) =>
    t.abbr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <div className="content-area">
      <div className="glass-panel" style={{ padding: '64px 40px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px' }} />
        <div className="skeleton" style={{ width: 180, height: 18, margin: '0 auto 10px' }} />
        <div className="skeleton" style={{ width: 260, height: 13, margin: '0 auto' }} />
      </div>
    </div>
  );

  return (
    <div className="content-area">

      {/* ── Page Header + Search ──────────────────────── */}
      <div className="glass-panel" style={{
        padding: '22px 28px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 12,
            background: 'var(--green-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={20} color="var(--green)" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
              32 NFL Teams Index
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              All franchises with primary &amp; secondary color palettes
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-box" style={{ width: 230 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Filter teams…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Count Badge ──────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        fontSize: 12,
        color: 'var(--text-3)',
        fontWeight: 500,
      }}>
        <Users size={13} color="var(--text-3)" />
        Showing{' '}
        <strong style={{ color: 'var(--green)', fontFamily: 'Space Grotesk, monospace' }}>
          {filteredTeams.length}
        </strong>{' '}
        of 32 franchises
      </div>

      {/* ── Team Grid ────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 14,
      }}>
        {filteredTeams.map((team, idx) => (
          <div
            key={team.abbr}
            className="game-card"
            style={{ cursor: 'default', padding: '18px 20px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--teal-bright)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(20,184,166,0.16)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Ambient glow using team primary */}
            <div
              className="game-card-glow"
              style={{ background: team.primary || 'var(--green)' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <TeamBadge abbr={team.abbr} size={48} />

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Rank + Abbr */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span className="font-mono-num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
                    {team.abbr}
                  </span>
                  <span className="font-mono-num" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>
                    #{idx + 1}
                  </span>
                </div>

                {/* Full Name */}
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--text-2)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 8,
                }}>
                  {team.name}
                </div>

                {/* City + Color Swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Primary swatch */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 8px',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: team.primary,
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: team.secondary,
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
                      {team.city}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Trophy size={28} color="var(--text-3)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>No teams match your search.</p>
        </div>
      )}
    </div>
  );
};
