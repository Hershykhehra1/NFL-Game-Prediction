import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Search, X, Award, Shield, ArrowUpDown, ChevronUp, ChevronDown, 
  Layers, List, Grid, CheckCircle2, Flame, AlertCircle, RefreshCw
} from 'lucide-react';
import { TeamBadge } from '../../utils/teamLogos';
import { getStandings } from '../../services/api';
import { PlayerLeaders } from './PlayerLeaders';


const DIVISION_COLORS = {
  'AFC East':  '#00338D',
  'AFC North': '#241773',
  'AFC South': '#03202F',
  'AFC West':  '#E31837',
  'NFC East':  '#004C54',
  'NFC North': '#203731',
  'NFC South': '#D50A0A',
  'NFC West':  '#AA0000',
};

export const StandingsLeaderboard = () => {
  const [data, setData]               = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConf, setSelectedConf] = useState('ALL'); // 'ALL' | 'AFC' | 'NFC'
  const [viewMode, setViewMode]       = useState('divisions'); // 'divisions' | 'conference' | 'league'
  const [sortField, setSortField]     = useState('rank'); // 'rank' | 'win_pct' | 'diff' | 'pf' | 'pa' etc.
  const [sortAsc, setSortAsc]         = useState(true);

  // Fetch standings on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getStandings()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load standings:', err);
        if (isMounted) {
          setError(err.message || 'Failed to fetch NFL standings');
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // For ranks, ascending (1, 2, 3...) is best. For percentages/scores, descending is best.
      const defaultAsc = (field === 'rank' || field === 'playoff_seed' || field === 'division_rank' || field === 'name');
      setSortAsc(defaultAsc);
    }
  };

  // Filtered Standings list for League view
  const allTeams = useMemo(() => {
    if (!data || !data.standings) return [];
    return data.standings;
  }, [data]);

  const filteredTeams = useMemo(() => {
    return allTeams.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        t.abbr.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.division.toLowerCase().includes(q)
      );
      const matchesConf = selectedConf === 'ALL' || t.conference === selectedConf;
      return matchesSearch && matchesConf;
    });
  }, [allTeams, searchQuery, selectedConf]);

  const sortedLeagueTeams = useMemo(() => {
    const list = [...filteredTeams];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'rank') {
        aVal = a.league_rank || 99;
        bVal = b.league_rank || 99;
      } else if (sortField === 'record') {
        aVal = a.win_pct;
        bVal = b.win_pct;
      } else if (sortField === 'diff') {
        aVal = a.point_diff;
        bVal = b.point_diff;
      } else if (sortField === 'div_record') {
        aVal = a.div_win_pct;
        bVal = b.div_win_pct;
      } else if (sortField === 'conf_record') {
        aVal = a.conf_win_pct;
        bVal = b.conf_win_pct;
      }

      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal - bVal) : (bVal - aVal);
    });
    return list;
  }, [filteredTeams, sortField, sortAsc]);

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="content-area" style={{ paddingTop: 20 }}>
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px' }} />
          <div className="skeleton" style={{ width: 260, height: 22, margin: '0 auto 10px' }} />
          <div className="skeleton" style={{ width: 340, height: 14, margin: '0 auto 30px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="content-area" style={{ paddingTop: 20 }}>
        <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle size={44} color="#f87171" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>
            Unable to Load Standings
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
            {error || 'No standings data returned from server.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Header Sort Column Component
  const SortableTh = ({ field, label, align = 'left', tooltip }) => {
    const isCurrent = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        title={tooltip || `Sort by ${label}`}
        style={{
          padding: '12px 10px',
          textAlign: align,
          fontSize: 11,
          fontWeight: 700,
          color: isCurrent ? 'var(--teal-bright)' : 'var(--text-3)',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: isCurrent ? 'rgba(45, 212, 191, 0.04)' : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start') }}>
          <span>{label}</span>
          {isCurrent ? (
            sortAsc ? <ChevronUp size={13} color="var(--teal-bright)" /> : <ChevronDown size={13} color="var(--teal-bright)" />
          ) : (
            <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
          )}
        </div>
      </th>
    );
  };

  // Reusable Team Row Component
  const TeamRow = ({ team, displayRank, showSeed = false }) => {
    const isPositiveDiff = team.point_diff > 0;
    const isNegativeDiff = team.point_diff < 0;
    const streakIsWin = team.streak && team.streak.startsWith('W');
    const streakIsLoss = team.streak && team.streak.startsWith('L');

    return (
      <tr 
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        {/* Rank / Seed */}
        <td style={{ padding: '12px 10px', width: 44, textAlign: 'center', fontSize: 13, fontWeight: 800, color: displayRank <= 4 ? 'var(--teal-bright)' : 'var(--text-3)' }}>
          {showSeed ? (
            <span style={{
              display: 'inline-block',
              padding: '2px 6px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              background: displayRank <= 4 ? 'rgba(16, 185, 129, 0.18)' : (displayRank <= 7 ? 'rgba(14, 165, 233, 0.18)' : 'rgba(255,255,255,0.05)'),
              color: displayRank <= 4 ? 'var(--green-neon)' : (displayRank <= 7 ? '#38bdf8' : 'var(--text-3)'),
              border: `1px solid ${displayRank <= 4 ? 'rgba(16, 185, 129, 0.4)' : (displayRank <= 7 ? 'rgba(14, 165, 233, 0.3)' : 'transparent')}`,
            }}>
              #{displayRank}
            </span>
          ) : (
            displayRank
          )}
        </td>

        {/* Team Identity */}
        <td style={{ padding: '12px 10px', minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TeamBadge abbr={team.abbr} size={32} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)' }}>
                  {team.city} {team.name}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>
                  {team.abbr}
                </span>
                {team.division_rank === 1 && (
                  <span 
                    title="Division Leader"
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: 'rgba(255, 182, 18, 0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    DIV LEAD
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                {team.division}
              </div>
            </div>
          </div>
        </td>

        {/* Record Columns */}
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
          {team.wins}
        </td>
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
          {team.losses}
        </td>
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: team.ties > 0 ? '#facc15' : 'var(--text-3)' }}>
          {team.ties}
        </td>
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--teal-bright)', fontFamily: 'monospace' }}>
          {team.win_pct_str}
        </td>

        {/* Division & Conference Records */}
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'monospace' }}>
          {team.div_record}
        </td>
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'monospace' }}>
          {team.conf_record}
        </td>

        {/* Home & Away Records */}
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, color: 'var(--text-2)', fontFamily: 'monospace' }}>
          {team.home_record}
        </td>
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, color: 'var(--text-2)', fontFamily: 'monospace' }}>
          {team.away_record}
        </td>

        {/* Scoring & Margins */}
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, color: 'var(--text-2)' }}>
          {team.pf}
        </td>
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, color: 'var(--text-2)' }}>
          {team.pa}
        </td>
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
          <span style={{
            display: 'inline-block',
            padding: '2px 7px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'monospace',
            background: isPositiveDiff ? 'rgba(16, 185, 129, 0.12)' : (isNegativeDiff ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.04)'),
            color: isPositiveDiff ? 'var(--green-neon)' : (isNegativeDiff ? '#f87171' : 'var(--text-3)'),
            border: `1px solid ${isPositiveDiff ? 'rgba(16, 185, 129, 0.25)' : (isNegativeDiff ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.06)')}`,
          }}>
            {team.point_diff_str}
          </span>
        </td>

        {/* Streak */}
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12 }}>
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
            background: streakIsWin ? 'rgba(16, 185, 129, 0.16)' : (streakIsLoss ? 'rgba(239, 68, 68, 0.16)' : 'rgba(255, 255, 255, 0.05)'),
            color: streakIsWin ? 'var(--green-neon)' : (streakIsLoss ? '#f87171' : 'var(--text-3)'),
            border: `1px solid ${streakIsWin ? 'rgba(16, 185, 129, 0.3)' : (streakIsLoss ? 'rgba(239, 68, 68, 0.3)' : 'transparent')}`,
          }}>
            {team.streak || '-'}
          </span>
        </td>
      </tr>
    );
  };

  // Reusable Table Frame
  const StandingsTable = ({ teams, showSeed = false }) => {
    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 780 }}>
          <thead>
            <tr style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
              <SortableTh field="rank" label={showSeed ? "SEED" : "POS"} align="center" />
              <SortableTh field="name" label="TEAM" align="left" />
              <SortableTh field="wins" label="W" align="center" tooltip="Wins" />
              <SortableTh field="losses" label="L" align="center" tooltip="Losses" />
              <SortableTh field="ties" label="T" align="center" tooltip="Ties" />
              <SortableTh field="win_pct" label="PCT" align="center" tooltip="Win Percentage" />
              <SortableTh field="div_record" label="DIV" align="center" tooltip="Division Record" />
              <SortableTh field="conf_record" label="CONF" align="center" tooltip="Conference Record" />
              <SortableTh field="home_record" label="HOME" align="center" tooltip="Home Record" />
              <SortableTh field="away_record" label="AWAY" align="center" tooltip="Away Record" />
              <SortableTh field="pf" label="PF" align="center" tooltip="Points For (Scored)" />
              <SortableTh field="pa" label="PA" align="center" tooltip="Points Against (Allowed)" />
              <SortableTh field="diff" label="DIFF" align="center" tooltip="Net Point Differential" />
              <SortableTh field="streak" label="STRK" align="center" tooltip="Current Streak" />
            </tr>
          </thead>
          <tbody>
            {teams.map((t, idx) => (
              <TeamRow 
                key={t.abbr} 
                team={t} 
                displayRank={showSeed ? (t.playoff_seed || idx + 1) : (t.division_rank || t.league_rank || idx + 1)}
                showSeed={showSeed}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="content-area" style={{ paddingTop: 20 }}>

      {/* ── Page Hero Header ────────────────────────────────────────────── */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(20, 184, 166, 0.15))',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
          }}>
            <Trophy size={24} color="var(--green)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--teal-bright)' }}>
                NFL REGULAR SEASON
              </span>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: 'rgba(20, 184, 166, 0.15)', color: 'var(--teal-bright)', fontWeight: 700 }}>
                {data.season} Season
              </span>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-3)', fontWeight: 600 }}>
                {data.total_games_played} Games Finalized
              </span>
              <a
                href="#player-leaders"
                style={{
                  fontSize: 10,
                  padding: '2px 9px',
                  borderRadius: 6,
                  background: 'rgba(45, 212, 191, 0.12)',
                  color: 'var(--teal-bright)',
                  border: '1px solid rgba(45, 212, 191, 0.25)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Player Leaders ↓</span>
              </a>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>
              Team Standings &amp; Leaderboard
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
              Division title races, conference playoff brackets, and complete home/away performance metrics.
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 4,
          gap: 2,
        }}>
          <button
            onClick={() => setViewMode('divisions')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === 'divisions' ? 'var(--green-dim)' : 'transparent',
              color: viewMode === 'divisions' ? 'var(--green-neon)' : 'var(--text-3)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Grid size={14} />
            <span>Divisions</span>
          </button>
          <button
            onClick={() => setViewMode('conference')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === 'conference' ? 'var(--green-dim)' : 'transparent',
              color: viewMode === 'conference' ? 'var(--green-neon)' : 'var(--text-3)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={14} />
            <span>Playoff Picture</span>
          </button>
          <button
            onClick={() => setViewMode('league')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === 'league' ? 'var(--green-dim)' : 'transparent',
              color: viewMode === 'league' ? 'var(--green-neon)' : 'var(--text-3)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <List size={14} />
            <span>League Master</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ──────────────────────────────────────── */}
      <div className="glass-panel" style={{
        padding: '12px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
      }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '8px 14px',
          width: '100%',
          maxWidth: 320,
        }}>
          <Search size={15} color="var(--text-3)" />
          <input
            type="text"
            placeholder="Search team, city, abbreviation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-1)',
              fontSize: 13,
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-3)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Conference Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginRight: 4 }}>
            Conference:
          </span>
          {['ALL', 'AFC', 'NFC'].map((conf) => (
            <button
              key={conf}
              onClick={() => setSelectedConf(conf)}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid',
                borderColor: selectedConf === conf ? 'var(--teal-bright)' : 'rgba(255, 255, 255, 0.08)',
                background: selectedConf === conf ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: selectedConf === conf ? 'var(--teal-bright)' : 'var(--text-3)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {conf}
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW 1: DIVISION VIEW (8 Cards) ───────────────────────────────── */}
      {viewMode === 'divisions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {['AFC', 'NFC'].map((conf) => {
            if (selectedConf !== 'ALL' && selectedConf !== conf) return null;

            const divNames = [
              `${conf} East`,
              `${conf} North`,
              `${conf} South`,
              `${conf} West`,
            ];

            return (
              <div key={conf}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Shield size={18} color={conf === 'AFC' ? '#f87171' : '#38bdf8'} />
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
                    {conf} Conferences
                  </h2>
                  <div style={{ height: 1, flex: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(560px, 1fr))',
                  gap: 18,
                }}>
                  {divNames.map((divName) => {
                    const rawDivTeams = (data.divisions && data.divisions[divName]) ? data.divisions[divName] : [];
                    const divTeams = rawDivTeams.filter(t => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase().trim();
                      return t.abbr.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q);
                    });

                    if (searchQuery && divTeams.length === 0) return null;

                    const accentColor = DIVISION_COLORS[divName] || '#10b981';

                    return (
                      <div key={divName} className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
                        {/* Division Card Header */}
                        <div style={{
                          padding: '12px 18px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                              {divName}
                            </span>
                          </div>
                          {divTeams.length > 0 && divTeams[0].division_rank === 1 && (
                            <span style={{ fontSize: 11, color: 'var(--teal-bright)', fontWeight: 600 }}>
                              Leader: <strong>{divTeams[0].city}</strong> ({divTeams[0].record})
                            </span>
                          )}
                        </div>

                        {/* Division Table */}
                        <StandingsTable teams={divTeams} showSeed={false} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VIEW 2: CONFERENCE PLAYOFF PICTURE ─────────────────────────────── */}
      {viewMode === 'conference' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {['AFC', 'NFC'].map((conf) => {
            if (selectedConf !== 'ALL' && selectedConf !== conf) return null;

            const confTeams = (data.conferences && data.conferences[conf]) ? data.conferences[conf] : [];
            const filtered = confTeams.filter(t => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase().trim();
              return t.abbr.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) || t.division.toLowerCase().includes(q);
            });

            return (
              <div key={conf} className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
                {/* Conference Banner */}
                <div style={{
                  padding: '16px 20px',
                  background: conf === 'AFC' ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.12), transparent)' : 'linear-gradient(90deg, rgba(14, 165, 233, 0.12), transparent)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={20} color={conf === 'AFC' ? '#f87171' : '#38bdf8'} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                        {conf} Standings &amp; Playoff Seeding
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        Seeds 1–4: Division Champions • Seeds 5–7: Wild Card Berths • Seeds 8–16: In The Hunt
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700 }}>
                    <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green-neon)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      1–4 Div Champs
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                      5–7 Wild Cards
                    </span>
                  </div>
                </div>

                <StandingsTable teams={filtered} showSeed={true} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── VIEW 3: LEAGUE MASTER TABLE (32 Teams) ────────────────────────── */}
      {viewMode === 'league' && (
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{
            padding: '16px 20px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                NFL Overall League Standings (32 Teams)
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                Click any column header to sort teams by Win Percentage, Division Record, Home/Away, Point Differential, or Streak.
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--teal-bright)', fontWeight: 700 }}>
              Showing {sortedLeagueTeams.length} of 32 Teams
            </div>
          </div>

          <StandingsTable teams={sortedLeagueTeams} showSeed={false} />
        </div>
      )}

      {/* ── PLAYER STATISTICAL STANDINGS (Receiving, Passing, Tackles) ───── */}
      <div id="player-leaders">
        <PlayerLeaders 
          season={data.season} 
          initialLeaders={data.player_leaders} 
        />
      </div>

    </div>
  );
};
