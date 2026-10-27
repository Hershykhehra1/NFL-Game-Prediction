import React from 'react';
import { Wind, ChevronRight, Search } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamLogos';
import { getRankBadge as defaultGetRankBadge } from './rankBadge';

export const RushingLeadersCard = ({ 
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
      borderTop: '3px solid #10b981',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.12), transparent)',
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
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Wind size={18} color="var(--green-neon)" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>
              Rushing Yards Leaders
            </div>
            <div style={{ fontSize: 11, color: isSearchActive ? 'var(--green-neon)' : 'var(--text-3)' }}>
              {isSearchActive ? (
                players.length > 0 ? `${players.length} matching rusher${players.length > 1 ? 's' : ''}` : `No matches for "${searchQuery}"`
              ) : (
                'Yards, Carries, Touchdowns & YPC'
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onViewMore}
          title="Open detailed rushing standings"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--green-neon)',
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
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(0, 0, 0, 0.3))',
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
                background: leader.rank === 1 ? 'var(--green-neon)' : 'rgba(255, 255, 255, 0.2)',
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
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.8px', color: 'var(--green-neon)', textTransform: 'uppercase' }}>
                {leader.rank === 1 ? 'LEAGUE RUSHING LEADER' : `#${leader.rank} IN NFL RUSHING`}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                {leader.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {leader.team} • {leader.position || 'RB'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green-neon)', fontFamily: 'monospace', lineHeight: 1 }}>
                {leader.rushing_yards.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', marginTop: 3 }}>
                RUSH YDS
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                {leader.carries}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                CAR
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>
                {leader.touchdowns}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                TD
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
                {leader.avg_ypc || (leader.carries > 0 ? (leader.rushing_yards / leader.carries).toFixed(1) : '-')}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                YPC
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
            No rushing stats for "{searchQuery}"
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            This player has not recorded any rushing yards in {season}.
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {players.length > 0 && (
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <th style={{ padding: '10px 12px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center', width: 44 }}>
                  RANK
                </th>
                <th style={{ padding: '10px 10px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>
                  PLAYER
                </th>
                <th style={{ padding: '10px 10px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'right' }}>
                  YARDS
                </th>
                <th style={{ padding: '10px 8px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  CAR
                </th>
                <th style={{ padding: '10px 8px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  TD
                </th>
                <th style={{ padding: '10px 10px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  YPC
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
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
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
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamBadge abbr={p.team} size={26} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                            {p.team} • {p.position || 'RB'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rushing Yards */}
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: 'var(--green-neon)', fontFamily: 'monospace' }}>
                      {p.rushing_yards.toLocaleString()}
                    </td>

                    {/* Carries */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>
                      {p.carries}
                    </td>

                    {/* Touchdowns */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>
                      {p.touchdowns}
                    </td>

                    {/* Yards Per Carry */}
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', fontFamily: 'monospace' }}>
                      {p.avg_ypc || (p.carries > 0 ? (p.rushing_yards / p.carries).toFixed(1) : '-')}
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
