import React from 'react';

/**
 * Returns NFL team branding metadata (colors, full name, SVG logo component).
 */
export const TEAM_INFO = {
  ARI: { name: 'Arizona Cardinals', city: 'Arizona', primary: '#97233F', secondary: '#FFB612' },
  ATL: { name: 'Atlanta Falcons', city: 'Atlanta', primary: '#A71930', secondary: '#000000' },
  BAL: { name: 'Baltimore Ravens', city: 'Baltimore', primary: '#241773', secondary: '#9E7C0C' },
  BUF: { name: 'Buffalo Bills', city: 'Buffalo', primary: '#00338D', secondary: '#C60C30' },
  CAR: { name: 'Carolina Panthers', city: 'Carolina', primary: '#0085CA', secondary: '#101820' },
  CHI: { name: 'Chicago Bears', city: 'Chicago', primary: '#0B162A', secondary: '#C83803' },
  CIN: { name: 'Cincinnati Bengals', city: 'Cincinnati', primary: '#FB4F14', secondary: '#000000' },
  CLE: { name: 'Cleveland Browns', city: 'Cleveland', primary: '#311D00', secondary: '#FF3C00' },
  DAL: { name: 'Dallas Cowboys', city: 'Dallas', primary: '#003594', secondary: '#869397' },
  DEN: { name: 'Denver Broncos', city: 'Denver', primary: '#FB4F14', secondary: '#002244' },
  DET: { name: 'Detroit Lions', city: 'Detroit', primary: '#0076B6', secondary: '#B0B7BC' },
  GB:  { name: 'Green Bay Packers', city: 'Green Bay', primary: '#203731', secondary: '#FFB612' },
  HOU: { name: 'Houston Texans', city: 'Houston', primary: '#03202F', secondary: '#A71930' },
  IND: { name: 'Indianapolis Colts', city: 'Indianapolis', primary: '#002C5F', secondary: '#A2AAAD' },
  JAX: { name: 'Jacksonville Jaguars', city: 'Jacksonville', primary: '#006778', secondary: '#D7A22A' },
  KC:  { name: 'Kansas City Chiefs', city: 'Kansas City', primary: '#E31837', secondary: '#FFB612' },
  LV:  { name: 'Las Vegas Raiders', city: 'Las Vegas', primary: '#000000', secondary: '#A5ACAF' },
  LAC: { name: 'Los Angeles Chargers', city: 'Los Angeles', primary: '#0080C6', secondary: '#FFC20E' },
  LA:  { name: 'Los Angeles Rams', city: 'Los Angeles', primary: '#003594', secondary: '#FFA300' },
  LAR: { name: 'Los Angeles Rams', city: 'Los Angeles', primary: '#003594', secondary: '#FFA300' },
  MIA: { name: 'Miami Dolphins', city: 'Miami', primary: '#008E97', secondary: '#FC4C02' },
  MIN: { name: 'Minnesota Vikings', city: 'Minnesota', primary: '#4F2683', secondary: '#FFC62F' },
  NE:  { name: 'New England Patriots', city: 'New England', primary: '#002244', secondary: '#C60C30' },
  NO:  { name: 'New Orleans Saints', city: 'New Orleans', primary: '#D3BC8D', secondary: '#101820' },
  NYG: { name: 'New York Giants', city: 'New York', primary: '#0B2265', secondary: '#A71930' },
  NYJ: { name: 'New York Jets', city: 'New York', primary: '#125740', secondary: '#000000' },
  PHI: { name: 'Philadelphia Eagles', city: 'Philadelphia', primary: '#004C54', secondary: '#A5ACAF' },
  PIT: { name: 'Pittsburgh Steelers', city: 'Pittsburgh', primary: '#101820', secondary: '#FFB612' },
  SF:  { name: 'San Francisco 49ers', city: 'San Francisco', primary: '#AA0000', secondary: '#B3995D' },
  SEA: { name: 'Seattle Seahawks', city: 'Seattle', primary: '#002244', secondary: '#69BE28' },
  TB:  { name: 'Tampa Bay Buccaneers', city: 'Tampa Bay', primary: '#D50A0A', secondary: '#FF7900' },
  TEN: { name: 'Tennessee Titans', city: 'Tennessee', primary: '#0C2340', secondary: '#4B92DB' },
  WAS: { name: 'Washington Commanders', city: 'Washington', primary: '#5A1414', secondary: '#FFB612' }
};

export const TeamBadge = ({ abbr, size = 42 }) => {
  const info = TEAM_INFO[abbr] || { primary: '#374151', secondary: '#9ca3af' };
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${info.primary} 0%, ${info.secondary || info.primary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: '800',
        fontSize: size * 0.38,
        letterSpacing: '-0.5px',
        boxShadow: `0 4px 12px ${info.primary}44`,
        border: '2px solid rgba(255, 255, 255, 0.25)',
        flexShrink: 0
      }}
    >
      {abbr}
    </div>
  );
};
