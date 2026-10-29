import React from 'react';
import { Shield, ChevronRight, Search } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamLogos';
import { getRankBadge as defaultGetRankBadge } from './rankBadge';

export const TackleLeadersCard = ({ 
  players, 
  getRankBadge = defaultGetRankBadge, 
  isSearchActive, 
  searchQuery, 
  season, 
  onViewMore 
}) => {
  const leader = players.length > 0 ? players[0] : null;

  return (
    <div className="glass-panel" style={{
      overflow: 'hidden',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      borderTop: '3px solid #a855f7',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.12), transparent)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(168, 85, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={18} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>
              NFL Tackle Leaders
            </div>
            <div style={{ fontSize: 11, color: isSearchActive ? '#c084fc' : 'var(--text-3)' }}>
              {isSearchActive ? (
                players.length > 0 ? `${players.length} matching defender${players.length > 1 ? 's' : ''}` : `No matches for "${searchQuery}"`
              ) : (
                'Tackles, Position & Solo/Assists'
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onViewMore}
          title="Open detailed tackle standings"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#c084fc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Expand <ChevronRight size={13} />
        </button>
      </div>

      {/* #1 Leader Hero Spotlight (or searched player spotlight) */}
      {leader && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(0, 0, 0, 0.3))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <TeamBadge abbr={leader.team} size={42} />
              <div style={{
                position: 'absolute',
                top: -5,
                right: -6,
                background: leader.rank === 1 ? '#c084fc' : 'rgba(255, 255, 255, 0.2)',
                color: leader.rank === 1 ? '#000' : 'var(--text-1)',
                fontSize: 9,
                fontWeight: 900,
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}>
                {leader.rank}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.8px', color: '#c084fc', textTransform: 'uppercase' }}>
                {leader.rank === 1 ? 'LEAGUE TACKLE LEADER' : `#${leader.rank} IN NFL TACKLES`}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                {leader.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {leader.team} • <span style={{ color: '#c084fc', fontWeight: 700 }}>{leader.position || 'LB'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#c084fc', fontFamily: 'monospace', lineHeight: 1 }}>
                {leader.tackles}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', marginTop: 3 }}>
                TOTAL TACKLES
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                {leader.solo_tackles}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                SOLO
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-2)' }}>
                {leader.assist_tackles}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                AST
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State when search returns 0 */}
      {players.length === 0 && (
        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
          <Search size={22} color="var(--text-3)" style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            No tackle stats for "{searchQuery}"
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            This player has not recorded any tackles in {season}.
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {players.length > 0 && (
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <th style={{ padding: '10px 14px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center', width: 44 }}>
                  RANK
                </th>
                <th style={{ padding: '10px 12px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>
                  PLAYER
                </th>
                <th style={{ padding: '10px 12px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  POS
                </th>
                <th style={{ padding: '10px 12px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'right' }}>
                  TACKLES
                </th>
                <th style={{ padding: '10px 14px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  SOLO/AST
                </th>
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
                    {/* Rank */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        minWidth: 26,
                        height: 22,
                        padding: '0 4px',
                        lineHeight: '20px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 800,
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                        boxShadow: badge.glow,
                      }}>
                        {p.rank}
                      </span>
                    </td>

                    {/* Player Name & Team */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TeamBadge abbr={p.team} size={26} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                            {p.team}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 7px',
                        borderRadius: 5,
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: '#c084fc',
                        fontSize: 11,
                        fontWeight: 700,
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                      }}>
                        {p.position || 'LB'}
                      </span>
                    </td>

                    {/* Total Tackles */}
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>
                      {p.tackles}
                    </td>

                    {/* Solo / Assists */}
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                      <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>{p.solo_tackles}</span> / {p.assist_tackles}
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
