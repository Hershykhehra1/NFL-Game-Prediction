import React, { useState } from 'react';
import {
  Trophy, RefreshCw, AlertTriangle, Sparkles, BookOpen,
  Target, Zap, Activity, ShieldAlert, Crosshair, TrendingUp, Scale
} from 'lucide-react';
import { StatGlossaryModal } from '../../common/StatInfoBubble';
import { TeamToggle } from './TeamToggle';
import { StatCategory } from './StatCategory';
import {
  PASSING_COLS, RUSHING_COLS, RECEIVING_COLS, DEFENSE_COLS,
  KICKING_COLS, PUNTING_COLS, RETURNS_COLS,
  mergeRows, buildCols
} from './playerStatsConstants';

/**
 * PlayerStatsTab displays full player statistics across all key tactical units,
 * or a placeholder with feature highlights if the game is upcoming/pregame.
 */
export const PlayerStatsTab = ({ game, boxscore, isLoadingBoxscore, boxscoreError }) => {
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
    return mergeRows(home[cat], away[cat], teamView, homeAbbr, awayAbbr);
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

export default PlayerStatsTab;
