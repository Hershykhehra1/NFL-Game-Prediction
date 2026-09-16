import React, { useState, useEffect } from 'react';
import { TeamBadge } from '../../utils/teamLogos';
import { getTeams, predictCustom } from '../../services/api';
import { 
  Sliders, RefreshCw, Sparkles, ArrowRight, Info, HelpCircle, 
  BookOpen, ChevronDown, ChevronUp, X, Zap, Shield, Award, Activity, RotateCcw
} from 'lucide-react';

/* ── Metric Information Dictionary ───────────────────────────────────── */
const METRIC_INFO = {
  elo: {
    id: 'elo',
    title: 'Elo Rating Differential',
    tag: 'Overall Caliber',
    color: 'var(--green)',
    meaning: 'Elo is an adaptive power rating reflecting total team caliber and historical strength of schedule. An average NFL team is ~1500 Elo; top contenders reach 1650–1750, while rebuilding teams drop to 1350–1400.',
    impact: 'One of the highest weighted base features. A +100 Elo differential gives the favored team a ~65–70% baseline win probability advantage.',
    benchmark: '0 = Equal teams | ±50 = Moderate edge | ±150 = Massive mismatch',
    direction: 'Positive (+) favors Home team • Negative (−) favors Away team',
  },
  epa: {
    id: 'epa',
    title: 'Net Expected Points Added (EPA) / Play',
    tag: 'Per-Play Dominance',
    color: 'var(--teal-bright)',
    meaning: 'Expected Points Added measures the net points a team generates per play relative to down, distance, and field position context (Offensive EPA/play minus Defensive EPA/play allowed).',
    impact: 'The premier modern metric for true underlying efficiency. High positive EPA indicates sustainable drive success and scoring efficiency over defensive resistance.',
    benchmark: '0.00 = League avg | +0.08 = Top 5 efficiency | +0.15 = Elite offense / lockdown defense',
    direction: 'Positive (+) means Home team produces more expected points per snap than Away',
  },
  success_rate: {
    id: 'success_rate',
    title: 'Success Rate Differential',
    tag: 'Down-to-Down Consistency',
    color: 'var(--green)',
    meaning: 'The % of plays that gain positive EPA or critical yardage (40% of needed yards on 1st down, 60% on 2nd, 100% on 3rd/4th) minus opponent success rate.',
    impact: 'While EPA rewards explosive splash plays, Success Rate rewards drive continuity and avoiding negative plays. Teams with high success rates control tempo and time of possession.',
    benchmark: '0.0% = Equal consistency | ±3.0% = Clear drive edge | ±6.0% = Dominant down conversion',
    direction: 'Positive (+) means Home offense consistently stays ahead of the chains',
  },
  recent_margin: {
    id: 'recent_margin',
    title: 'Recent 5-Game Margin (pts)',
    tag: 'Current Momentum & Form',
    color: 'var(--teal-bright)',
    meaning: 'The average point differential (Points Scored minus Points Allowed) over each team’s last 5 games played.',
    impact: 'Captures short-term trends, recent quarterback play, injury returns, and late-season momentum that season-long averages might lag in showing.',
    benchmark: '0 pts = Neutral form | +7.0 pts = Winning by a TD avg | +14.0 pts = Torrid hot streak',
    direction: 'Positive (+) means Home team has been outscoring opponents by more than Away team',
  },
  turnover_rate: {
    id: 'turnover_rate',
    title: 'Turnover Rate Differential',
    tag: 'Ball Security & Havoc',
    color: '#38bdf8',
    meaning: 'Differential in giveaway/takeaway frequency (% of offensive drives ending in turnovers minus defensive turnover generation rate).',
    impact: 'Turnovers are the single highest variance play in football (~4.0 expected points per takeaway). A negative turnover rate differential (giving away fewer balls) strongly bolsters victory likelihood.',
    benchmark: '0.0% = Equal ball security | −2.0% = Disciplined ball protection | +2.0% = High turnover risk',
    direction: 'Negative (−) favors Home team (fewer giveaways); Positive (+) favors Away team',
  },
  rest: {
    id: 'rest',
    title: 'Rest & Preparation Advantage',
    tag: 'Conditioning & Gameplan',
    color: 'var(--green)',
    meaning: 'Difference in preparation and physical recovery days between the two teams prior to kickoff (e.g., Thursday Night game gives +3 days, Bye week gives +7 days).',
    impact: 'Extra rest days improve injury recovery, physical energy, and coaching scheme preparation, especially late in the season or on short-week road trips.',
    benchmark: '0 days = Standard 7-day week | +3 days = Thursday-to-Sunday edge | +7 days = Post-bye advantage',
    direction: 'Positive (+) gives Home team more rest days than Away team',
  },
  neutral_site: {
    id: 'neutral_site',
    title: 'Neutral Site Game Condition',
    tag: 'Home Field Advantage',
    color: 'var(--teal-bright)',
    meaning: 'Standard NFL home teams receive ~2.0 to 2.8 points of spread advantage from familiar turf, travel fatigue on the opponent, and crowd noise disrupting snap counts.',
    impact: 'Enabling Neutral Site removes the inherent ~2.5% to 4% home win probability boost, recalculating the matchup strictly on neutral ground (e.g. Super Bowl, London/Munich international series).',
    benchmark: 'Standard = ~57% baseline home win rate in NFL history | Neutral = 50/50 baseline',
    direction: 'Toggling ON neutralizes all stadium and crowd advantages for the Home team',
  },
};

/* ── Metric Info Card Component ──────────────────────────────────────── */
const MetricInfoBox = ({ metricKey, onClose }) => {
  const info = METRIC_INFO[metricKey];
  if (!info) return null;

  return (
    <div style={{
      background: 'rgba(5, 15, 22, 0.95)',
      border: '1px solid var(--border-strong)',
      borderRadius: 12,
      padding: '14px 16px',
      marginTop: 8,
      marginBottom: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: 'rgba(20,184,166,0.15)',
            border: '1px solid rgba(45,212,191,0.3)',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 10,
            fontWeight: 800,
            color: 'var(--teal-bright)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {info.tag}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{info.title}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-3)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 4,
          }}
          title="Close details"
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, lineHeight: 1.5 }}>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--teal-bright)', display: 'inline-block', marginRight: 4 }}>
            📖 What it means:
          </span>
          <span style={{ color: 'var(--text-2)' }}>{info.meaning}</span>
        </div>

        <div>
          <span style={{ fontWeight: 700, color: 'var(--green-neon)', display: 'inline-block', marginRight: 4 }}>
            ⚡ Matchup Impact:
          </span>
          <span style={{ color: 'var(--text-2)' }}>{info.impact}</span>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 11,
          color: 'var(--text-3)'
        }}>
          <div>
            <strong style={{ color: 'var(--text-2)' }}>Benchmark:</strong> {info.benchmark}
          </div>
          <div>
            <strong style={{ color: 'var(--text-2)' }}>Scale:</strong> {info.direction}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Slider Row with Info Icon ──────────────────────────────────────── */
const SliderRow = ({ 
  metricKey, 
  label, 
  value, 
  displayValue, 
  min, 
  max, 
  step, 
  onChange, 
  color = 'var(--green)',
  activeInfoKey,
  onToggleInfo
}) => {
  const isInfoOpen = activeInfoKey === metricKey;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
          <button
            type="button"
            onClick={() => onToggleInfo(metricKey)}
            style={{
              background: isInfoOpen ? 'var(--teal-bright)' : 'rgba(20,184,166,0.12)',
              border: isInfoOpen ? '1px solid var(--teal-bright)' : '1px solid rgba(20,184,166,0.25)',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isInfoOpen ? '#050a0e' : 'var(--teal-bright)',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            title={`Learn about ${label}`}
            aria-label={`Info about ${label}`}
          >
            <Info size={11} strokeWidth={2.6} />
          </button>
        </div>
        <span className="font-mono-num" style={{ fontSize: 13, fontWeight: 700, color, minWidth: 64, textAlign: 'right' }}>
          {displayValue}
        </span>
      </div>

      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer', height: 5 }}
      />

      {isInfoOpen && (
        <MetricInfoBox metricKey={metricKey} onClose={() => onToggleInfo(null)} />
      )}
    </div>
  );
};

/* ── Section Header ─────────────────────────────────────────────────── */
const SectionTitle = ({ children, extra }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottom: '1px solid rgba(20,184,166,0.15)',
  }}>
    <div style={{
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      color: 'var(--teal-bright)',
    }}>
      {children}
    </div>
    {extra}
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────── */
export const MatchupSandbox = () => {
  const [teams, setTeams]           = useState([]);
  const [homeTeam, setHomeTeam]     = useState('KC');
  const [awayTeam, setAwayTeam]     = useState('BUF');
  const [eloDiff, setEloDiff]             = useState(55);
  const [netEpaDiff, setNetEpaDiff]       = useState(0.05);
  const [netSuccessDiff, setNetSuccessDiff] = useState(2.5);
  const [recentMarginDiff, setRecentMarginDiff] = useState(3.0);
  const [turnoverRateDiff, setTurnoverRateDiff] = useState(-0.5);
  const [restDiff, setRestDiff]           = useState(0);
  const [isNeutral, setIsNeutral]         = useState(false);
  const [result, setResult]               = useState(null);
  const [activeInfoKey, setActiveInfoKey] = useState(null);
  const [showFullGuide, setShowFullGuide] = useState(false);

  useEffect(() => {
    getTeams()
      .then((d) => { if (d.teams) setTeams(d.teams); })
      .catch(console.error);
  }, []);

  const handleSimulate = () => {
    predictCustom({
      home_team: homeTeam,
      away_team: awayTeam,
      elo_diff: eloDiff,
      win_pct_diff: 0.1,
      point_diff_diff: recentMarginDiff,
      recent_margin_diff: recentMarginDiff,
      net_epa_diff: netEpaDiff,
      net_success_diff: netSuccessDiff / 100,
      turnover_rate_diff: turnoverRateDiff / 100,
      rest_diff: restDiff,
      neutral_site: isNeutral,
    })
      .then(setResult)
      .catch(console.error);
  };

  useEffect(() => {
    handleSimulate();
  }, [homeTeam, awayTeam, eloDiff, netEpaDiff, netSuccessDiff, recentMarginDiff, turnoverRateDiff, restDiff, isNeutral]);

  const sign = (v) => (v > 0 ? `+${v}` : `${v}`);

  const handleToggleInfo = (key) => {
    setActiveInfoKey((prev) => (prev === key ? null : key));
  };

  // Quick preset loader
  const applyPreset = (preset) => {
    if (preset === 'even') {
      setEloDiff(0);
      setNetEpaDiff(0.0);
      setNetSuccessDiff(0.0);
      setRecentMarginDiff(0.0);
      setTurnoverRateDiff(0.0);
      setRestDiff(0);
      setIsNeutral(false);
    } else if (preset === 'home_power') {
      setEloDiff(120);
      setNetEpaDiff(0.12);
      setNetSuccessDiff(5.0);
      setRecentMarginDiff(9.5);
      setTurnoverRateDiff(-2.0);
      setRestDiff(3);
      setIsNeutral(false);
    } else if (preset === 'away_upset') {
      setEloDiff(-95);
      setNetEpaDiff(-0.09);
      setNetSuccessDiff(-4.5);
      setRecentMarginDiff(-7.0);
      setTurnoverRateDiff(2.5);
      setRestDiff(-2);
      setIsNeutral(false);
    }
  };

  return (
    <div className="content-area">

      {/* ── Page Header & Instructions ────────────────── */}
      <div className="glass-panel" style={{ padding: '24px 30px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.1))',
              border: '1px solid rgba(45,212,191,0.3)',
              borderRadius: 8,
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sliders size={16} color="var(--teal-bright)" />
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--teal-bright)' }}>
                Scenario Simulation Lab
              </span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2 }}>
                Custom Matchup Sandbox
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowFullGuide(!showFullGuide)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: showFullGuide ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.05)',
              border: showFullGuide ? '1px solid var(--teal-bright)' : '1px solid var(--border)',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: showFullGuide ? 'var(--teal-bright)' : 'var(--text-2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <BookOpen size={14} />
            <span>{showFullGuide ? 'Hide Instructions' : 'How the Sandbox Works'}</span>
            {showFullGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Instructions Paragraph */}
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 1050 }}>
          The Sandbox allows you to simulate hypothetical game scenarios between any two NFL teams by directly manipulating key statistical feature differentials (<strong>Home Team minus Away Team</strong>). Test what happens if a team gets healthy, catches momentum, experiences turnover issues, or plays on a neutral field.
        </p>

        {/* Detailed Guide Accordion */}
        {showFullGuide && (
          <div style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: '1px solid rgba(20,184,166,0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            animation: 'fadeIn 0.25s ease',
          }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--green-neon)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>1</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Choose Teams &amp; Venue</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Select the matchup participants. Toggle <strong>Neutral Site</strong> to eliminate the standard ~2.5% home stadium advantage (e.g. Super Bowl or London games).
              </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ background: 'rgba(20,184,166,0.2)', color: 'var(--teal-bright)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>2</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Adjust Feature Differentials</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Sliders represent <code style={{ color: 'var(--teal-bright)', background: 'rgba(20,184,166,0.1)', padding: '1px 4px', borderRadius: 4 }}>Home − Away</code>. Click the <strong>(i) info icons</strong> beside any metric to see its mathematical definition and model weighting.
              </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>3</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Instant Machine Learning Output</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Our trained XGBoost / Random Forest ensemble processes every slider update in real time to calculate win probabilities and victory confidence.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Grid ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Left: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Team Selection */}
          <div className="glass-panel" style={{ padding: '24px 28px' }}>
            <SectionTitle
              extra={
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => applyPreset('even')}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--text-2)',
                      cursor: 'pointer',
                    }}
                    title="Set all differentials to 0"
                  >
                    Even Matchup
                  </button>
                  <button
                    onClick={() => applyPreset('home_power')}
                    style={{
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--green)',
                      cursor: 'pointer',
                    }}
                    title="Give home team dominant edges"
                  >
                    Home Advantage
                  </button>
                  <button
                    onClick={() => applyPreset('away_upset')}
                    style={{
                      background: 'rgba(20,184,166,0.12)',
                      border: '1px solid rgba(20,184,166,0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--teal-bright)',
                      cursor: 'pointer',
                    }}
                    title="Give away team dominant edges"
                  >
                    Away Upset
                  </button>
                </div>
              }
            >
              1 — Select Teams &amp; Field Advantage
            </SectionTitle>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Away */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>
                  Away Team
                </label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-1)',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {teams.map((t) => (
                    <option key={t.abbr} value={t.abbr} disabled={t.abbr === homeTeam} style={{ background: '#050a0e' }}>
                      {t.abbr} — {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Home */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>
                  Home Team
                </label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-1)',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {teams.map((t) => (
                    <option key={t.abbr} value={t.abbr} disabled={t.abbr === awayTeam} style={{ background: '#050a0e' }}>
                      {t.abbr} — {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Neutral Site Toggle with Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Neutral Site Game</span>
                  <button
                    type="button"
                    onClick={() => handleToggleInfo('neutral_site')}
                    style={{
                      background: activeInfoKey === 'neutral_site' ? 'var(--teal-bright)' : 'rgba(20,184,166,0.12)',
                      border: activeInfoKey === 'neutral_site' ? '1px solid var(--teal-bright)' : '1px solid rgba(20,184,166,0.25)',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: activeInfoKey === 'neutral_site' ? '#050a0e' : 'var(--teal-bright)',
                      transition: 'all 0.15s ease',
                      padding: 0,
                    }}
                    title="Learn about Neutral Site impact"
                    aria-label="Info about Neutral Site"
                  >
                    <Info size={11} strokeWidth={2.6} />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Removes home stadium crowd &amp; travel advantage</div>
              </div>
              <button
                onClick={() => setIsNeutral(!isNeutral)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isNeutral
                    ? 'linear-gradient(135deg, #10b981, #0d9488)'
                    : 'rgba(255,255,255,0.08)',
                  color: isNeutral ? '#fff' : 'var(--text-3)',
                  boxShadow: isNeutral ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
                }}
              >
                {isNeutral ? 'Neutral (ON)' : 'Home Game'}
              </button>
            </div>

            {activeInfoKey === 'neutral_site' && (
              <MetricInfoBox metricKey="neutral_site" onClose={() => handleToggleInfo(null)} />
            )}
          </div>

          {/* Sliders */}
          <div className="glass-panel" style={{ padding: '24px 28px' }}>
            <SectionTitle
              extra={
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
                  Click <Info size={11} style={{ verticalAlign: 'middle', margin: '0 2px' }} /> on any metric to view impact
                </span>
              }
            >
              2 — Feature Differentials (Home − Away)
            </SectionTitle>

            <SliderRow
              metricKey="elo"
              label="Elo Rating Differential"
              value={eloDiff} min={-250} max={250} step={5}
              displayValue={`${sign(eloDiff)} Elo`}
              onChange={setEloDiff}
              color="var(--green)"
              activeInfoKey={activeInfoKey}
              onToggleInfo={handleToggleInfo}
            />

            <SliderRow
              metricKey="epa"
              label="Net EPA / Play Diff"
              value={netEpaDiff} min={-0.25} max={0.25} step={0.01}
              displayValue={sign(netEpaDiff)}
              onChange={setNetEpaDiff}
              color="var(--teal-bright)"
              activeInfoKey={activeInfoKey}
              onToggleInfo={handleToggleInfo}
            />

            <SliderRow
              metricKey="success_rate"
              label="Success Rate Diff (%)"
              value={netSuccessDiff} min={-10} max={10} step={0.5}
              displayValue={`${sign(netSuccessDiff)}%`}
              onChange={setNetSuccessDiff}
              color="var(--green)"
              activeInfoKey={activeInfoKey}
              onToggleInfo={handleToggleInfo}
            />

            <SliderRow
              metricKey="recent_margin"
              label="Recent 5-Game Margin (pts)"
              value={recentMarginDiff} min={-20} max={20} step={0.5}
              displayValue={`${sign(recentMarginDiff)} pts`}
              onChange={setRecentMarginDiff}
              color="var(--teal-bright)"
              activeInfoKey={activeInfoKey}
              onToggleInfo={handleToggleInfo}
            />

            <SliderRow
              metricKey="turnover_rate"
              label="Turnover Rate Diff (%)"
              value={turnoverRateDiff} min={-5} max={5} step={0.1}
              displayValue={`${sign(parseFloat(turnoverRateDiff.toFixed(1)))}%`}
              onChange={setTurnoverRateDiff}
              color="#38bdf8"
              activeInfoKey={activeInfoKey}
              onToggleInfo={handleToggleInfo}
            />

            <SliderRow
              metricKey="rest"
              label="Rest Advantage (Days)"
              value={restDiff} min={-7} max={7} step={1}
              displayValue={`${sign(restDiff)} days`}
              onChange={setRestDiff}
              color="var(--green)"
              activeInfoKey={activeInfoKey}
              onToggleInfo={handleToggleInfo}
            />
          </div>
        </div>

        {/* Right: Outcome */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="glass-panel" style={{ padding: '24px 26px' }}>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '1px',
              textTransform: 'uppercase', color: 'var(--text-3)',
              marginBottom: 20, textAlign: 'center',
            }}>
              Simulated Outcome
            </div>

            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Team vs Team */}
                <div style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                  {/* Away */}
                  <div style={{ textAlign: 'center' }}>
                    <TeamBadge abbr={awayTeam} size={52} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 10 }}>{awayTeam}</div>
                    <div className="font-mono-num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--teal-bright)', marginTop: 4 }}>
                      {result.away_win_probability}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)' }}>
                    <ArrowRight size={16} />
                  </div>

                  {/* Home */}
                  <div style={{ textAlign: 'center' }}>
                    <TeamBadge abbr={homeTeam} size={52} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 10 }}>{homeTeam}</div>
                    <div className="font-mono-num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>
                      {result.home_win_probability}%
                    </div>
                  </div>
                </div>

                {/* Winner Box */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(20,184,166,0.06))',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--teal-bright)', marginBottom: 8 }}>
                    Simulated Winner
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                    <Sparkles size={18} color="var(--green)" className="sparkle-icon" />
                    <span className="font-mono-num" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)' }}>
                      {result.predicted_winner}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>
                    {result.confidence}% confidence
                  </div>
                </div>

                {/* Prob Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="prob-label away">{awayTeam} {result.away_win_probability}%</span>
                    <span className="prob-label home">{result.home_win_probability}% {homeTeam}</span>
                  </div>
                  <div className="prob-bar">
                    <div className="prob-bar-segment away" style={{ width: `${result.away_win_probability}%` }} />
                    <div className="prob-bar-segment home" style={{ width: `${result.home_win_probability}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 13 }}>Simulating outcome…</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
