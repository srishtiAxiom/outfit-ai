// frontend/src/components/TrendAnalysis.js
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'https://outfit-ai-9snk.onrender.com';

// ─── Inline Styles (no external CSS dependency) ───────────────────────────────
const S = {
  container: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: 'linear-gradient(135deg, #0f0c1a 0%, #1a1025 50%, #0d1117 100%)',
    border: '1px solid rgba(180,140,255,0.15)',
    borderRadius: '16px',
    padding: '28px',
    marginTop: '28px',
    color: '#e8e0f0',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(160,80,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  titleIcon: {
    fontSize: '22px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '0.02em',
    background: 'linear-gradient(90deg, #c084fc, #e879f9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: 'rgba(200,180,220,0.5)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  refreshBtn: {
    background: 'rgba(160,80,255,0.1)',
    border: '1px solid rgba(160,80,255,0.3)',
    color: '#c084fc',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    fontFamily: 'monospace',
  },
  loadingWrap: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(160,80,255,0.15)',
    borderTop: '3px solid #c084fc',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    color: 'rgba(200,180,220,0.6)',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  errorBox: {
    background: 'rgba(255,80,80,0.08)',
    border: '1px solid rgba(255,80,80,0.2)',
    borderRadius: '10px',
    padding: '16px',
    color: '#fca5a5',
    fontSize: '14px',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '11px',
    fontFamily: 'monospace',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(200,180,220,0.45)',
    marginBottom: '14px',
    marginTop: '0',
  },
  section: {
    marginBottom: '28px',
  },
  // Aesthetics grid
  aestheticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '14px',
  },
  aestheticCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(180,140,255,0.12)',
    borderRadius: '12px',
    padding: '16px',
    position: 'relative',
    transition: 'border-color 0.2s',
  },
  aestheticName: {
    fontWeight: '600',
    fontSize: '15px',
    marginBottom: '4px',
    color: '#e8e0f0',
  },
  popularityBadge: (pop) => ({
    display: 'inline-block',
    fontSize: '10px',
    fontFamily: 'monospace',
    letterSpacing: '0.08em',
    padding: '2px 8px',
    borderRadius: '999px',
    marginBottom: '8px',
    background:
      pop === 'hot'
        ? 'rgba(239,68,68,0.15)'
        : pop === 'rising'
        ? 'rgba(234,179,8,0.15)'
        : 'rgba(34,197,94,0.12)',
    color:
      pop === 'hot' ? '#f87171' : pop === 'rising' ? '#fbbf24' : '#4ade80',
    border: `1px solid ${
      pop === 'hot'
        ? 'rgba(239,68,68,0.25)'
        : pop === 'rising'
        ? 'rgba(234,179,8,0.25)'
        : 'rgba(34,197,94,0.2)'
    }`,
  }),
  aestheticDesc: {
    fontSize: '13px',
    color: 'rgba(200,180,220,0.7)',
    lineHeight: '1.5',
    marginBottom: '10px',
  },
  keyPiecesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  keyPiece: {
    fontSize: '11px',
    background: 'rgba(160,80,255,0.1)',
    border: '1px solid rgba(160,80,255,0.2)',
    borderRadius: '5px',
    padding: '2px 7px',
    color: '#c084fc',
    fontFamily: 'monospace',
  },
  // Wardrobe matches
  matchCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(180,140,255,0.1)',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '10px',
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  matchTrend: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e879f9',
    marginBottom: '4px',
  },
  matchItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginBottom: '6px',
  },
  matchItem: {
    fontSize: '11px',
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: '5px',
    padding: '2px 7px',
    color: '#4ade80',
    fontFamily: 'monospace',
  },
  matchSuggestion: {
    fontSize: '12px',
    color: 'rgba(200,180,220,0.65)',
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
  noMatch: {
    fontSize: '13px',
    color: 'rgba(200,180,220,0.4)',
    textAlign: 'center',
    padding: '16px',
    fontStyle: 'italic',
  },
  // Shopping gaps
  gapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  gapCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(180,140,255,0.1)',
    borderRadius: '10px',
    padding: '14px',
  },
  gapItem: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#e8e0f0',
    marginBottom: '4px',
  },
  gapReason: {
    fontSize: '12px',
    color: 'rgba(200,180,220,0.6)',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  gapFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gapPrice: {
    fontSize: '13px',
    color: '#c084fc',
    fontFamily: 'monospace',
  },
  priorityBadge: (p) => ({
    fontSize: '10px',
    fontFamily: 'monospace',
    padding: '2px 7px',
    borderRadius: '999px',
    background:
      p === 'high'
        ? 'rgba(239,68,68,0.12)'
        : p === 'medium'
        ? 'rgba(234,179,8,0.1)'
        : 'rgba(100,100,120,0.15)',
    color: p === 'high' ? '#f87171' : p === 'medium' ? '#fbbf24' : '#94a3b8',
    border: `1px solid ${
      p === 'high'
        ? 'rgba(239,68,68,0.2)'
        : p === 'medium'
        ? 'rgba(234,179,8,0.2)'
        : 'rgba(100,100,120,0.2)'
    }`,
  }),
  // Trend outfit image
  outfitImageWrap: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(180,140,255,0.15)',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitImage: {
    width: '100%',
    maxHeight: '340px',
    objectFit: 'cover',
    display: 'block',
    borderRadius: '12px',
  },
  imageLoadingText: {
    color: 'rgba(200,180,220,0.4)',
    fontSize: '13px',
    fontFamily: 'monospace',
    padding: '20px',
    textAlign: 'center',
  },
  cachedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontFamily: 'monospace',
    color: 'rgba(200,180,220,0.35)',
    marginTop: '2px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid rgba(180,140,255,0.08)',
    margin: '24px 0',
  },
};

// ─── Spinnerfix (keyframes injected once) ────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('ta-spin-style')) {
  const style = document.createElement('style');
  style.id = 'ta-spin-style';
  style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

// ─── Build Pollinations URL from prompt ──────────────────────────────────────
function buildPollinationsUrl(prompt) {
  const encoded = encodeURIComponent(prompt + ', fashion editorial, high quality photograph');
  return `https://image.pollinations.ai/prompt/${encoded}?width=600&height=400&nologo=true`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrendAnalysis({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const fetchTrends = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      setImageLoaded(false);

      try {
        const endpoint = forceRefresh ? '/api/trends/refresh' : '/api/trends';
        const method = forceRefresh ? 'POST' : 'GET';

        const res = await fetch(`${API_BASE}${endpoint}`, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error ${res.status}`);
        }

        const json = await res.json();
        setData(json.data);
        setIsCached(json.cached || false);
      } catch (e) {
        setError(e.message || 'Failed to load trend data');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // ── Render ──
  return (
    <div style={S.container}>
      <div style={S.bgGlow} />

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.titleRow}>
            <span style={S.titleIcon}>✦</span>
            <h2 style={S.title}>Trend Analysis</h2>
          </div>
          <p style={S.subtitle}>
            Live fashion intelligence
            {isCached && (
              <span style={S.cachedBadge}>
                &nbsp;· ⚡ cached
              </span>
            )}
          </p>
        </div>

        <button
          style={S.refreshBtn}
          onClick={() => fetchTrends(true)}
          disabled={loading}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(160,80,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(160,80,255,0.1)';
          }}
        >
          {loading ? '⏳' : '↻'} {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={S.loadingWrap}>
          <div style={S.spinner} />
          <p style={S.loadingText}>Scanning fashion trends across the web...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={S.errorBox}>
          ⚠ {error}
          <br />
          <button
            style={{ ...S.refreshBtn, margin: '12px auto 0', display: 'inline-flex' }}
            onClick={() => fetchTrends()}
          >
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && data && (
        <>
          {/* Trending Aesthetics */}
          {data.trendingAesthetics?.length > 0 && (
            <div style={S.section}>
              <p style={S.sectionTitle}>🔥 Trending aesthetics</p>
              <div style={S.aestheticsGrid}>
                {data.trendingAesthetics.map((a, i) => (
                  <div key={i} style={S.aestheticCard}>
                    <div style={S.aestheticName}>{a.name}</div>
                    <div style={S.popularityBadge(a.popularity)}>
                      {a.popularity === 'hot' ? '🔥' : a.popularity === 'rising' ? '📈' : '✓'}{' '}
                      {a.popularity}
                    </div>
                    <p style={S.aestheticDesc}>{a.description}</p>
                    <div style={S.keyPiecesWrap}>
                      {a.keyPieces?.map((piece, j) => (
                        <span key={j} style={S.keyPiece}>
                          {piece}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr style={S.divider} />

          {/* Wardrobe Matches */}
          <div style={S.section}>
            <p style={S.sectionTitle}>👗 Your wardrobe × current trends</p>
            {data.wardrobeMatches?.length > 0 ? (
              data.wardrobeMatches.map((m, i) => (
                <div key={i} style={S.matchCard}>
                  <div style={{ flex: 1 }}>
                    <div style={S.matchTrend}>{m.trend}</div>
                    <div style={S.matchItems}>
                      {m.matchingItems?.map((item, j) => (
                        <span key={j} style={S.matchItem}>
                          {item}
                        </span>
                      ))}
                    </div>
                    <div style={S.matchSuggestion}>{m.outfitSuggestion}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={S.noMatch}>
                Add some clothes to your wardrobe to see trend matches!
              </div>
            )}
          </div>

          <hr style={S.divider} />

          {/* Shopping Gaps */}
          {data.shoppingGaps?.length > 0 && (
            <div style={S.section}>
              <p style={S.sectionTitle}>🛍️ What to buy next</p>
              <div style={S.gapGrid}>
                {data.shoppingGaps.map((g, i) => (
                  <div key={i} style={S.gapCard}>
                    <div style={S.gapItem}>{g.item}</div>
                    <div style={S.gapReason}>{g.reason}</div>
                    <div style={S.gapFooter}>
                      <span style={S.gapPrice}>{g.estimatedPrice}</span>
                      <span style={S.priorityBadge(g.priority)}>{g.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trend Outfit Image */}
          {data.trendOutfitPrompt && (
            <>
              <hr style={S.divider} />
              <div style={S.section}>
                <p style={S.sectionTitle}>✦ AI trend outfit preview</p>
                <div style={S.outfitImageWrap}>
                  {!imageLoaded && (
                    <div style={S.imageLoadingText}>
                      Generating trend outfit visual...
                    </div>
                  )}
                  <img
                    src={buildPollinationsUrl(data.trendOutfitPrompt)}
                    alt="AI trend outfit"
                    style={{ ...S.outfitImage, display: imageLoaded ? 'block' : 'none' }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}