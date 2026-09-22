import React, { useState, useEffect, useRef } from 'react';
import { getStatDefinition, GLOSSARY_CATEGORIES } from '../../utils/statDefinitions';
import { Info, X, HelpCircle, BookOpen, Search, Sparkles, ExternalLink } from 'lucide-react';

/**
 * Individual Interactive Column Header with Popover Info Bubble
 */
export const StatHeaderCell = ({
  col,
  category = '',
  activeKey,
  onToggle,
  onClose,
}) => {
  const isSelected = activeKey === `${category}:${col.key}` || activeKey === col.key;
  const def = getStatDefinition(col.key, category, col.label);
  const cellRef = useRef(null);
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isSelected) return;
    const handleOutsideClick = (e) => {
      if (
        cellRef.current && !cellRef.current.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, onClose]);

  const isPlain = col.key === 'name' || col.key === '_team';

  return (
    <th
      ref={cellRef}
      style={{
        position: 'relative',
        padding: '8px 10px',
        textAlign: col.align || 'right',
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        color: isSelected ? 'var(--teal-bright)' : 'var(--text-3)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(`${category}:${col.key}`);
        }}
        title={`Click for info on ${def.name || col.label}`}
        style={{
          background: isSelected ? 'rgba(20,184,166,0.18)' : 'transparent',
          border: isSelected ? '1px solid rgba(20,184,166,0.5)' : '1px solid transparent',
          borderRadius: 6,
          padding: '3px 6px',
          color: isSelected ? 'var(--teal-bright)' : 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          textTransform: 'inherit',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          transition: 'all 0.15s ease',
          outline: 'none',
          position: 'relative',
        }}
        className="stat-header-btn"
      >
        <span>{col.label}</span>
        {!isPlain && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: isSelected ? 'var(--teal-bright)' : 'rgba(255,255,255,0.08)',
              color: isSelected ? '#000' : 'var(--text-3)',
              fontSize: 8,
              fontWeight: 900,
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            i
          </span>
        )}
      </button>

      {/* Floating Info Bubble */}
      {isSelected && (
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          className="stat-info-bubble animate-scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [col.align === 'left' ? 'left' : 'right']: 0,
            width: 280,
            zIndex: 9999,
            background: 'linear-gradient(145deg, #111b27 0%, #0a111a 100%)',
            border: '1px solid rgba(20,184,166,0.4)',
            borderRadius: 12,
            boxShadow: '0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(20,184,166,0.15)',
            padding: '14px 16px',
            textAlign: 'left',
            textTransform: 'none',
            letterSpacing: 'normal',
            lineHeight: 1.45,
            cursor: 'default',
          }}
        >
          {/* Bubble Pointer Arrow */}
          <div
            style={{
              position: 'absolute',
              top: -6,
              [col.align === 'left' ? 'left' : 'right']: 16,
              width: 10,
              height: 10,
              background: '#111b27',
              borderLeft: '1px solid rgba(20,184,166,0.4)',
              borderTop: '1px solid rgba(20,184,166,0.4)',
              transform: 'rotate(45deg)',
            }}
          />

          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 7px',
                  borderRadius: 5,
                  background: 'rgba(20,184,166,0.18)',
                  color: 'var(--teal-bright)',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  fontFamily: 'Space Grotesk, monospace',
                }}
              >
                {def.abbr}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                {def.category}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-3)',
                padding: 0,
              }}
              className="hover:text-white"
            >
              <X size={11} />
            </button>
          </div>

          {/* Full Name */}
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
            {def.name}
          </div>

          {/* Plain English Description */}
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: def.formula ? 10 : 0, lineHeight: 1.5 }}>
            {def.description}
          </div>

          {/* Formula Card if available */}
          {def.formula && (
            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 10,
                color: 'var(--text-3)',
              }}
            >
              <span style={{ color: 'var(--teal-bright)', fontWeight: 700 }}>Calculation: </span>
              <span style={{ fontFamily: 'Space Grotesk, monospace', color: 'var(--text-2)' }}>{def.formula}</span>
            </div>
          )}
        </div>
      )}
    </th>
  );
};

/**
 * All-In-One Full Glossary Modal for exploring every stat abbreviation
 */
export const StatGlossaryModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 10000,
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 18,
          border: '1px solid rgba(20,184,166,0.3)',
          background: 'linear-gradient(145deg, #0e1724 0%, #080d14 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 30px rgba(20,184,166,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--teal-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={16} color="var(--teal-bright)" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>
                NFL Statistics &amp; Abbreviations Glossary
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                Comprehensive guide to abbreviations, formulas, and advanced metrics
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-3)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="search-box" style={{ width: '100%' }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search stat abbreviation, metric name, or formula (e.g. TGT, Sacks, EPA)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Glossary List */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          {GLOSSARY_CATEGORIES.map((cat) => {
            const filteredKeys = cat.keys.filter((k) => {
              const def = getStatDefinition(k.split(':')[1], k.split(':')[0]);
              if (!search.trim()) return true;
              const q = search.toLowerCase();
              return (
                def.abbr.toLowerCase().includes(q) ||
                def.name.toLowerCase().includes(q) ||
                def.description.toLowerCase().includes(q) ||
                (def.formula && def.formula.toLowerCase().includes(q))
              );
            });

            if (filteredKeys.length === 0) return null;

            return (
              <div key={cat.title} style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    color: cat.color,
                    marginBottom: 10,
                    paddingBottom: 4,
                    borderBottom: `1px solid ${cat.color}33`,
                  }}
                >
                  {cat.title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                  {filteredKeys.map((key) => {
                    const [category, colKey] = key.split(':');
                    const def = getStatDefinition(colKey, category);
                    return (
                      <div
                        key={key}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 10,
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 7px',
                                borderRadius: 5,
                                background: 'rgba(20,184,166,0.15)',
                                color: 'var(--teal-bright)',
                                fontSize: 11,
                                fontWeight: 800,
                                fontFamily: 'Space Grotesk, monospace',
                              }}
                            >
                              {def.abbr}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                              {def.name}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: def.formula ? 6 : 0 }}>
                          {def.description}
                        </div>
                        {def.formula && (
                          <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'Space Grotesk, monospace' }}>
                            <span style={{ color: 'var(--teal-bright)', fontWeight: 600 }}>Calculation: </span>
                            {def.formula}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
