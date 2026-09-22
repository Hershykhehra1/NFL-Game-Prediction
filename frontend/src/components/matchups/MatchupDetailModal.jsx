import React, { useState, useEffect, useCallback } from 'react';
import { TeamBadge, TEAM_INFO } from '../../utils/teamLogos';
import { getBoxscore } from '../../services/api';
import { StatHeaderCell, StatGlossaryModal } from '../common/StatInfoBubble';
import {
  X, TrendingUp, Zap, Scale, Clock, AlertTriangle, ShieldCheck, Sparkles,
  UserCheck, Activity, ShieldAlert, HeartPulse, Crosshair, Maximize2, Minimize2,
  BarChart3, Users, ChevronDown, ChevronUp, RefreshCw, Trophy, Target, BookOpen
} from 'lucide-react';

/* ─── Utility ───────────────────────────────────────────────── */
const fmt = (v, decimals = 1, fallback = '—') => {
  if (v === null || v === undefined || (typeof v === 'number' && isNaN(v))) return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : n.toFixed(decimals);
};
const fmtInt = (v, fallback = '—') => {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : String(Math.round(n));
};
const epaColor = (v) => {
  const n = Number(v);
  if (isNaN(n)) return 'var(--text-3)';
  return n > 0 ? '#34d399' : n < 0 ? '#f87171' : 'var(--text-3)';
};
const fmtEpa = (v) => {
  const n = Number(v);
  if (isNaN(n)) return '—';
  return (n > 0 ? '+' : '') + n.toFixed(3);
};

/* ─── Feature Row ────────────────────────────────────────────── */
const FeatureRow = ({ Icon, label, desc, value, favors }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, padding: '11px 13px',
    background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: 'var(--teal-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={13} color="var(--teal-bright)" />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{desc}</div>
      </div>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div className="font-mono-num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)', marginTop: 2 }}>Favors {favors}</div>
    </div>
  </div>
);

/* ─── Stat Table with Interactive Info Bubble Headers ────────── */
const StatTable = ({ category = '', columns, rows, emptyMsg = 'No data available' }) => {
  const [activeHeaderKey, setActiveHeaderKey] = useState(null);

  const handleToggle = (key) => {
    setActiveHeaderKey((prev) => (prev === key ? null : key));
  };
  const handleClose = () => setActiveHeaderKey(null);

  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-3)', fontSize: 12, fontStyle: 'italic' }}>
        {emptyMsg}
      </div>
    );
  }
  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {columns.map((col) => (
              <StatHeaderCell
                key={col.key}
                col={col}
                category={category}
                activeKey={activeHeaderKey}
                onToggle={handleToggle}
                onClose={handleClose}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              {columns.map((col) => {
                const val = row[col.key];
                const isName = col.key === 'name';
                const isPos = col.key === 'position';
                const isTeam = col.key === '_team';
                const isEpa = col.key?.includes('epa') || col.key === 'cpoe';
                const cellColor = isEpa ? epaColor(val) : isName ? 'var(--text-1)' : isTeam ? (row._color || 'var(--teal-bright)') : 'var(--text-2)';
                const displayVal = isEpa ? fmtEpa(val) : val ?? '—';
                return (
                  <td key={col.key} style={{
                    padding: '8px 10px', textAlign: col.align || 'right',
                    color: cellColor, fontWeight: (isName || isTeam) ? 700 : 500,
                    whiteSpace: isName ? 'nowrap' : 'normal',
                    fontFamily: (!isName && !isPos && !isTeam) ? 'Space Grotesk, monospace' : 'inherit',
                    fontSize: isName ? 12 : 11,
                  }}>
                    {isPos ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 6px', borderRadius: 5,
                        background: 'rgba(20,184,166,0.12)', color: 'var(--teal-bright)',
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.4px'
                      }}>{displayVal}</span>
                    ) : isTeam ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 5px', borderRadius: 4,
                        background: 'rgba(255,255,255,0.06)',
                        color: row._color || 'var(--teal-bright)',
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.5px'
                      }}>{displayVal}</span>
                    ) : String(displayVal)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Section Header ─────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, iconColor = 'var(--teal-bright)', accent = 'rgba(20,184,166,0.15)' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10,
    padding: '8px 12px', background: accent,
    borderRadius: 9, border: `1px solid ${iconColor}33`,
  }}>
    <Icon size={13} color={iconColor} />
    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.7px', textTransform: 'uppercase', color: iconColor }}>{title}</span>
  </div>
);

/* ─── Team Selector ──────────────────────────────────────────── */
const TeamToggle = ({ away, home, selected, onChange }) => (
  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
    {[away, 'both', home].map((t) => (
      <button key={t} onClick={() => onChange(t)} style={{
        flex: 1, padding: '7px 4px', borderRadius: 8,
        border: `1px solid ${selected === t ? 'rgba(20,184,166,0.6)' : 'rgba(255,255,255,0.08)'}`,
        background: selected === t ? 'var(--teal-dim)' : 'rgba(0,0,0,0.3)',
        color: selected === t ? 'var(--teal-bright)' : 'var(--text-3)',
        fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', cursor: 'pointer',
        transition: 'all 0.18s', textTransform: 'uppercase',
      }}>
        {t === 'both' ? 'Both Teams' : t}
      </button>
    ))}
  </div>
);

/* ─── Stat Category Block ────────────────────────────────────── */
const StatCategory = ({ categoryKey, title, icon, iconColor, accent, columns, rows, emptyMsg }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen((v) => !v)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left', padding: 0, marginBottom: open ? 10 : 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 9, padding: '8px 12px', background: accent,
          borderRadius: 9, border: `1px solid ${iconColor}33`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {React.createElement(icon, { size: 13, color: iconColor })}
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.7px', textTransform: 'uppercase', color: iconColor }}>{title}</span>
            {rows && rows.length > 0 && (
              <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>({rows.length})</span>
            )}
          </div>
          {open ? <ChevronUp size={13} color={iconColor} /> : <ChevronDown size={13} color={iconColor} />}
        </div>
      </button>
      {open && (
        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, overflow: 'visible',
        }}>
          <StatTable category={categoryKey} columns={columns} rows={rows} emptyMsg={emptyMsg} />
        </div>
      )}
    </div>
  );
};

/* ─── Player Stats Tab ───────────────────────────────────────── */
const PASSING_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'completions', label: 'CMP' },
  { key: 'attempts', label: 'ATT' },
  { key: 'comp_pct', label: 'CMP%' },
  { key: 'passing_yards', label: 'YDS' },
  { key: 'passing_tds', label: 'TD' },
  { key: 'interceptions', label: 'INT' },
  { key: 'sacks', label: 'SK' },
  { key: 'passing_epa', label: 'EPA' },
  { key: 'cpoe', label: 'CPOE' },
];
const RUSHING_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'carries', label: 'CAR' },
  { key: 'rushing_yards', label: 'YDS' },
  { key: 'avg_ypc', label: 'AVG' },
  { key: 'rushing_tds', label: 'TD' },
  { key: 'fumbles_lost', label: 'FL' },
  { key: 'rushing_epa', label: 'EPA' },
];
const RECEIVING_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'targets', label: 'TGT' },
  { key: 'receptions', label: 'REC' },
  { key: 'catch_pct', label: 'CTH%' },
  { key: 'receiving_yards', label: 'YDS' },
  { key: 'avg_ypr', label: 'AVG' },
  { key: 'receiving_tds', label: 'TD' },
  { key: 'target_share', label: 'TGT%' },
  { key: 'receiving_epa', label: 'EPA' },
];
const DEFENSE_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'total_tackles', label: 'TOT' },
  { key: 'solo_tackles', label: 'SOLO' },
  { key: 'assist_tackles', label: 'AST' },
  { key: 'tackles_for_loss', label: 'TFL' },
  { key: 'sacks', label: 'SK' },
  { key: 'interceptions', label: 'INT' },
  { key: 'forced_fumbles', label: 'FF' },
  { key: 'fumble_recoveries', label: 'FR' },
  { key: 'passes_defended', label: 'PD' },
  { key: 'defensive_tds', label: 'TD' },
];
const KICKING_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'fg_made', label: 'FGM' },
  { key: 'fg_att', label: 'FGA' },
  { key: 'fg_pct', label: 'FG%' },
  { key: 'fg_long', label: 'LNG' },
  { key: 'pat_made', label: 'XPM' },
  { key: 'pat_att', label: 'XPA' },
];
const PUNTING_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'punts', label: 'NO' },
  { key: 'punt_yards', label: 'YDS' },
  { key: 'avg_punt', label: 'AVG' },
  { key: 'net_avg', label: 'NET' },
  { key: 'inside_20', label: 'IN20' },
  { key: 'long', label: 'LNG' },
  { key: 'touchbacks', label: 'TB' },
];
const RETURNS_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'kickoff_returns', label: 'KR' },
  { key: 'kickoff_return_yards', label: 'KR YDS' },
  { key: 'kr_avg', label: 'KR AVG' },
  { key: 'punt_returns', label: 'PR' },
  { key: 'punt_return_yards', label: 'PR YDS' },
  { key: 'pr_avg', label: 'PR AVG' },
  { key: 'return_tds', label: 'TD' },
];

const mergeRows = (homeRows, awayRows, teamView, homeAbbr, awayAbbr) => {
  const tag = (rows, label, color) =>
    (rows || []).map((r) => ({ ...r, _team: label, _color: color }));

  if (teamView === homeAbbr) return tag(homeRows, homeAbbr, 'var(--green)');
  if (teamView === awayAbbr) return tag(awayRows, awayAbbr, 'var(--teal-bright)');
  // both: interleave with team tags
  const h = tag(homeRows, homeAbbr, 'var(--green)');
  const a = tag(awayRows, awayAbbr, 'var(--teal-bright)');
  return [...h, ...a];
};

const buildCols = (baseCols, teamView, homeAbbr, awayAbbr) => {
  if (teamView !== 'both') return baseCols;
  return [
    { key: '_team', label: 'Team', align: 'center' },
    ...baseCols,
  ];
};

const PlayerStatsTab = ({ game, boxscore, isLoadingBoxscore, boxscoreError }) => {
  const [teamView, setTeamView] = useState('both');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const homeAbbr = game.home_team.abbr;
  const awayAbbr = game.away_team.abbr;

  if (!game.is_completed) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Trophy size={26} color="var(--teal-bright)" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>
          Pregame Mode
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>
          Full player box scores will unlock when this game is completed. 
          Switch to the <strong style={{ color: 'var(--teal-bright)' }}>Analysis</strong> tab for pregame forecasts and feature differentials.
        </div>
        <div style={{
          marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Passing: CMP/ATT/YDS/TD/INT', icon: '🏈' },
            { label: 'Rushing: CAR/YDS/TD', icon: '🏃' },
            { label: 'Receiving: TGT/REC/YDS/TD', icon: '🙌' },
            { label: 'Defense: TOT/SK/INT/FF', icon: '🛡️' },
            { label: 'Special Teams: FG/XP/Punts/Returns', icon: '🎯' },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 99, fontSize: 11, color: 'var(--text-3)',
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoadingBoxscore) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw size={28} color="var(--teal-bright)" className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading player statistics…</div>
      </div>
    );
  }

  if (boxscoreError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <AlertTriangle size={28} color="#f87171" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13, color: '#f87171' }}>{boxscoreError}</div>
      </div>
    );
  }

  const home = boxscore?.home || {};
  const away = boxscore?.away || {};

  const buildMerged = (cat) => {
    const rows = mergeRows(home[cat], away[cat], teamView, homeAbbr, awayAbbr);
    return rows;
  };

  const buildTeamCols = (base) => buildCols(base, teamView, homeAbbr, awayAbbr);

  return (
    <div>
      {/* Interactive Stat Definitions Hint Banner + Glossary Modal Trigger */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '10px 14px', marginBottom: 16,
        background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.18)',
        borderRadius: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-2)', flex: 1, minWidth: 220 }}>
          <Sparkles size={14} color="var(--teal-bright)" style={{ flexShrink: 0 }} />
          <span>
            Click any column abbreviation (e.g. <strong style={{ color: 'var(--teal-bright)' }}>TGT</strong>, <strong style={{ color: 'var(--teal-bright)' }}>SK</strong>, <strong style={{ color: 'var(--teal-bright)' }}>EPA</strong>, <strong style={{ color: 'var(--teal-bright)' }}>CPOE</strong>) to view its full name and definition.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsGlossaryOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 7,
            background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)',
            color: 'var(--teal-bright)', fontSize: 10, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}
        >
          <BookOpen size={12} />
          Stat Glossary
        </button>
      </div>

      <TeamToggle away={awayAbbr} home={homeAbbr} selected={teamView} onChange={setTeamView} />

      {/* Passing */}
      <StatCategory
        categoryKey="passing"
        title="Passing"
        icon={Target}
        iconColor="var(--teal-bright)"
        accent="rgba(20,184,166,0.08)"
        columns={buildTeamCols(PASSING_COLS)}
        rows={buildMerged('passing')}
        emptyMsg="No passing stats recorded"
      />

      {/* Rushing */}
      <StatCategory
        categoryKey="rushing"
        title="Rushing"
        icon={Zap}
        iconColor="#a78bfa"
        accent="rgba(167,139,250,0.08)"
        columns={buildTeamCols(RUSHING_COLS)}
        rows={buildMerged('rushing')}
        emptyMsg="No rushing stats recorded"
      />

      {/* Receiving */}
      <StatCategory
        categoryKey="receiving"
        title="Receiving"
        icon={Activity}
        iconColor="#60a5fa"
        accent="rgba(96,165,250,0.08)"
        columns={buildTeamCols(RECEIVING_COLS)}
        rows={buildMerged('receiving')}
        emptyMsg="No receiving stats recorded"
      />

      {/* Defense */}
      <StatCategory
        categoryKey="defense"
        title="Defense"
        icon={ShieldAlert}
        iconColor="#f87171"
        accent="rgba(239,68,68,0.08)"
        columns={buildTeamCols(DEFENSE_COLS)}
        rows={buildMerged('defense')}
        emptyMsg="No defensive stats recorded"
      />

      {/* Kicking */}
      <StatCategory
        categoryKey="kicking"
        title="Kicking"
        icon={Crosshair}
        iconColor="#fbbf24"
        accent="rgba(251,191,36,0.08)"
        columns={buildTeamCols(KICKING_COLS)}
        rows={buildMerged('kicking')}
        emptyMsg="No kicking stats recorded"
      />

      {/* Punting */}
      <StatCategory
        categoryKey="punting"
        title="Punting"
        icon={TrendingUp}
        iconColor="#fb923c"
        accent="rgba(251,146,60,0.08)"
        columns={buildTeamCols(PUNTING_COLS)}
        rows={buildMerged('punting')}
        emptyMsg="No punting stats recorded"
      />

      {/* Returns */}
      <StatCategory
        categoryKey="returns"
        title="Kick & Punt Returns"
        icon={Scale}
        iconColor="#34d399"
        accent="rgba(52,211,153,0.08)"
        columns={buildTeamCols(RETURNS_COLS)}
        rows={buildMerged('returns')}
        emptyMsg="No return stats recorded"
      />

      {/* Glossary Modal */}
      <StatGlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
};

/* ─── Analysis Tab ───────────────────────────────────────────── */
const AnalysisTab = ({ game, sq, inj, diffItems, model_breakdown, home_team, away_team }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

    {/* Starting QBs */}
    <div style={{
      background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crosshair size={14} color="var(--teal-bright)" />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-2)' }}>
            Starting Quarterback Matchup
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--teal-bright)', fontWeight: 700 }}>
          {game.differentials.qb_epa_diff > 0
            ? `+${game.differentials.qb_epa_diff} EPA Favors ${home_team.abbr}`
            : game.differentials.qb_epa_diff < 0
            ? `+${Math.abs(game.differentials.qb_epa_diff)} EPA Favors ${away_team.abbr}`
            : 'Even QB EPA'}
        </span>
      </div>
      <div className="qb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { abbr: away_team.abbr, name: sq.away_qb, epa: sq.away_epa, cpoe: sq.away_cpoe, color: 'var(--teal-bright)' },
          { abbr: home_team.abbr, name: sq.home_qb, epa: sq.home_epa, cpoe: sq.home_cpoe, color: 'var(--green)' },
        ].map(qb => (
          <div key={qb.abbr} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: qb.color, marginBottom: 4 }}>{qb.abbr} QB</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>{qb.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
              <span>EPA/play: <strong style={{ color: 'var(--text-1)' }}>{qb.epa > 0 ? `+${qb.epa}` : qb.epa}</strong></span>
              <span>CPOE: <strong style={{ color: 'var(--text-1)' }}>{qb.cpoe > 0 ? `+${qb.cpoe}%` : `${qb.cpoe}%`}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Injuries */}
    <div style={{
      background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartPulse size={14} color="#f87171" />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-2)' }}>
            Position-Weighted Roster Injuries
          </span>
        </div>
        <span style={{ fontSize: 10, color: (game.differentials.injury_diff || 0) >= 0 ? 'var(--green)' : '#f87171', fontWeight: 700 }}>
          {(game.differentials.injury_diff || 0) > 0
            ? `Health Advantage: ${home_team.abbr} (+${game.differentials.injury_diff})`
            : (game.differentials.injury_diff || 0) < 0
            ? `Health Advantage: ${away_team.abbr} (+${Math.abs(game.differentials.injury_diff)})`
            : 'Even Health'}
        </span>
      </div>
      <div className="injury-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { abbr: away_team.abbr, index: inj.away_index, injuries: inj.away_injuries, color: 'var(--teal-bright)' },
          { abbr: home_team.abbr, index: inj.home_index, injuries: inj.home_injuries, color: 'var(--green)' },
        ].map(t => (
          <div key={t.abbr} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: t.color }}>{t.abbr} Injuries</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Impact: <strong style={{ color: '#f87171' }}>{t.index} pts</strong></span>
            </div>
            {t.injuries && t.injuries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {t.injuries.slice(0, 4).map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                      {p.name} <span style={{ color: 'var(--text-3)', fontSize: 10 }}>({p.position}{p.is_starter ? ' - Starter' : ''})</span>
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                      background: p.status === 'Out' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                      color: p.status === 'Out' ? '#f87171' : '#facc15',
                    }}>{p.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>No major reported starter injuries</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Ensemble Model Breakdown */}
    <div style={{
      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 14, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ShieldCheck size={14} color="var(--green)" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-3)' }}>
          Ensemble Model Breakdown
        </span>
      </div>
      <div className="model-breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { name: 'Logistic Regression', weight: model_breakdown.logistic_weight, prob: model_breakdown.logistic_home_win_prob },
          { name: 'HistGradientBoosting', weight: model_breakdown.boosted_weight, prob: model_breakdown.boosted_home_win_prob },
        ].map(m => (
          <div key={m.name} style={{
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>
              {m.name} <span style={{ color: 'var(--teal-bright)', fontWeight: 700 }}>({m.weight}% wt)</span>
            </div>
            <div className="font-mono-num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
              {m.prob}% <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{home_team.abbr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Feature Differentials */}
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>
        Pregame Feature Differentials (Home − Away)
      </div>
      <div className="feature-diff-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {diffItems.map((item, i) => (
          <FeatureRow key={i} Icon={item.icon} label={item.label} desc={item.desc} value={item.value} favors={item.favors} />
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main Modal ─────────────────────────────────────────────── */
export const MatchupDetailModal = ({ game, onClose }) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [boxscore, setBoxscore] = useState(null);
  const [isLoadingBoxscore, setIsLoadingBoxscore] = useState(false);
  const [boxscoreError, setBoxscoreError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animate in
  useEffect(() => {
    const t = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Fetch box score when Player Stats tab is selected and game is completed
  useEffect(() => {
    if (activeTab === 'players' && game.is_completed && !boxscore && !isLoadingBoxscore) {
      setIsLoadingBoxscore(true);
      setBoxscoreError(null);
      getBoxscore(game.game_id)
        .then(data => {
          setBoxscore(data);
          setIsLoadingBoxscore(false);
        })
        .catch(err => {
          setBoxscoreError(err.message || 'Failed to load player stats');
          setIsLoadingBoxscore(false);
        });
    }
  }, [activeTab, game.is_completed, game.game_id, boxscore, isLoadingBoxscore]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  if (!game) return null;

  const {
    home_team, away_team, predicted_winner, confidence, differentials,
    starting_qbs, injury_breakdown, model_breakdown, gameday,
  } = game;

  const awayFullName = away_team.name || TEAM_INFO[away_team.abbr]?.name || away_team.abbr;
  const homeFullName = home_team.name || TEAM_INFO[home_team.abbr]?.name || home_team.abbr;
  const awayRecord = away_team.record || `${away_team.wins ?? 0}-${away_team.losses ?? 0}`;
  const homeRecord = home_team.record || `${home_team.wins ?? 0}-${home_team.losses ?? 0}`;

  const sq = starting_qbs || { home_qb: 'Starting QB', away_qb: 'Starting QB', home_epa: 0, away_epa: 0, home_cpoe: 0, away_cpoe: 0 };
  const inj = injury_breakdown || { home_index: 0, away_index: 0, home_injuries: [], away_injuries: [] };

  const diffItems = [
    { label: 'Elo Rating Diff', value: differentials.elo_diff > 0 ? `+${differentials.elo_diff}` : differentials.elo_diff, favors: differentials.elo_diff > 0 ? home_team.abbr : away_team.abbr, icon: TrendingUp, desc: 'Includes 55 Elo home field advantage' },
    { label: 'Starting QB EPA / Play', value: differentials.qb_epa_diff !== undefined ? (differentials.qb_epa_diff > 0 ? `+${differentials.qb_epa_diff}` : differentials.qb_epa_diff) : '+0.00', favors: (differentials.qb_epa_diff || 0) > 0 ? home_team.abbr : away_team.abbr, icon: Crosshair, desc: 'Rolling QB passing & rushing EPA differential' },
    { label: 'Starting QB CPOE (%)', value: differentials.qb_cpoe_diff !== undefined ? `${differentials.qb_cpoe_diff > 0 ? '+' : ''}${differentials.qb_cpoe_diff}%` : '+0.0%', favors: (differentials.qb_cpoe_diff || 0) > 0 ? home_team.abbr : away_team.abbr, icon: UserCheck, desc: 'Completion % Over Expected accuracy form' },
    { label: 'Roster Health Advantage', value: differentials.injury_diff !== undefined ? `${differentials.injury_diff > 0 ? '+' : ''}${differentials.injury_diff} pts` : '0.0 pts', favors: (differentials.injury_diff || 0) > 0 ? home_team.abbr : away_team.abbr, icon: HeartPulse, desc: 'Position-weighted injury impact differential' },
    { label: 'Net EPA / Play Diff', value: differentials.net_epa_diff > 0 ? `+${differentials.net_epa_diff}` : differentials.net_epa_diff, favors: differentials.net_epa_diff > 0 ? home_team.abbr : away_team.abbr, icon: Zap, desc: 'Offensive vs defensive down efficiency' },
    { label: 'Success Rate Diff', value: `${differentials.net_success_diff > 0 ? '+' : ''}${differentials.net_success_diff}%`, favors: differentials.net_success_diff > 0 ? home_team.abbr : away_team.abbr, icon: Scale, desc: 'Percentage of positive EPA plays' },
    { label: 'Recent 5-Game Margin', value: differentials.recent_margin_diff > 0 ? `+${differentials.recent_margin_diff} pts` : `${differentials.recent_margin_diff} pts`, favors: differentials.recent_margin_diff > 0 ? home_team.abbr : away_team.abbr, icon: TrendingUp, desc: 'Weighted point differential form' },
    { label: 'Turnover Rate Diff', value: `${differentials.turnover_rate_diff > 0 ? '+' : ''}${differentials.turnover_rate_diff}%`, favors: differentials.turnover_rate_diff < 0 ? home_team.abbr : away_team.abbr, icon: AlertTriangle, desc: 'Takeaway/giveaway rate per play' },
    { label: 'Rest Advantage', value: `${differentials.rest_diff > 0 ? '+' : ''}${differentials.rest_diff} days`, favors: differentials.rest_diff > 0 ? home_team.abbr : differentials.rest_diff < 0 ? away_team.abbr : 'Even', icon: Clock, desc: 'Rest days relative to opponent' },
  ];

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'players', label: 'Player Stats', icon: Users, badge: game.is_completed ? 'Live' : 'Pregame' },
  ];

  const modalW = isFullscreen ? '100vw' : 'min(92vw, 780px)';
  const modalH = isFullscreen ? '100vh' : '92vh';
  const modalRadius = isFullscreen ? 0 : 22;
  const modalPad = isFullscreen ? '28px 32px' : '28px 24px';

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      style={{
        padding: isFullscreen ? 0 : '20px 12px',
        alignItems: isFullscreen ? 'flex-start' : 'center',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="modal-sheet"
        style={{
          width: modalW,
          maxWidth: '100%',
          height: modalH,
          maxHeight: '100%',
          overflowY: 'auto',
          background: 'rgba(8,16,23,0.98)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: isFullscreen ? 'none' : '1px solid var(--border)',
          borderRadius: modalRadius,
          padding: modalPad,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: isFullscreen ? 'none' : '0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px rgba(20,184,166,0.1) inset',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), width 0.25s, height 0.25s, border-radius 0.25s',
        }}
      >
        {/* ── Top Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--teal-bright)' }}>
              Pregame Deep Dive
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginTop: 2 }}>{gameday}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(v => !v)}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)',
                color: 'var(--teal-bright)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.1)'; }}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            {/* Close */}
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-3)'; }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Matchup Banner ── */}
        <div className="modal-matchup-banner" style={{
          background: 'rgba(0,0,0,0.55)', border: '1px solid var(--border)', borderRadius: 16,
          padding: '18px 12px',
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          {/* Away */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5 }}>
            <TeamBadge abbr={away_team.abbr} size={52} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{away_team.abbr}</span>
              <span className="team-record-badge">{awayRecord}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>{awayFullName}</div>
            <div className="font-mono-num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal-bright)' }}>
              {away_team.win_prob}%
            </div>
            {game.is_completed && away_team.score !== null && away_team.score !== undefined && (
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)' }}>{away_team.score}</div>
            )}
          </div>

          {/* Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase' }}>AT</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 99, padding: '4px 10px',
            }}>
              <Sparkles size={11} color="var(--green)" className="sparkle-icon" />
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)' }}>{predicted_winner}</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>{confidence}% conf.</span>
          </div>

          {/* Home */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5 }}>
            <TeamBadge abbr={home_team.abbr} size={52} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{home_team.abbr}</span>
              <span className="team-record-badge">{homeRecord}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>{homeFullName}</div>
            <div className="font-mono-num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>
              {home_team.win_prob}%
            </div>
            {game.is_completed && home_team.score !== null && home_team.score !== undefined && (
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)' }}>{home_team.score}</div>
            )}
          </div>
        </div>

        {/* ── Probability Bar ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span className="prob-label away">{away_team.abbr} {away_team.win_prob}%</span>
            <span className="prob-label home">{home_team.win_prob}% {home_team.abbr}</span>
          </div>
          <div className="prob-bar">
            <div className="prob-bar-segment away" style={{ width: `${away_team.win_prob}%` }} />
            <div className="prob-bar-segment home" style={{ width: `${home_team.win_prob}%` }} />
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div style={{
          display: 'flex', gap: 4, background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: 4, flexShrink: 0,
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 12px', borderRadius: 9,
                  background: isActive ? 'linear-gradient(135deg, rgba(20,184,166,0.25), rgba(16,185,129,0.15))' : 'transparent',
                  border: isActive ? '1px solid rgba(20,184,166,0.4)' : '1px solid transparent',
                  color: isActive ? 'var(--teal-bright)' : 'var(--text-3)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: 8, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
                    padding: '2px 5px', borderRadius: 4,
                    background: game.is_completed ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)',
                    color: game.is_completed ? '#34d399' : '#fbbf24',
                    border: `1px solid ${game.is_completed ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                  }}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {activeTab === 'analysis' && (
            <AnalysisTab
              game={game}
              sq={sq}
              inj={inj}
              diffItems={diffItems}
              model_breakdown={model_breakdown}
              home_team={home_team}
              away_team={away_team}
            />
          )}
          {activeTab === 'players' && (
            <PlayerStatsTab
              game={game}
              boxscore={boxscore}
              isLoadingBoxscore={isLoadingBoxscore}
              boxscoreError={boxscoreError}
            />
          )}
        </div>

        {/* ── Footer Close ── */}
        <button
          onClick={handleClose}
          style={{
            flexShrink: 0, width: '100%', padding: '12px 0', borderRadius: 11,
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(16,185,129,0.3)', transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Close
        </button>
      </div>
    </div>
  );
};
