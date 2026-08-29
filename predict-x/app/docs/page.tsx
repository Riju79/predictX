'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// ── Types ──
type DocSection =
  | 'introduction'
  | 'protocol-arch'
  | 'soroban-arch'
  | 'frontend-arch'
  | 'backend-arch'
  | 'infra-arch'
  | 'amm-mechanics'
  | 'buying-selling'
  | 'liquidity-provision'
  | 'indexer-db'
  | 'charts-feeds'
  | 'rest-apis'
  | 'rpc-methods'
  | 'local-dev'
  | 'env-setup'
  | 'onboarding'
  | 'deployment'
  | 'security'
  | 'scaling'
  | 'stress-test'
  | 'mainnet-readiness';

interface NavGroup {
  id: string;
  title: string;
  items?: { id: DocSection; title: string }[];
  singleId?: DocSection;
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<DocSection>('introduction');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    architecture: true,
    trading: true,
    data: false,
    apis: false,
    operations: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleCopyCode = (codeText: string, label: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Nav structure matching the exact reference screenshot
  const navTree: NavGroup[] = [
    {
      id: 'intro-group',
      title: 'Introduction',
      singleId: 'introduction',
    },
    {
      id: 'architecture',
      title: 'Architecture',
      items: [
        { id: 'protocol-arch', title: 'Protocol Architecture' },
        { id: 'soroban-arch', title: 'Soroban Contract Architecture' },
        { id: 'frontend-arch', title: 'Frontend Architecture' },
        { id: 'backend-arch', title: 'Backend Architecture' },
        { id: 'infra-arch', title: 'Infrastructure Architecture' },
      ],
    },
    {
      id: 'trading',
      title: 'Trading',
      items: [
        { id: 'amm-mechanics', title: 'AMM Mechanics (x · y = k)' },
        { id: 'buying-selling', title: 'Buying & Selling Shares' },
        { id: 'liquidity-provision', title: 'Liquidity Provision' },
      ],
    },
    {
      id: 'data',
      title: 'Data & Analytics',
      items: [
        { id: 'indexer-db', title: 'Real-time Indexer & DB' },
        { id: 'charts-feeds', title: 'Candlestick Charts & Feeds' },
      ],
    },
    {
      id: 'apis',
      title: 'APIs',
      items: [
        { id: 'rest-apis', title: 'REST API Reference' },
        { id: 'rpc-methods', title: 'Soroban RPC Methods' },
      ],
    },
    {
      id: 'operations',
      title: 'Operations',
      items: [
        { id: 'local-dev', title: 'Local Development' },
        { id: 'env-setup', title: 'Environment Setup' },
        { id: 'onboarding', title: 'Onboarding Guide' },
        { id: 'deployment', title: 'Deployment' },
      ],
    },
    { id: 'sec-group', title: 'Security Considerations', singleId: 'security' },
    { id: 'scale-group', title: 'Scaling Considerations', singleId: 'scaling' },
    { id: 'stress-group', title: 'Stress-Test Report', singleId: 'stress-test' },
    { id: 'mainnet-group', title: 'Mainnet Readiness', singleId: 'mainnet-readiness' },
  ];

  // Search filter
  const filteredNavTree = useMemo(() => {
    if (!searchQuery.trim()) return navTree;
    const q = searchQuery.toLowerCase();
    return navTree.map(group => {
      if (group.singleId) {
        return group.title.toLowerCase().includes(q) ? group : null;
      }
      const matchingItems = group.items?.filter(item => item.title.toLowerCase().includes(q));
      if (matchingItems && matchingItems.length > 0) {
        return { ...group, items: matchingItems };
      }
      return group.title.toLowerCase().includes(q) ? group : null;
    }).filter(Boolean) as NavGroup[];
  }, [searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: '#0B0E14', color: '#E2E8F0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── TOP HEADER BAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: '64px', background: '#0D1117', borderBottom: '1px solid #1F293D',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            style={{
              display: 'none', background: 'transparent', border: 'none', color: '#94A3B8',
              fontSize: 20, cursor: 'pointer', padding: 4
            }}
            className="mobile-nav-toggle"
            aria-label="Toggle Sidebar Navigation"
          >
            ☰
          </button>
          
          <Link href="/app" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="PredictX Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span style={{ fontSize: 19, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              PREDICT<span style={{ color: '#818CF8' }}>X</span>
            </span>
          </Link>
          
          <span style={{ height: 18, width: 1, background: '#334155' }} />
          
          <span style={{
            fontSize: 14, fontWeight: 600, color: '#A78BFA',
            background: 'rgba(167, 139, 250, 0.12)', padding: '3px 10px', borderRadius: 6,
            border: '1px solid rgba(167, 139, 250, 0.25)', letterSpacing: '0.2px'
          }}>
            Documentation
          </span>
        </div>

        {/* Header Search & External Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 220 }} className="header-search-container">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '7px 12px 7px 32px', borderRadius: 8,
                background: '#161B22', border: '1px solid #30363D', color: '#E2E8F0',
                fontSize: 12.5, outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6E7681', fontSize: 12 }}>
              🔍
            </span>
          </div>

          <Link href="/app" style={{
            background: '#1F2937', color: '#F1F5F9', border: '1px solid #374151',
            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.15s ease'
          }}>
            Launch DApp →
          </Link>
        </div>
      </header>

      {/* ── MAIN LAYOUT (SIDEBAR + CONTENT) ── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        
        {/* ── LEFT SIDEBAR NAVIGATION ── */}
        <aside style={{
          width: '280px', flexShrink: 0, background: '#0D1117',
          borderRight: '1px solid #1F293D', padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: 6,
          position: 'sticky', top: '64px', height: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }} className={`sidebar-nav ${isMobileNavOpen ? 'mobile-open' : ''}`}>
          
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 12px 8px' }}>
            Table of Contents
          </div>

          {filteredNavTree.map(group => {
            if (group.singleId) {
              const isSelected = activeSection === group.singleId;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveSection(group.singleId!);
                    setIsMobileNavOpen(false);
                  }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 8,
                    background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    color: isSelected ? '#A78BFA' : '#C9D1D9', border: 'none',
                    fontWeight: isSelected ? 700 : 500, fontSize: 13.5, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <span>{group.title}</span>
                  {isSelected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA' }} />}
                </button>
              );
            }

            const isOpen = openGroups[group.id] ?? false;
            const hasActiveChild = group.items?.some(item => item.id === activeSection);

            return (
              <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                    background: 'transparent', color: hasActiveChild ? '#F1F5F9' : '#94A3B8',
                    border: 'none', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  <span>{group.title}</span>
                  <span style={{ fontSize: 10, transition: 'transform 0.15s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 12, borderLeft: '1px solid #1E293B', marginLeft: 12, marginTop: 2, marginBottom: 2 }}>
                    {group.items?.map(item => {
                      const isChildSelected = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setIsMobileNavOpen(false);
                          }}
                          style={{
                            width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 6,
                            background: isChildSelected ? 'rgba(124, 58, 237, 0.18)' : 'transparent',
                            color: isChildSelected ? '#C4B5FD' : '#8B949E', border: 'none',
                            fontWeight: isChildSelected ? 600 : 400, fontSize: 13, cursor: 'pointer',
                            transition: 'all 0.12s ease'
                          }}
                        >
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* ── RIGHT MAIN DOCUMENTATION CONTENT AREA ── */}
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: '960px', margin: '0 auto', overflowX: 'hidden' }}>
          
          {/* Breadcrumb Navigation */}
          <div style={{ fontSize: 12.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <span>Docs</span>
            <span>›</span>
            <span style={{ color: '#94A3B8', textTransform: 'capitalize' }}>
              {activeSection.replace('-', ' ')}
            </span>
          </div>

          {/* SECTION CONTENTS */}
          {activeSection === 'introduction' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>
                PredictX Protocol Documentation
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#94A3B8', marginBottom: 28 }}>
                PredictX is a next-generation, non-custodial decentralized prediction market protocol built natively on <strong>Stellar Soroban Mainnet</strong>.
                It allows users to create prediction markets, trade YES/NO outcome shares powered by constant-product Automated Market Makers (AMM), and provide liquidity to earn automated trading protocol fees.
              </p>

              {/* Quick Status Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11.5, color: '#6E7681', fontWeight: 600, textTransform: 'uppercase' }}>Network</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#38BDF8', marginTop: 4 }}>Stellar Mainnet</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Public Global Stellar Network</div>
                </div>

                <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11.5, color: '#6E7681', fontWeight: 600, textTransform: 'uppercase' }}>AMM Core ID</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#A78BFA', marginTop: 4, fontFamily: 'monospace' }}>CCA73ZY...BMH</div>
                  <a href="https://stellar.expert/explorer/public/contract/CCA73ZYKH5BB4EVVPVJJNJJV6ALY6DG3FGCNCJMEUA6VJTBNVRGEWBMH" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: '#38BDF8', textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>
                    StellarExpert Mainnet ↗
                  </a>
                </div>

                <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11.5, color: '#6E7681', fontWeight: 600, textTransform: 'uppercase' }}>Security & Audit</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#34D399', marginTop: 4 }}>Passed (100%)</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Standalone Formal Audit Report</div>
                </div>
              </div>

              {/* Callout Box */}
              <div style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: 12, padding: 20, marginBottom: 32 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#C4B5FD', marginBottom: 6 }}>
                  💡 Core Protocol Highlights
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#CBD5E1', fontSize: 13.5, lineHeight: 1.7 }}>
                  <li><strong>Zero Middlemen:</strong> All market creation, share minting, and trade calculations occur on-chain via Rust smart contracts.</li>
                  <li><strong>13.2 KB Compressed WASM:</strong> Nano-optimized storage footprint fitting strictly within host function rent budgets.</li>
                  <li><strong>Automated LP Rewards:</strong> 50% of trade fees (0.5%) distributed directly to AMM liquidity providers.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'protocol-arch' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Protocol Architecture</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 24 }}>
                PredictX employs a modular, high-throughput smart contract architecture consisting of four core components:
              </p>

              {/* ASCII / Graphic Box */}
              <div style={{ background: '#0D1117', border: '1px solid #21262D', borderRadius: 12, padding: 20, fontFamily: 'monospace', fontSize: 12.5, color: '#C9D1D9', lineHeight: 1.5, overflowX: 'auto', marginBottom: 28 }}>
                {`┌──────────────────────────────────────────────────────────────────┐
│                      PREDICTX PROTOCOL ENGINE                    │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    ▼                             ▼                             ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Market Factory  │───▶│   Market Core    │───▶│   Oracle Module  │
│  create_market() │    │  buy_shares()    │    │  propose()       │
│  list_markets()  │    │  sell_shares()   │    │  approve()       │
└──────────────────┘    └──────────────────┘    └──────────────────┘`}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E2E8F0', marginTop: 24, marginBottom: 12 }}>Protocol Data Flow</h3>
              <ol style={{ color: '#CBD5E1', fontSize: 13.5, lineHeight: 1.7, paddingLeft: 20 }}>
                <li><strong>Creation:</strong> Creators call <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>create_market()</code> via the Market Factory.</li>
                <li><strong>AMM Initialization:</strong> The contract initializes constant-product outcome reserves (<code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>x · y = k</code>).</li>
                <li><strong>Trading:</strong> Users swap collateral for YES/NO outcome tokens directly with the Soroban pool.</li>
                <li><strong>Resolution:</strong> The Oracle committee approves the outcome, enabling winning share redemption.</li>
              </ol>
            </div>
          )}

          {activeSection === 'soroban-arch' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Soroban Contract Architecture</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 24 }}>
                All contracts are written in pure Rust using the <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>soroban-sdk v27</code> under strict <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>#![no_std]</code> optimizations.
              </p>

              {/* Code Snippet Box */}
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
                <div style={{ background: '#161B22', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #21262D' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#8B949E' }}>contracts/market/src/lib.rs (MarketState Struct)</span>
                  <button
                    onClick={() => handleCopyCode(`#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct MarketState {
    pub id: u64,
    pub creator: Address,
    pub resolution_time: u64,
    pub oracle_id: Address,
    pub status: MarketStatus,
    pub winning_outcome: Outcome,
    pub yes_reserves: i128,
    pub no_reserves: i128,
}`, 'market-state')}
                    style={{ background: '#21262D', color: '#C9D1D9', border: 'none', padding: '3px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                  >
                    {copiedCode === 'market-state' ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: 16, fontSize: 12.5, color: '#E6EDE3', fontFamily: 'monospace', lineHeight: 1.6, overflowX: 'auto' }}>
{`#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct MarketState {
    pub id: u64,
    pub creator: Address,
    pub resolution_time: u64,
    pub oracle_id: Address,
    pub status: MarketStatus,
    pub winning_outcome: Outcome,
    pub yes_reserves: i128,
    pub no_reserves: i128,
}`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'frontend-arch' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Frontend Architecture</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                Built on Next.js 16 (App Router + Turbopack) and React 19, incorporating @stellar/stellar-sdk and @stellar/freighter-api for secure, non-custodial wallet interactions.
              </p>
              <ul style={{ color: '#CBD5E1', fontSize: 13.5, lineHeight: 1.8, paddingLeft: 20 }}>
                <li><strong>Freighter API Integration:</strong> Auto-detects wallet, sequence checks <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>getAddress()</code> to prevent double popups.</li>
                <li><strong>Pre-flight Simulation:</strong> Calls <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>simulate_transaction</code> on Soroban RPC prior to signing.</li>
                <li><strong>Responsive UI:</strong> Native mobile drawers, perps candlestick charts (Lightweight Charts), and live feed updates.</li>
              </ul>
            </div>
          )}

          {activeSection === 'backend-arch' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Backend Architecture</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                PredictX utilizes a serverless event-driven indexer built into Next.js Route Handlers (<code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>app/api/*</code>).
              </p>
              <ul style={{ color: '#CBD5E1', fontSize: 13.5, lineHeight: 1.8, paddingLeft: 20 }}>
                <li><code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>GET /api/markets</code>: Fetches active prediction markets with reserve statistics.</li>
                <li><code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>GET /api/portfolio</code>: Returns user-specific on-chain positions and trade history.</li>
                <li><code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>GET /api/trades</code>: Real-time orderbook trade stream.</li>
              </ul>
            </div>
          )}

          {activeSection === 'infra-arch' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Infrastructure Architecture</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                The protocol relies entirely on decentralized infrastructure providers for maximum uptime and reliability:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#38BDF8' }}>Soroban Mainnet RPC</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>https://mainnet.sorobanrpc.com</div>
                </div>
                <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#A78BFA' }}>Stellar Horizon Mainnet</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>https://horizon.stellar.org</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'amm-mechanics' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>AMM Mechanics (x · y = k)</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                PredictX employs a constant-product Automated Market Maker for binary prediction outcomes.
              </p>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', marginBottom: 8 }}>Formula</div>
                <code style={{ fontSize: 16, color: '#38BDF8' }}>shares_out = (yes_reserves × net_payment) / (no_reserves + net_payment)</code>
              </div>
            </div>
          )}

          {activeSection === 'buying-selling' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Buying & Selling Shares</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                Traders can purchase outcome shares with XLM or sell existing positions back to the pool at any time before market resolution.
              </p>
              <ul style={{ color: '#CBD5E1', fontSize: 13.5, lineHeight: 1.8, paddingLeft: 20 }}>
                <li><strong>Buy Shares:</strong> Invokes <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>buy_shares(user, market_id, outcome, payment)</code>.</li>
                <li><strong>Sell Shares:</strong> Invokes <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>sell_shares(user, market_id, outcome, shares)</code> with pre-checked balance queries.</li>
              </ul>
            </div>
          )}

          {activeSection === 'liquidity-provision' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Liquidity Provision</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                Liquidity Providers deposit XLM into market pools via <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>add_liquidity()</code> and receive LP position tokens representing their pool share.
              </p>
            </div>
          )}

          {activeSection === 'indexer-db' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Real-time Indexer & DB</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                Stores indexed event data in Neon PostgreSQL database schema (<code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>px_markets</code>, <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>px_trades</code>, <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>px_portfolio</code>).
              </p>
            </div>
          )}

          {activeSection === 'charts-feeds' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Candlestick Charts & Feeds</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                Real-time probability charts powered by Lightweight Charts and Recharts for instant price discovery.
              </p>
            </div>
          )}

          {activeSection === 'rest-apis' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>REST API Reference</h2>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 12, padding: 18, fontSize: 13 }}>
                <div style={{ color: '#34D399', fontWeight: 700 }}>GET /api/markets</div>
                <div style={{ color: '#94A3B8', marginTop: 4 }}>Returns list of active markets with pool reserves and volume metrics.</div>
              </div>
            </div>
          )}

          {activeSection === 'rpc-methods' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Soroban RPC Methods</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', marginBottom: 20 }}>
                Uses standard Soroban JSON-RPC endpoints (<code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>simulateTransaction</code>, <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>sendTransaction</code>, <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>getTransaction</code>).
              </p>
            </div>
          )}

          {activeSection === 'local-dev' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Local Development</h2>
              <pre style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 10, padding: 16, fontSize: 13, color: '#38BDF8' }}>
{`git clone https://github.com/Riju79/predictX.git
cd predictX/predict-x
npm install
npm run dev`}
              </pre>
            </div>
          )}

          {activeSection === 'env-setup' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Environment Setup</h2>
              <pre style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 10, padding: 16, fontSize: 13, color: '#A78BFA' }}>
{`NEXT_PUBLIC_STELLAR_NETWORK=public
NEXT_PUBLIC_SOROBAN_RPC_URL=https://mainnet.sorobanrpc.com
NEXT_PUBLIC_FACTORY_CONTRACT_ID=CCA73ZYKH5BB4EVVPVJJNJJV6ALY6DG3FGCNCJMEUA6VJTBNVRGEWBMH`}
              </pre>
            </div>
          )}

          {activeSection === 'onboarding' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Onboarding Guide</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8' }}>
                Follow our step-by-step guide to connect Freighter Wallet, select a prediction market, and execute your first trade on Stellar Mainnet.
              </p>
            </div>
          )}

          {activeSection === 'deployment' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Deployment Guide</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8' }}>
                Instructions for building target <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#38BDF8' }}>wasm32v1-none</code> binaries via Stellar CLI and deploying to Stellar Mainnet.
              </p>
            </div>
          )}

          {activeSection === 'security' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Security Considerations</h2>
              <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#34D399', marginBottom: 6 }}>Formal Audit Passed</div>
                <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: 0, lineHeight: 1.6 }}>
                  See full formal audit report in <code style={{ background: '#161B22', padding: '2px 6px', borderRadius: 4, color: '#34D399' }}>SECURITY_AUDIT.md</code>. Includes reentrancy checks, storage entry sanitization, and multisig oracle consensus validation.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'scaling' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Scaling Considerations</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8' }}>
                Designed to leverage parallel host function execution in Soroban Phase 2 structure with bounded storage key tuples.
              </p>
            </div>
          )}

          {activeSection === 'stress-test' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Stress-Test Report</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8' }}>
                Contract binary size compressed down to <strong>13,212 bytes</strong>, requiring exactly 7.85 XLM storage deposit on Stellar Mainnet.
              </p>
            </div>
          )}

          {activeSection === 'mainnet-readiness' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Mainnet Readiness</h2>
              <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#38BDF8', marginBottom: 8 }}>🟢 Fully Deployed & Verified</div>
                <div style={{ fontSize: 13.5, color: '#CBD5E1', lineHeight: 1.6 }}>
                  All 3 core contracts (Factory, AMM, Oracle) are deployed on Stellar Mainnet and verified on StellarExpert Explorer.
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── CSS FOR RESPONSIVE MEDIA QUERIES ── */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-nav-toggle {
            display: block !important;
          }
          .sidebar-nav {
            position: fixed !important;
            top: 64px !important;
            left: -280px !important;
            z-index: 99 !important;
            transition: left 0.2s ease !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.5) !important;
          }
          .sidebar-nav.mobile-open {
            left: 0 !important;
          }
          .header-search-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
