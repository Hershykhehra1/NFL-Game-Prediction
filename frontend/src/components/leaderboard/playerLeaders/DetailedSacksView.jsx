import React from 'react';
import { Target, Search } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamLogos';
import { getRankBadge as defaultGetRankBadge } from './rankBadge';

export const DetailedSacksView = ({ 
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
        background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.15), transparent)',
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
            background: 'rgba(244, 63, 94, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Target size={22} color="#fb7185" />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
              NFL Quarterback Sack Leaders
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Official NFL defensive standings for quarterback sacks, tackles for loss, forced fumbles &amp; solo stops.
            </p>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: '#fb7185' }}>
          {isSearchActive ? `Found ${players.length} matching pass rushers` : `Showing Top ${players.length} Pass Rushers & Disruptors`}
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
                      {p.team} • <span style={{ color: '#fb7185', fontWeight: 700 }}>{p.position || 'DE'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fb7185', fontFamily: 'monospace' }}>
                    {p.sacks}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {p.tackles_for_loss} TFL • {p.forced_fumbles} FF • {p.solo_tackles} Solo
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
            No sack stats for "{searchQuery}"
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Try searching for another pass rusher or defender name, or clear the search to view all leaders.
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
                <th style={{ padding: '12px 14px', fontSize: 11, color: '#fb7185', fontWeight: 800, textAlign: 'right' }}>TOTAL SACKS</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>TACKLES FOR LOSS</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>FORCED FUMBLES</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>SOLO TACKLES</th>
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
                        background: 'rgba(244, 63, 94, 0.15)',
                        color: '#fb7185',
                        fontSize: 11,
                        fontWeight: 800,
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                      }}>
                        {p.position || 'DE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 15, fontWeight: 900, color: '#fb7185', fontFamily: 'monospace' }}>
                      {p.sacks}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-1)', fontFamily: 'monospace' }}>
                      {p.tackles_for_loss}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>
                      {p.forced_fumbles}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                      {p.solo_tackles}
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
