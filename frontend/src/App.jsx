import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MatchupGrid } from './components/MatchupGrid';
import { ModelAnalytics } from './components/ModelAnalytics';
import { MatchupSandbox } from './components/MatchupSandbox';
import { TeamLeaderboard } from './components/TeamLeaderboard';
import { AlertCircle, RefreshCw, Cpu } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export function App() {
  const [season, setSeason]           = useState(2026);
  const [week, setWeek]               = useState(1);
  const [weeksList, setWeeksList]     = useState(Array.from({ length: 18 }, (_, i) => i + 1));
  const [availableSeasons, setAvailableSeasons] = useState([2026, 2025, 2024]);
  const [activeTab, setActiveTab]     = useState('matchups');

  const [games, setGames]             = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError]     = useState(null);

  /* ── Backend Status Poll ──────────────────────── */
  const checkStatus = () => {
    fetch(`${API_URL}/api/status`)
      .then((r) => r.json())
      .then((status) => {
        if (status.is_loaded) {
          setIsInitializing(false);
          setInitError(null);
          fetchWeeks(season);
          fetchPredictions(season, week);
        } else if (status.error) {
          setIsInitializing(false);
          setInitError(status.error);
        } else {
          setTimeout(checkStatus, 3000);
        }
      })
      .catch(() => setTimeout(checkStatus, 3000));
  };

  const fetchWeeks = (s) => {
    fetch(`${API_URL}/api/weeks?season=${s}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.weeks?.length > 0) setWeeksList(data.weeks);
        if (data.available_seasons)  setAvailableSeasons(data.available_seasons);
      })
      .catch(console.error);
  };

  const fetchPredictions = (s, w) => {
    setIsLoading(true);
    fetch(`${API_URL}/api/predictions?season=${s}&week=${w}`)
      .then((r) => r.json())
      .then((data) => { setGames(data.games || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { checkStatus(); }, []);

  useEffect(() => {
    if (!isInitializing) {
      fetchWeeks(season);
      fetchPredictions(season, week);
    }
  }, [season, week]);

  const handleRefresh = () => {
    setIsLoading(true);
    fetch(`${API_URL}/api/refresh`, { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        // Allow brief moment for pipeline to refresh or fetch current state
        setTimeout(() => fetchPredictions(season, week), 600);
      });
  };

  /* ── Render ───────────────────────────────────── */
  return (
    <div className="app-shell">
      <Header
        season={season}
        setSeason={setSeason}
        availableSeasons={availableSeasons}
        week={week}
        setWeek={setWeek}
        weeks={weeksList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoaded={!isInitializing}
        isRefreshing={isLoading}
        onRefresh={handleRefresh}
      />

      {/* ── Main Content ──────────────────────────── */}
      {isInitializing ? (
        <div
          className="glass-panel"
          style={{
            padding: '80px 40px',
            textAlign: 'center',
            maxWidth: 560,
            margin: '48px auto',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Cpu size={28} color="var(--green)" className="animate-spin-slow" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>
            Initializing Forecast Engine
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 24px' }}>
            Building leakage-free pregame features and calibrating model ensembles in the background.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: 'var(--teal-bright)', fontWeight: 600 }}>
            <RefreshCw size={14} className="animate-spin" />
            Loading nflreadpy schedules &amp; feature pipeline…
          </div>
        </div>
      ) : initError ? (
        <div
          className="glass-panel"
          style={{
            padding: '56px 40px',
            textAlign: 'center',
            maxWidth: 480,
            margin: '48px auto',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertCircle size={40} color="#f87171" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
            Backend Error
          </h2>
          <p style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 10, fontFamily: 'monospace', marginBottom: 24 }}>
            {initError}
          </p>
          <button onClick={checkStatus} className="btn-primary">
            Retry Initialization
          </button>
        </div>
      ) : (
        <main>
          {activeTab === 'matchups'  && <MatchupGrid games={games} isLoading={isLoading} />}
          {activeTab === 'analytics' && <ModelAnalytics apiUrl={API_URL} />}
          {activeTab === 'sandbox'   && <MatchupSandbox apiUrl={API_URL} />}
          {activeTab === 'teams'     && <TeamLeaderboard apiUrl={API_URL} />}
        </main>
      )}

      {/* ── Footer ────────────────────────────────── */}
      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-3)',
        }}
      >
        Gamelytics NFL Predictor &mdash; Leakage-Free Scikit-Learn Ensemble
      </footer>
    </div>
  );
}

export default App;
