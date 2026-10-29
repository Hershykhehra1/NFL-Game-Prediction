import React from 'react';
import { Shield, Search } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamLogos';
import { getRankBadge as defaultGetRankBadge } from './rankBadge';

export const DetailedTacklesView = ({ 
  players, 
  getRankBadge = defaultGetRankBadge, 
  isSearchActive, 
  searchQuery, 
  season 
}) => {
  return (
    <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
      {/* Banner */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.15), transparent)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(168, 85, 247, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={22} color="#c084fc" />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
              NFL Defensive Tackle Leaders
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Official NFL tackling leaders: total tackles, solo stops, assisted tackles &amp; defensive position.
            </p>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>
          {isSearchActive ? `Found ${players.length} matching defenders` : `Showing Top ${players.length} Defensive Standouts`}
        </div>
      </div>

      {/* Top 3 Podium Cards (when not searching or when >= 3 matches) */}
      {players.length >= 3 && !isSearchActive && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          padding: '20px 24px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {players.slice(0, 3).map((p) => {
            const badge = getRankBadge(p.rank);
            return (
              <div 
                key={p.player_id || p.name}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: badge.border,
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: badge.glow,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <TeamBadge abbr={p.team} size={44} />
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      background: badge.color,
                      color: '#000',
                      fontSize: 10,
                      fontWeight: 900,
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {p.rank}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {p.team} • <span style={{ color: '#c084fc', fontWeight: 700 }}>{p.position || 'LB'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#c084fc', fontFamily: 'monospace' }}>
                    {p.tackles}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {p.solo_tackles} Solo • {p.assist_tackles} Ast
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {players.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Search size={28} color="var(--text-3)" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
            No tackle stats for "{searchQuery}"
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Try searching for another defender name, or clear the search to view all leaders.
          </div>
        </div>
      )}

      {/* Comprehensive Table */}
      {players.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center', width: 50 }}>RANK</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700 }}>PLAYER NAME</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>POSITION</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: '#c084fc', fontWeight: 800, textAlign: 'right' }}>TOTAL TACKLES</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>SOLO TACKLES</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>ASSISTED TACKLES</th>
                <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>TEAM</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const badge = getRankBadge(p.rank);
                return (
                  <tr 
                    key={p.player_id || p.name}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        minWidth: 28,
                        height: 24,
                        padding: '0 4px',
                        lineHeight: '22px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 800,
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                      }}>
                        {p.rank}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <TeamBadge abbr={p.team} size={30} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                            {p.team}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 9px',
                        borderRadius: 6,
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: '#c084fc',
                        fontSize: 11,
                        fontWeight: 800,
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                      }}>
                        {p.position || 'LB'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 15, fontWeight: 900, color: '#c084fc', fontFamily: 'monospace' }}>
                      {p.tackles}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                      {p.solo_tackles}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                      {p.assist_tackles}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                      {p.team}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
