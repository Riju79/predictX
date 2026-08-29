'use client';

import { useState, useEffect, useRef } from 'react';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';
import { Market } from './TradingDrawer';
import PolymarketCard from './card';

interface LogEntry {
  id: string;
  time: string;
  type: 'trade' | 'ledger' | 'system' | 'liquidation';
  text: string;
}

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  marketTag?: string;
}

interface LiveFeedProps {
  markets: Market[];
  onSelectMarket: (m: Market) => void;
}

const MOCK_CHAT_POOL = [
  { text: "Add Raphinha to Ballon d'Or market!", tag: "Ballon d'Or" },
  { text: "ADD RODRI to nominees list!", tag: "Ballon d'Or" },
  { text: "LeBron James to Cleveland at 38% is crazy value!", tag: "NBA" },
  { text: "BTC spot price oracle feed closed at green ledger tick!", tag: "Crypto" },
  { text: "Dune Part Three leads Best Picture predictions with 48%.", tag: "Academy Awards" },
  { text: "Gold Spot spot price cuts above $2,800/oz target rate.", tag: "Commodities" },
  { text: "Solana Spot ETF approval rates rise to 45% on SEC filings.", tag: "Finance" },
  { text: "Stellar Soroban contract fees are literally $0.0001 per trade!", tag: "Soroban DEX" },
];

const MOCK_USERNAMES = [
  "naidri", "bau7", "SorobanDev", "StellarWhale", "PolymarketSurfer", "MarginKing", "SatoshiSlayer", "StellarPioneer"
];

const AVATARS = ['⚽', '🐱', '👽', '🦊', '🦉', '🦁', '🤖', '🐸'];

export default function LiveFeed({ markets, onSelectMarket }: LiveFeedProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const logContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Keep internal log and chat scrollboxes updated without forcing main page viewport auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate real-time streaming comments & logs automatically
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Stream live comments automatically (Every 2.5s)
      const item = MOCK_CHAT_POOL[Math.floor(Math.random() * MOCK_CHAT_POOL.length)];
      const user = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setChats(prev => [...prev.slice(-30), {
        id: Math.random().toString(),
        user,
        avatar,
        text: item.text,
        time: timeStr,
        marketTag: item.tag
      }]);

      // 2. Stream live ledger logs
      if (Math.random() > 0.4) {
        const timeStrLog = new Date().toTimeString().split(' ')[0];
        const randomType = ['trade', 'ledger', 'system', 'liquidation'][Math.floor(Math.random() * 4)] as LogEntry['type'];
        let text = '';

        if (randomType === 'ledger') {
          text = `Stellar Ledger #${Math.floor(5932840 + Math.random() * 1000)} closed. (${Math.floor(Math.random() * 12 + 1)} txs, time: ${(1.8 + Math.random() * 1.5).toFixed(1)}s)`;
        } else if (randomType === 'trade') {
          const userKey = Math.random().toString(36).substring(2, 6).toUpperCase();
          const amount = Math.floor(50 + Math.random() * 800);
          text = `Account GD${userKey}... executed order on Stellar DEX for $${(amount * 0.35).toFixed(2)} USDC`;
        } else {
          text = `Soroban Multi-Outcome contract state updated successfully on ledger #${Math.floor(5932840 + Math.random() * 1000)}.`;
        }

        setLogs(prev => [...prev.slice(-20), { id: Math.random().toString(), time: timeStrLog, type: randomType, text }]);
      }

    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      user: 'You (GBA7...)',
      avatar: '👽',
      text: chatInput,
      time: timeStr,
    };

    setChats(prev => [...prev, userMsg]);
    setChatInput('');
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'ledger': return t.textDim;
      case 'trade': return t.up;
      case 'liquidation': return t.down;
      case 'system': return t.accent;
    }
  };

  // Select live markets (top 4 markets with high volume for simulation display)
  const liveMarkets = markets.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 10 }}>
      {/* ── Top Automatic Horizontal Ticker Marquee for Live Comments ── */}
      <div style={{
        background: '#161B22', border: `1px solid ${t.line}`,
        borderRadius: 12, padding: '10px 16px', overflow: 'hidden',
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: t.accentDim, border: `1px solid ${t.accent}`,
          padding: '4px 10px', borderRadius: 6,
          fontSize: 11, fontWeight: 700, color: t.accent,
          fontFamily: fontMono, flexShrink: 0,
        }}>
          <span className="live-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }} />
          LIVE ACTIVITY STREAM
        </div>

        {/* Marquee Scroller */}
        <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div className="marquee-content" style={{ display: 'inline-flex', gap: 24, animation: 'marquee 25s linear infinite' }}>
            {chats.slice(-8).map((c, i) => (
              <span key={i} style={{ fontSize: 12.5, fontFamily: fontBody, color: t.textDim }}>
                <strong style={{ color: t.text, marginRight: 4 }}>{c.user}:</strong>
                &ldquo;{c.text}&rdquo;
                {c.marketTag && <span style={{ marginLeft: 6, fontSize: 10, color: t.accent, background: t.surface2, padding: '1px 6px', borderRadius: 4 }}>{c.marketTag}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Live Markets Feed | Right Logs & Trollbox Comments */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 480px',
        gap: 20,
        alignItems: 'start',
      }} className="live-feed-grid">

        {/* LEFT COLUMN: Live Markets Grid matching request */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 10px #818cf8' }} />
              Live Active Markets
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }} className="live-markets-subgrid">
            {liveMarkets.map((m) => (
              <PolymarketCard key={m.id} market={m} onSelectMarket={onSelectMarket} />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Splits into Logs (Top) and Comments (Bottom) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 600 }}>

          {/* Stellar / Soroban Logs Terminal (Top Half) */}
          <div style={{
            flex: 1, background: t.surface, border: `1px solid ${t.line}`,
            borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontFamily: fontDisplay, fontSize: 13, fontWeight: 700, color: t.text, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.up }} />
                Stellar Ledger Logs
              </h4>
              <span style={{ fontSize: 10, fontFamily: fontMono, color: t.textFaint }}>Synced</span>
            </div>

            <div 
              ref={logContainerRef}
              style={{
                flex: 1, background: '#07090C', border: `1px solid ${t.lineSoft}`,
                borderRadius: 8, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
                fontSize: 12, fontFamily: fontMono,
              }}>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: 6, color: getLogColor(log.type), lineHeight: 1.4 }}>
                  <span style={{ color: t.textFaint, flexShrink: 0 }}>[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Trollbox Comments (Bottom Half) */}
          <div style={{
            flex: 1.2, background: t.surface, border: `1px solid ${t.line}`,
            borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontFamily: fontDisplay, fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>
                Lobby Chat Room
              </h4>
              <span style={{ fontSize: 11, color: t.up, fontFamily: fontMono, fontWeight: 600 }}>● Auto-Streaming</span>
            </div>

            {/* Message board */}
            <div 
              ref={chatContainerRef}
              style={{
                flex: 1, border: `1px solid ${t.lineSoft}`, borderRadius: 8,
                padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
                background: t.surface2, marginBottom: 10, scrollBehavior: 'smooth',
              }}>
              {chats.map(chat => (
                <div key={chat.id} style={{ display: 'flex', gap: 8, fontSize: 12.5, fontFamily: fontBody }}>
                  <span style={{ fontSize: 16, background: t.surface, borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.line}`, flexShrink: 0 }}>
                    {chat.avatar}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 1 }}>
                      <span style={{ fontWeight: 700, color: chat.user.includes('You') ? t.accent : t.text }}>{chat.user}</span>
                      <span style={{ fontSize: 9.5, color: t.textFaint }}>{chat.time}</span>
                    </div>
                    <div style={{ color: t.textDim, lineHeight: 1.35 }}>{chat.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Post comment to lobby..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8,
                  background: t.surface2, border: `1px solid ${t.line}`,
                  color: t.text, fontSize: 12.5, outline: 'none',
                  fontFamily: fontBody,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 14px', borderRadius: 8, border: 'none',
                  background: t.accent, color: '#fff', fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#6D8AFF'}
                onMouseLeave={e => e.currentTarget.style.background = t.accent}
              >
                Post
              </button>
            </form>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media(max-width: 960px) {
          .live-feed-grid {
            grid-template-columns: 1fr !important;
          }
          .live-markets-subgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
