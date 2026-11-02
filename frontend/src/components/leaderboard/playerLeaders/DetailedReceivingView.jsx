import React from 'react';
import { Flame, Search } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamLogos';
import { getRankBadge as defaultGetRankBadge } from './rankBadge';

export const DetailedReceivingView = ({ 
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
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), transparent)',
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
            background: 'rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Flame size={22} color="#fbbf24" />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
              NFL Receiving Yards Leaders
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Official NFL player standings for receiving yardage, targets, catches, and touchdowns.
            </p>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
          {isSearchActive ? `Found ${players.length} matching receivers` : `Showing Top ${players.length} Wide Receivers & Tight Ends`}
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
                      {p.team} • {p.position || 'WR'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>
                    {p.receiving_yards.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {p.receptions} REC • {p.touchdowns} TD
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
            No receiving stats for "{searchQuery}"
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Try searching for another player or team abbreviation, or clear the search to view all leaders.
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
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>POS</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: '#fbbf24', fontWeight: 800, textAlign: 'right' }}>RECEIVING YARDS</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>RECEPTIONS</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>TARGETS</th>
                <th style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>TOUCHDOWNS</th>
                <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textAlign: 'right' }}>YDS / REC</th>
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
                      <span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)', fontSize: 11, fontWeight: 700 }}>
                        {p.position || 'WR'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 15, fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>
                      {p.receiving_yards.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                      {p.receptions}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                      {p.targets || '-'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>
                      {p.touchdowns}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: 'var(--text-2)', fontFamily: 'monospace' }}>
                      {p.avg_ypr || (p.receptions > 0 ? (p.receiving_yards / p.receptions).toFixed(1) : '-')}
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
