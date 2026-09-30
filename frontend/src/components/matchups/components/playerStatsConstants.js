/**
 * Column definitions and row merging utilities for the Player Stats Tab.
 */

export const PASSING_COLS = [
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

export const RUSHING_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'carries', label: 'CAR' },
  { key: 'rushing_yards', label: 'YDS' },
  { key: 'avg_ypc', label: 'AVG' },
  { key: 'rushing_tds', label: 'TD' },
  { key: 'fumbles_lost', label: 'FL' },
  { key: 'rushing_epa', label: 'EPA' },
];

export const RECEIVING_COLS = [
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

export const DEFENSE_COLS = [
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

export const KICKING_COLS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'position', label: 'Pos', align: 'center' },
  { key: 'fg_made', label: 'FGM' },
  { key: 'fg_att', label: 'FGA' },
  { key: 'fg_pct', label: 'FG%' },
  { key: 'fg_long', label: 'LNG' },
  { key: 'pat_made', label: 'XPM' },
  { key: 'pat_att', label: 'XPA' },
];

export const PUNTING_COLS = [
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

export const RETURNS_COLS = [
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

export const mergeRows = (homeRows, awayRows, teamView, homeAbbr, awayAbbr) => {
  const tag = (rows, label, color) =>
    (rows || []).map((r) => ({ ...r, _team: label, _color: color }));

  if (teamView === homeAbbr) return tag(homeRows, homeAbbr, 'var(--green)');
  if (teamView === awayAbbr) return tag(awayRows, awayAbbr, 'var(--teal-bright)');
  // both: interleave with team tags
  const h = tag(homeRows, homeAbbr, 'var(--green)');
  const a = tag(awayRows, awayAbbr, 'var(--teal-bright)');
  return [...h, ...a];
};

export const buildCols = (baseCols, teamView, homeAbbr, awayAbbr) => {
  if (teamView !== 'both') return baseCols;
  return [
    { key: '_team', label: 'Team', align: 'center' },
    ...baseCols,
  ];
};
