'use client';

import { t, fontBody } from '../tokens';

const CATEGORIES = [
  'Trending', 'Elections', 'Politics', 'Sports', 'Culture',
  'Commodities', 'Climate', 'Economics', 'Mentions', 'Finance', 'Tech & Science',
];

interface CategoryBarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export default function CategoryBar({ activeCategory, setActiveCategory }: CategoryBarProps) {
  return (
    <div style={{
      position: 'sticky',
      top: 57,   /* height of the navbar */
      zIndex: 40,
      background: t.bg,
      borderBottom: `1px solid ${t.lineSoft}`,
    }}>
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 24px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        fontFamily: fontBody,
      }}>
        {CATEGORIES.map(cat => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: 20,
                border: `1px solid ${isActive ? t.text : t.line}`,
                background: isActive ? t.text : 'transparent',
                color: isActive ? '#0A0C10' : t.textDim,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: fontBody,
                transition: 'border-color .15s, color .15s, background .15s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#38404F';
                  (e.currentTarget as HTMLElement).style.color = t.text;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = t.line;
                  (e.currentTarget as HTMLElement).style.color = t.textDim;
                }
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
