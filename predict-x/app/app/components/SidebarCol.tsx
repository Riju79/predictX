'use client';

import { t, fontBody, fontDisplay, fontMono } from '../tokens';

const CAT_ROWS = [
  { ic: '🔥', lbl: 'Trending',  stat: '$18.2M vol' },
  { ic: '🗳️', lbl: 'Elections', stat: '$9.4M vol'  },
  { ic: '⚽', lbl: 'Sports',    stat: '$12.7M vol' },
  { ic: '₿',  lbl: 'Crypto',    stat: '$21.5M vol' },
  { ic: '🌍', lbl: 'Climate',   stat: '$1.8M vol'  },
  { ic: '💹', lbl: 'Economics', stat: '$6.3M vol'  },
];

interface SidebarColProps {
  setActiveCategory: (cat: string) => void;
  setActiveRoute: (route: 'markets' | 'perps' | 'live' | 'market-detail') => void;
}

export default function SidebarCol({ setActiveCategory, setActiveRoute }: SidebarColProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Promo banners ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Promo 1 — Perps */}
        <div style={{
          borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden',
          border: `1px solid ${t.line}`,
          background: 'linear-gradient(135deg,#1B2340,#0F1220)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          minHeight: 80,
        }}>
          <div>
            <div style={{
              fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: t.textFaint, fontFamily: fontBody,
            }}>New</div>
            <h4 style={{
              margin: '4px 0 0', fontFamily: fontDisplay,
              fontSize: '15.5px', fontWeight: 600, color: t.text,
            }}>Perpetual markets are live</h4>
          </div>
          <div 
            onClick={() => setActiveRoute('perps')}
            style={{
              fontSize: 12, fontWeight: 700, color: t.accent,
              marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
              fontFamily: fontBody, cursor: 'pointer',
            }}
          >
            Trade perps →
          </div>
        </div>

        {/* Promo 2 — Referral */}
        <div style={{
          borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden',
          border: `1px solid ${t.line}`,
          background: 'linear-gradient(135deg,#20140F,#12100F)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          minHeight: 80,
        }}>
          <div>
            <div style={{
              fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: t.textFaint, fontFamily: fontBody,
            }}>Refer &amp; earn</div>
            <h4 style={{
              margin: '4px 0 0', fontFamily: fontDisplay,
              fontSize: '15.5px', fontWeight: 600, color: t.text,
            }}>Get $20 for every friend who trades</h4>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: t.accent,
            marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: fontBody, cursor: 'pointer',
          }}>
            Invite friends →
          </div>
        </div>
      </div>

      {/* ── Trending Categories ── */}
      <div style={{
        flex: 1,
        background: t.surface, border: `1px solid ${t.line}`,
        borderRadius: 14, padding: 14,
        display: 'flex', flexDirection: 'column', gap: 2,
        overflow: 'hidden',
      }}>
        {/* title row */}
        <div style={{
          fontFamily: fontDisplay, fontSize: 14, fontWeight: 600,
          marginBottom: 8, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', color: t.text,
        }}>
          Trending Categories
          <span 
            onClick={() => setActiveCategory('Trending')}
            style={{ fontSize: 11, color: t.textFaint, fontWeight: 600, cursor: 'pointer', fontFamily: fontBody }}
          >
            See all
          </span>
        </div>

        {/* category rows */}
        {CAT_ROWS.map((cat, i) => (
          <div
            key={i}
            onClick={() => setActiveCategory(cat.lbl)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 6px', borderRadius: 8,
              borderBottom: i < CAT_ROWS.length - 1 ? `1px solid ${t.lineSoft}` : 'none',
              cursor: 'pointer', transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.surface2}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{cat.ic}</span>
            <span style={{ fontSize: '12.5px', fontWeight: 700, flex: 1, color: t.text, fontFamily: fontBody }}>
              {cat.lbl}
            </span>
            <span style={{
              fontSize: '10.5px', color: t.textFaint,
              fontFamily: fontMono, whiteSpace: 'nowrap',
            }}>
              {cat.stat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
