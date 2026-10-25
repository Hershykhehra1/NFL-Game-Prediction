export const getRankBadge = (rank) => {
  if (rank === 1) {
    return {
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))',
      color: '#fbbf24',
      border: '1px solid rgba(245, 158, 11, 0.45)',
      glow: '0 0 12px rgba(245, 158, 11, 0.25)',
      label: '#1',
    };
  }
  if (rank === 2) {
    return {
      bg: 'linear-gradient(135deg, rgba(226, 232, 240, 0.18), rgba(148, 163, 184, 0.12))',
      color: '#e2e8f0',
      border: '1px solid rgba(203, 213, 225, 0.35)',
      glow: 'none',
      label: '#2',
    };
  }
  if (rank === 3) {
    return {
      bg: 'linear-gradient(135deg, rgba(180, 83, 9, 0.22), rgba(120, 53, 15, 0.15))',
      color: '#f97316',
      border: '1px solid rgba(249, 115, 22, 0.35)',
      glow: 'none',
      label: '#3',
    };
  }
  return {
    bg: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-3)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    glow: 'none',
    label: `#${rank}`,
  };
};
