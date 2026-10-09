import React, { useState, useEffect } from 'react';
import { TeamBadge } from '../../utils/teamLogos';
import { 
  Trophy, Search, Users, TrendingUp, TrendingDown, Minus, 
  Shield, Zap, Layers, Grid, List, Info, ArrowUpDown, 
  Sparkles, Award, BarChart3, Filter, Activity
} from 'lucide-react';
import { getPowerRankings } from '../../services/api';

const TIER_COLORS = {
  'Tier 1: Elite Contender': { badge: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', label: 'Elite Contender' },
  'Tier 2: Playoff Lock':    { badge: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.35)', label: 'Playoff Lock' },
  'Tier 3: In the Hunt':     { badge: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', label: 'In the Hunt' },
  'Tier 4: Rebuilding':      { badge: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', label: 'Rebuilding' },
};

export const TeamLeaderboard = () => {
  const [rankings, setRankings]       = useState([]);
  const [weights, setWeights]         = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConf, setSelectedConf] = useState('ALL'); // 'ALL' | 'AFC' | 'NFC'
  const [selectedTier, setSelectedTier] = useState('ALL'); // 'ALL' | 'Tier 1: Elite Contender' | ...
  const [viewMode, setViewMode]       = useState('table'); // 'table' | 'tier_cards' | 'grid'
  const [sortField, setSortField]     = useState('rank');
  const [sortAsc, setSortAsc]         = useState(true);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [isLoading, setIsLoading]     = useState(true);

  useEffect(() => {
    getPowerRankings()
      .then((d) => {
        if (d.rankings) setRankings(d.rankings);
        if (d.weights) setWeights(d.weights);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load power rankings:', err);
        setIsLoading(false);
      });
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // For ranks, ascending (1, 2, 3) is best. For scores, descending is best.
      setSortAsc(field === 'rank' || field.includes('rank'));
    }
  };

  const filteredTeams = rankings.filter((t) => {
    const matchesSearch =
      t.abbr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConf = selectedConf === 'ALL' || t.conference === selectedConf;
    const matchesTier = selectedTier === 'ALL' || t.tier === selectedTier;
    return matchesSearch && matchesConf && matchesTier;
  });

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  if (isLoading) return (
    <div className="content-area">
      <div className="glass-panel" style={{ padding: '64px 40px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px' }} />
        <div className="skeleton" style={{ width: 220, height: 20, margin: '0 auto 10px' }} />
        <div className="skeleton" style={{ width: 320, height: 14, margin: '0 auto' }} />
      </div>
    </div>
  );

  return (
    <div className="content-area">

      {/* ── Page Header ──────────────────────── */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(20,184,166,0.15))',
            border: '1px solid rgba(45,212,191,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={22} color="var(--green)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--teal-bright)' }}>
                DUAL-TRACK POWER MODEL
              </span>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: 'rgba(20,184,166,0.15)', color: 'var(--teal-bright)', fontWeight: 700 }}>
                32 Teams
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>
              NFL Power Rankings &amp; Team Efficiency Index
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
              Synthesizing <strong>Fundamental Statistical Efficiency (60%)</strong> with <strong>Dynamic Elo Ratings (40%)</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Formula Explanation Toggle */}
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px',
              borderRadius: 10,
              background: showFormulaInfo ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)',
              border: showFormulaInfo ? '1px solid var(--teal-bright)' : '1px solid var(--border)',
              color: showFormulaInfo ? 'var(--teal-bright)' : 'var(--text-2)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Info size={14} />
            <span>Methodology</span>
          </button>

          {/* View Mode Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 3,
          }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'table' ? 'var(--green-dim)' : 'transparent',
                color: viewMode === 'table' ? 'var(--green)' : 'var(--text-3)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <List size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('tier_cards')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'tier_cards' ? 'var(--green-dim)' : 'transparent',
                color: viewMode === 'tier_cards' ? 'var(--green)' : 'var(--text-3)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Layers size={14} />
              <span>Tiers</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'grid' ? 'var(--green-dim)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--green)' : 'var(--text-3)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Grid size={14} />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Methodology Info Drawer ────────────── */}
      {showFormulaInfo && (
        <div className="glass-panel" style={{
          padding: '20px 24px',
          marginBottom: 20,
          border: '1px solid rgba(20,184,166,0.3)',
          background: 'rgba(5,15,22,0.95)',
          animation: 'fadeIn 0.25s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--teal-bright)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)' }}>
                Power Rating &amp; Composite Index Formulation
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
            Our dual-track rating system distinguishes between <strong>empirical statistical dominance</strong> (per-play offensive &amp; defensive EPA, down conversion success rates, turnover margin, and schedule strength) and <strong>historical caliber</strong> (opponent-adjusted Elo ratings with margin of victory multipliers).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal-bright)', marginBottom: 4 }}>1. Offensive Efficiency (28%)</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>0.60 × Off EPA/play + 0.40 × Off Success Rate</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', marginBottom: 4 }}>2. Defensive Efficiency (22%)</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>0.60 × (-Def EPA/play) + 0.40 × (1 - Def Success Rate)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>3. Scoring Margin &amp; TO (35%)</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>20% Capped Point Diff (±24) + 15% Net Turnover Margin</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#a855f7', marginBottom: 4 }}>4. Strength of Schedule (15%)</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Mean opponent Elo faced prior to kickoff</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters & Search Toolbar ──────────────────────── */}
      <div className="glass-panel" style={{
        padding: '14px 20px',
        marginBottom: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Conference Filter */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.35)', borderRadius: 8, padding: 2, border: '1px solid var(--border)' }}>
            {['ALL', 'AFC', 'NFC'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedConf(c)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedConf === c ? 'var(--green-dim)' : 'transparent',
                  color: selectedConf === c ? 'var(--green)' : 'var(--text-3)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {c === 'ALL' ? 'All Conferences' : c}
              </button>
            ))}
          </div>

          {/* Tier Filter */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.35)', borderRadius: 8, padding: 2, border: '1px solid var(--border)' }}>
            {['ALL', 'Tier 1: Elite Contender', 'Tier 2: Playoff Lock', 'Tier 3: In the Hunt', 'Tier 4: Rebuilding'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedTier === t ? 'rgba(20,184,166,0.2)' : 'transparent',
                  color: selectedTier === t ? 'var(--teal-bright)' : 'var(--text-3)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {t === 'ALL' ? 'All Tiers' : t.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="search-box" style={{ width: 220 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Search teams or cities…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── View 1: Interactive Rankings Table ────────────── */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('rank')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Rank</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                    Team
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('composite_score')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Composite Index</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('stat_power')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Stat Power (0-100)</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('elo')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Elo Rating</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('offense_rank')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Offense</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('defense_rank')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Defense</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('sos_rank')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>SOS</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('turnover_rank')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Turnovers</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Tier Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team) => {
                  const tierCfg = TIER_COLORS[team.tier] || TIER_COLORS['Tier 3: In the Hunt'];
                  return (
                    <tr
                      key={team.abbr}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(20,184,166,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Rank + Trend */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="font-mono-num" style={{
                            fontSize: 15, fontWeight: 800,
                            color: team.rank <= 3 ? 'var(--green)' : team.rank <= 10 ? 'var(--text-1)' : 'var(--text-3)',
                            minWidth: 24,
                          }}>
                            #{team.rank}
                          </span>
                          {team.trend > 0 ? (
                            <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 700 }} title={`+${team.trend} momentum`}>
                              <TrendingUp size={11} /> +{team.trend}
                            </span>
                          ) : team.trend < 0 ? (
                            <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 700 }} title={`${team.trend} momentum`}>
                              <TrendingDown size={11} /> {team.trend}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', fontSize: 10 }}>
                              <Minus size={11} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Logo + Name */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <TeamBadge abbr={team.abbr} size={32} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                                {team.name}
                              </span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>
                                {team.abbr}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                              {team.division} &bull; QB: <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>{team.qb}</span>
                              {team.qb_epa !== undefined && (
                                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: team.qb_epa >= 0 ? 'var(--green)' : '#f87171' }}>
                                  ({team.qb_epa >= 0 ? `+${team.qb_epa}` : team.qb_epa} EPA)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Composite Index Score Bar */}
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span className="font-mono-num" style={{ fontSize: 15, fontWeight: 800, color: 'var(--green)' }}>
                              {team.composite_score}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>/100</span>
                          </div>
                          <div style={{ width: 110, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.max(0, team.composite_score))}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--teal-bright), var(--green))',
                              borderRadius: 3,
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Statistical Power */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className="font-mono-num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-bright)' }}>
                          {team.stat_power}
                        </span>
                      </td>

                      {/* Elo Rating */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className="font-mono-num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                          {team.elo}
                        </span>
                      </td>

                      {/* Offense Rank */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className="font-mono-num" style={{
                          fontSize: 12, fontWeight: 700,
                          color: team.offense_rank <= 5 ? 'var(--green)' : team.offense_rank >= 28 ? '#f87171' : 'var(--text-2)',
                        }}>
                          #{team.offense_rank}
                        </span>
                      </td>

                      {/* Defense Rank */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className="font-mono-num" style={{
                          fontSize: 12, fontWeight: 700,
                          color: team.defense_rank <= 5 ? 'var(--green)' : team.defense_rank >= 28 ? '#f87171' : 'var(--text-2)',
                        }}>
                          #{team.defense_rank}
                        </span>
                      </td>

                      {/* SOS Rank */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className="font-mono-num" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>
                          #{team.sos_rank}
                        </span>
                      </td>

                      {/* Turnover Rank */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className="font-mono-num" style={{
                          fontSize: 12, fontWeight: 700,
                          color: team.turnover_rank <= 5 ? 'var(--green)' : team.turnover_rank >= 28 ? '#f87171' : 'var(--text-2)',
                        }}>
                          #{team.turnover_rank}
                        </span>
                      </td>

                      {/* Tier Badge */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: tierCfg.bg,
                          color: tierCfg.badge,
                          border: `1px solid ${tierCfg.border}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                        }}>
                          {tierCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View 2: Tier Matrix View ──────────────────────── */}
      {viewMode === 'tier_cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {['Tier 1: Elite Contender', 'Tier 2: Playoff Lock', 'Tier 3: In the Hunt', 'Tier 4: Rebuilding'].map((tierName) => {
            const tierTeams = sortedTeams.filter((t) => t.tier === tierName);
            if (tierTeams.length === 0) return null;
            const tierCfg = TIER_COLORS[tierName];

            return (
              <div key={tierName} className="glass-panel" style={{ padding: '20px 24px', border: `1px solid ${tierCfg.border}` }}>
                {/* Tier Title Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: tierCfg.badge,
                      boxShadow: `0 0 10px ${tierCfg.badge}`,
                    }} />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                      {tierName}
                    </h3>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>
                    {tierTeams.length} Franchises
                  </span>
                </div>

                {/* Team Mini Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 12,
                }}>
                  {tierTeams.map((team) => (
                    <div
                      key={team.abbr}
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = tierCfg.badge; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      <TeamBadge abbr={team.abbr} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                            {team.abbr}
                          </span>
                          <span className="font-mono-num" style={{ fontSize: 12, fontWeight: 800, color: tierCfg.badge }}>
                            #{team.rank}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                          {team.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 6 }}>
                          QB: <strong style={{ color: 'var(--text-1)' }}>{team.qb}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)' }}>
                          <span>Composite: <strong style={{ color: 'var(--green)' }}>{team.composite_score}</strong></span>
                          <span>Elo: <strong style={{ color: 'var(--text-1)' }}>{team.elo}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View 3: Franchise Card Grid ──────────────────── */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 14,
        }}>
          {sortedTeams.map((team) => {
            const tierCfg = TIER_COLORS[team.tier] || TIER_COLORS['Tier 3: In the Hunt'];
            return (
              <div
                key={team.abbr}
                className="game-card"
                style={{ padding: '18px 20px', cursor: 'default' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--teal-bright)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(20,184,166,0.16)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="game-card-glow" style={{ background: team.primary || 'var(--green)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <TeamBadge abbr={team.abbr} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="font-mono-num" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                        {team.abbr}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                        background: tierCfg.bg, color: tierCfg.badge, border: `1px solid ${tierCfg.border}`,
                      }}>
                        #{team.rank}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {team.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                      {team.division} &bull; QB: <strong style={{ color: 'var(--text-1)' }}>{team.qb}</strong>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-3)' }}>Composite Index:</span>
                    <strong className="font-mono-num" style={{ color: 'var(--green)' }}>{team.composite_score}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-3)' }}>Stat Power / Elo:</span>
                    <span style={{ color: 'var(--text-1)' }}>{team.stat_power} / {team.elo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-3)' }}>Off / Def Rank:</span>
                    <span style={{ color: 'var(--text-2)' }}>#{team.offense_rank} Off / #{team.defense_rank} Def</span>
                  </div>
                  {team.qb_epa !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-3)' }}>QB EPA / CPOE:</span>
                      <span style={{ color: team.qb_epa >= 0 ? 'var(--green)' : '#f87171', fontWeight: 700 }}>
                        {team.qb_epa >= 0 ? `+${team.qb_epa}` : team.qb_epa} ({team.qb_cpoe >= 0 ? `+${team.qb_cpoe}` : team.qb_cpoe}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sortedTeams.length === 0 && (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Trophy size={28} color="var(--text-3)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>No teams match your filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TeamLeaderboard;
