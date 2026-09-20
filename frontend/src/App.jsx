import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { MatchupGrid } from './components/matchups/MatchupGrid';
import { ModelAnalytics } from './components/analytics/ModelAnalytics';
import { MatchupSandbox } from './components/sandbox/MatchupSandbox';
import { TeamLeaderboard } from './components/analytics/TeamLeaderboard';
import { AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import { getStatus, getWeeks, getPredictions, triggerRefresh } from './services/api';

export function App() {
  const [season, setSeason]           = useState(2024);
  const [week, setWeek]               = useState(1);
  const [weeksList, setWeeksList]     = useState(Array.from({ length: 18 }, (_, i) => i + 1));
  const [availableSeasons, setAvailableSeasons] = useState([2024, 2023, 2022, 2021]);
  const [activeTab, setActiveTab]     = useState('matchups');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [games, setGames]             = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError]     = useState(null);

  /* ── Backend Status Poll ──────────────────────── */
  const checkStatus = () => {
    getStatus()
      .then((status) => {
        if (status.is_loaded) {
          setIsInitializing(false);
          setInitError(null);
          if (status.last_updated) setLastUpdated(status.last_updated);
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
    getWeeks(s)
      .then((data) => {
        if (data.weeks?.length > 0) setWeeksList(data.weeks);
        if (data.available_seasons)  setAvailableSeasons(data.available_seasons);
      })
      .catch(console.error);
  };

  const fetchPredictions = (s, w) => {
    setIsLoading(true);
    getPredictions(s, w)
      .then((data) => {
        setGames(data.games || []);
        if (data.last_updated) setLastUpdated(data.last_updated);
        setIsLoading(false);
      })
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
    triggerRefresh()
      .catch(() => {})
      .finally(() => {
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
        lastUpdated={lastUpdated}
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
          {activeTab === 'analytics' && <ModelAnalytics />}
          {activeTab === 'sandbox'   && <MatchupSandbox />}
          {activeTab === 'teams'     && <TeamLeaderboard />}
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
