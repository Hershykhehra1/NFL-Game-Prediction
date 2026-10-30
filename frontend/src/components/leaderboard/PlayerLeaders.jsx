import React, { useState, useEffect, useMemo } from 'react';
import { getPlayerLeaders } from '../../services/api';
import {
  getRankBadge,
  PlayerLeadersHeader,
  PassingLeadersCard,
  RushingLeadersCard,
  ReceivingLeadersCard,
  TackleLeadersCard,
  SackLeadersCard,
  DetailedPassingView,
  DetailedRushingView,
  DetailedReceivingView,
  DetailedTacklesView,
  DetailedSacksView,
} from './playerLeaders/index.js';

export const PlayerLeaders = ({ season, initialLeaders }) => {
  const [defaultLeaders, setDefaultLeaders] = useState(initialLeaders || null);
  const [searchResults, setSearchResults]   = useState(null);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'passing' | 'rushing' | 'receiving' | 'tackles' | 'sacks'
  const [displayLimit, setDisplayLimit]     = useState(10); // 5 | 10
  const [searchQuery, setSearchQuery]       = useState('');
  const [isLoading, setIsLoading]           = useState(!initialLeaders);
  const [isSearching, setIsSearching]       = useState(false);

  // Sync or fetch default leaders when season changes
  useEffect(() => {
    if (initialLeaders && initialLeaders.season === season) {
      setDefaultLeaders(initialLeaders);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    getPlayerLeaders(season, 15)
      .then((res) => {
        if (isMounted) {
          setDefaultLeaders(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load player leaders:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [season, initialLeaders]);

  // Server-side search across ALL players in NFL database
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    const timer = setTimeout(() => {
      getPlayerLeaders(season, 25, q)
        .then((res) => {
          if (isMounted) {
            setSearchResults(res);
            setIsSearching(false);
          }
        })
        .catch((err) => {
          console.error('Player search error:', err);
          if (isMounted) setIsSearching(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, season]);

  const isSearchActive = !!searchQuery.trim();
  const currentData = isSearchActive ? searchResults : defaultLeaders;

  const rawPassing   = currentData?.passing || [];
  const rawRushing   = currentData?.rushing || [];
  const rawReceiving = currentData?.receiving || [];
  const rawTackles   = currentData?.tackles || [];
  const rawSacks     = currentData?.sacks || [];

  // If searching: display all matching players (up to 25).
  // If not searching: respect displayLimit (top 5 or top 10).
  const displayedPassing = useMemo(() => {
    return isSearchActive ? rawPassing : rawPassing.slice(0, displayLimit);
  }, [rawPassing, isSearchActive, displayLimit]);

  const displayedRushing = useMemo(() => {
    return isSearchActive ? rawRushing : rawRushing.slice(0, displayLimit);
  }, [rawRushing, isSearchActive, displayLimit]);

  const displayedReceiving = useMemo(() => {
    return isSearchActive ? rawReceiving : rawReceiving.slice(0, displayLimit);
  }, [rawReceiving, isSearchActive, displayLimit]);

  const displayedTackles = useMemo(() => {
    return isSearchActive ? rawTackles : rawTackles.slice(0, displayLimit);
  }, [rawTackles, isSearchActive, displayLimit]);

  const displayedSacks = useMemo(() => {
    return isSearchActive ? rawSacks : rawSacks.slice(0, displayLimit);
  }, [rawSacks, isSearchActive, displayLimit]);

  return (
    <div style={{ marginTop: 40 }}>
      {/* ── Section Title, Search & Filter Controls ───────────────────────── */}
      <PlayerLeadersHeader
        season={season}
        isSearchActive={isSearchActive}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        displayLimit={displayLimit}
        setDisplayLimit={setDisplayLimit}
      />

      {/* Loading state on initial mount */}
      {isLoading && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px' }} />
          <div className="skeleton" style={{ width: 220, height: 18, margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ width: 320, height: 12, margin: '0 auto' }} />
        </div>
      )}

      {/* ── All Categories Grid Overview ─────────────────────────────── */}
      {!isLoading && activeCategory === 'all' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20,
        }}>
          {/* Card 1: Passing Yards Leaders */}
          <PassingLeadersCard 
            players={displayedPassing} 
            getRankBadge={getRankBadge}
            isSearchActive={isSearchActive}
            searchQuery={searchQuery}
            season={season}
            onViewMore={() => setActiveCategory('passing')}
          />

          {/* Card 2: Rushing Yards Leaders */}
          <RushingLeadersCard 
            players={displayedRushing} 
            getRankBadge={getRankBadge}
            isSearchActive={isSearchActive}
            searchQuery={searchQuery}
            season={season}
            onViewMore={() => setActiveCategory('rushing')}
          />

          {/* Card 3: Receiving Yards Leaders */}
          <ReceivingLeadersCard 
            players={displayedReceiving} 
            getRankBadge={getRankBadge}
            isSearchActive={isSearchActive}
            searchQuery={searchQuery}
            season={season}
            onViewMore={() => setActiveCategory('receiving')}
          />

          {/* Card 4: NFL Tackle Leaders */}
          <TackleLeadersCard 
            players={displayedTackles} 
            getRankBadge={getRankBadge}
            isSearchActive={isSearchActive}
            searchQuery={searchQuery}
            season={season}
            onViewMore={() => setActiveCategory('tackles')}
          />

          {/* Card 5: NFL Sack Leaders */}
          <SackLeadersCard 
            players={displayedSacks} 
            getRankBadge={getRankBadge}
            isSearchActive={isSearchActive}
            searchQuery={searchQuery}
            season={season}
            onViewMore={() => setActiveCategory('sacks')}
          />
        </div>
      )}

      {/* ── Single Category Deep Dive: Passing ───────────────────────── */}
      {!isLoading && activeCategory === 'passing' && (
        <DetailedPassingView 
          players={displayedPassing} 
          getRankBadge={getRankBadge}
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          season={season}
        />
      )}

      {/* ── Single Category Deep Dive: Rushing ───────────────────────── */}
      {!isLoading && activeCategory === 'rushing' && (
        <DetailedRushingView 
          players={displayedRushing} 
          getRankBadge={getRankBadge}
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          season={season}
        />
      )}

      {/* ── Single Category Deep Dive: Receiving ─────────────────────── */}
      {!isLoading && activeCategory === 'receiving' && (
        <DetailedReceivingView 
          players={displayedReceiving} 
          getRankBadge={getRankBadge}
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          season={season}
        />
      )}

      {/* ── Single Category Deep Dive: Tackles ───────────────────────── */}
      {!isLoading && activeCategory === 'tackles' && (
        <DetailedTacklesView 
          players={displayedTackles} 
          getRankBadge={getRankBadge}
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          season={season}
        />
      )}

      {/* ── Single Category Deep Dive: Sacks ─────────────────────────── */}
      {!isLoading && activeCategory === 'sacks' && (
        <DetailedSacksView 
          players={displayedSacks} 
          getRankBadge={getRankBadge}
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          season={season}
        />
      )}
    </div>
  );
};

export default PlayerLeaders;
