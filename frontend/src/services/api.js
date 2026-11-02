/**
 * Centralized API communication layer for the Gamelytics NFL Predictor.
 * All fetch calls are routed through here for a single source of truth.
 */

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Check backend initialization status */
export const getStatus = () => apiFetch('/api/status');

/** Fetch available weeks/seasons for a given season */
export const getWeeks = (season) => apiFetch(`/api/weeks?season=${season}`);

/** Fetch matchup predictions for a given season + week */
export const getPredictions = (season, week) =>
  apiFetch(`/api/predictions?season=${season}&week=${week}`);

/** Trigger a live data refresh */
export const triggerRefresh = () => apiFetch('/api/refresh', { method: 'POST' });

/** Fetch model performance metrics */
export const getModelPerformance = () => apiFetch('/api/model-performance');

/** Fetch power rankings */
export const getPowerRankings = () => apiFetch('/api/power-rankings');

/** Fetch all teams */
export const getTeams = () => apiFetch('/api/teams');

/** Fetch per-player box score for a completed game */
export const getBoxscore = (gameId) => apiFetch(`/api/boxscore/${encodeURIComponent(gameId)}`);

/** Fetch NFL team standings and leaderboard */
export const getStandings = (season) =>
  apiFetch(`/api/standings${season ? `?season=${season}` : ''}`);

/** Fetch NFL individual player statistical leaders with optional search query */
export const getPlayerLeaders = (season, limit = 10, search = '') => {
  const params = new URLSearchParams();
  if (season) params.set('season', season);
  if (limit) params.set('limit', limit);
  if (search && search.trim()) params.set('search', search.trim());
  return apiFetch(`/api/player-leaders?${params.toString()}`);
};

export { API_URL };


