import React from 'react';
import { Zap, ChevronRight, Search } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamLogos';
import { getRankBadge as defaultGetRankBadge } from './rankBadge';

export const PassingLeadersCard = ({ 
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
      borderTop: '3px solid var(--teal-bright)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(90deg, rgba(45, 212, 191, 0.12), transparent)',
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
            background: 'rgba(20, 184, 166, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={18} color="var(--teal-bright)" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>
              Passing Yards Leaders
            </div>
            <div style={{ fontSize: 11, color: isSearchActive ? 'var(--teal-bright)' : 'var(--text-3)' }}>
              {isSearchActive ? (
                players.length > 0 ? `${players.length} matching quarterback${players.length > 1 ? 's' : ''}` : `No matches for "${searchQuery}"`
              ) : (
                'Yards, Comp %, TD, INT & QB Rating'
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onViewMore}
          title="Open detailed passing standings"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--teal-bright)',
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
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(0, 0, 0, 0.3))',
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
                background: leader.rank === 1 ? 'var(--teal-bright)' : 'rgba(255, 255, 255, 0.2)',
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
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.8px', color: 'var(--teal-bright)', textTransform: 'uppercase' }}>
                {leader.rank === 1 ? 'LEAGUE PASSING LEADER' : `#${leader.rank} IN NFL PASSING`}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                {leader.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {leader.team} • QB
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--teal-bright)', fontFamily: 'monospace', lineHeight: 1 }}>
                {leader.passing_yards.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', marginTop: 3 }}>
                PASS YDS
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)' }}>
                {leader.completion_percentage}%
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                CMP%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green-neon)' }}>
                {leader.touchdowns}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                TD
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171' }}>
                {leader.interceptions}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                INT
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                padding: '3px 7px',
                borderRadius: 6,
                background: 'rgba(45, 212, 191, 0.16)',
                color: 'var(--teal-bright)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                fontSize: 12,
                fontWeight: 800,
                fontFamily: 'monospace',
              }}>
                {leader.qb_rating}
              </span>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>
                RTG
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
            No passing stats for "{searchQuery}"
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            This player has not recorded any passing yards in {season}.
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
                <th style={{ padding: '10px 8px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'right' }}>
                  YARDS
                </th>
                <th style={{ padding: '10px 8px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  CMP%
                </th>
                <th style={{ padding: '10px 8px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  TD
                </th>
                <th style={{ padding: '10px 8px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  INT
                </th>
                <th style={{ padding: '10px 12px', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textAlign: 'center' }}>
                  RTG
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
                            {p.team} • QB
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Passing Yards */}
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: 'var(--teal-bright)', fontFamily: 'monospace' }}>
                      {p.passing_yards.toLocaleString()}
                    </td>

                    {/* Completion Percentage */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>
                      {p.completion_percentage}%
                    </td>

                    {/* Touchdowns */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: 'var(--green-neon)' }}>
                      {p.touchdowns}
                    </td>

                    {/* Interceptions */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#f87171' }}>
                      {p.interceptions}
                    </td>

                    {/* QB Rating */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 5,
                        background: p.qb_rating >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: p.qb_rating >= 100 ? 'var(--green-neon)' : 'var(--text-2)',
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: 'monospace',
                      }}>
                        {p.qb_rating}
                      </span>
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
