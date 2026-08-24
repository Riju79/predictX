import { useState } from 'react';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';
import { MarketOutcome } from './TradingDrawer';
import { useWallet } from '@/src/wallet/useWallet';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  currency?: 'XLM' | 'USDC';
  walletConnected?: boolean;
  onCreateConfirm: (market: {
    title: string;
    category: string;
    ic: string;
    outcomes: MarketOutcome[];
    vol: string;
    liquidityAmount: number;
    end: string;
  }) => void;
}

const CATEGORIES = ['Elections', 'Politics', 'Sports', 'Crypto', 'Climate', 'Economics', 'Tech', 'Culture'];
const EMOJIS = ['🗳️', '⚽', '₿', '🌍', '💻', '🛢️', '🎬', '📈', '🎮', '🚀'];
const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

export default function CreateMarketModal({
  isOpen,
  onClose,
  walletBalance,
  currency = 'XLM',
  walletConnected = false,
  onCreateConfirm,
}: CreateMarketModalProps) {
  const { fundAccount, isFunding = false } = useWallet();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Elections');
  const [ic, setIc] = useState('🗳️');
  const [duration, setDuration] = useState('30d');
  const [liquidity, setLiquidity] = useState('2');

  // Outcome choices state
  const [outcomeInputs, setOutcomeInputs] = useState<Array<{ name: string; color: string }>>([
    { name: 'Option A', color: PALETTE[0] },
    { name: 'Option B', color: PALETTE[1] },
    { name: 'Option C', color: PALETTE[2] },
  ]);

  const [txState, setTxState] = useState<'idle' | 'loading' | 'success'>('idle');

  if (!isOpen) return null;

  const handleAddOutcome = () => {
    if (outcomeInputs.length >= 6) return;
    const nextIdx = outcomeInputs.length;
    setOutcomeInputs(prev => [
      ...prev,
      { name: `Option ${String.fromCharCode(65 + nextIdx)}`, color: PALETTE[nextIdx % PALETTE.length] }
    ]);
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomeInputs.length <= 2) {
      alert('Market must have at least 2 outcomes!');
      return;
    }
    setOutcomeInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleOutcomeNameChange = (index: number, val: string) => {
    setOutcomeInputs(prev => prev.map((item, i) => i === index ? { ...item, name: val } : item));
  };

  const handleOutcomeColorChange = (index: number, color: string) => {
    setOutcomeInputs(prev => prev.map((item, i) => i === index ? { ...item, color } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 10) {
      alert('Please enter a descriptive market title (min 10 chars).');
      return;
    }
    if (outcomeInputs.some(o => !o.name.trim())) {
      alert('All outcomes must have a valid non-empty name.');
      return;
    }
    const liqVal = parseFloat(liquidity);
    if (isNaN(liqVal) || liqVal <= 0 || liqVal > walletBalance) {
      alert(`Please enter a valid liquidity amount (max ${walletBalance} ${currency}).`);
      return;
    }

    setTxState('loading');

    // Equal probability split across created outcomes
    const equalProb = parseFloat((100 / outcomeInputs.length).toFixed(1));
    const createdOutcomes: MarketOutcome[] = outcomeInputs.map((item, idx) => ({
      id: `out-${idx}-${Date.now()}`,
      name: item.name.trim(),
      probability: equalProb,
      color: item.color,
    }));

    setTimeout(() => {
      setTxState('success');
      setTimeout(() => {
        onCreateConfirm({
          title,
          category,
          ic,
          outcomes: createdOutcomes,
          vol: liqVal >= 1000 ? `$${(liqVal / 1000).toFixed(1)}K` : `$${liqVal.toFixed(0)}`,
          liquidityAmount: liqVal,
          end: duration,
        });
        // reset form
        setTitle('');
        setLiquidity('500');
        setTxState('idle');
        onClose();
      }, 1200);
    }, 1800);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
      background: 'rgba(5, 6, 8, 0.75)', backdropFilter: 'blur(10px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      
      {/* Modal Container */}
      <div 
        style={{
          width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto',
          background: t.surface, border: `1px solid ${t.line}`,
          borderRadius: 16, padding: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: fontDisplay, fontSize: 19, fontWeight: 600, color: t.text, margin: 0 }}>
            Deploy Multi-Outcome Prediction Market
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: t.textDim,
              fontSize: 22, cursor: 'pointer', fontFamily: fontBody,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = t.text)}
            onMouseLeave={e => (e.currentTarget.style.color = t.textDim)}
          >
            &times;
          </button>
        </div>

        <p style={{ margin: 0, fontSize: 12.5, color: t.textDim, fontFamily: fontBody, lineHeight: 1.45 }}>
          Create a multi-choice real-time prediction market by deploying a Soroban contract with multi-series AMM pools.
        </p>

        {txState === 'idle' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Market Title */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textDim, marginBottom: 6 }}>
                Market Question / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Who will win the 2028 US Presidential Election?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 8,
                  background: t.surface2, border: `1px solid ${t.line}`,
                  color: t.text, fontSize: 13.5, outline: 'none',
                  fontFamily: fontBody, transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.line}
              />
            </div>

            {/* Category & Emoji Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textDim, marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: t.surface2, border: `1px solid ${t.line}`,
                    color: t.text, fontSize: 13, outline: 'none',
                    fontFamily: fontBody, cursor: 'pointer',
                  }}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textDim, marginBottom: 6 }}>
                  Icon Emoji
                </label>
                <select
                  value={ic}
                  onChange={e => setIc(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: t.surface2, border: `1px solid ${t.line}`,
                    color: t.text, fontSize: 13, outline: 'none',
                    fontFamily: fontBody, cursor: 'pointer',
                  }}
                >
                  {EMOJIS.map(em => <option key={em} value={em}>{em} Choice</option>)}
                </select>
              </div>
            </div>

            {/* Dynamic Outcomes Section */}
            <div style={{ background: t.surface2, borderRadius: 10, padding: 14, border: `1px solid ${t.lineSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: t.text, fontFamily: fontBody }}>
                  Market Outcomes ({outcomeInputs.length} Choices)
                </label>
                {outcomeInputs.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOutcome}
                    style={{
                      background: t.accentDim, border: `1px solid ${t.accent}`,
                      color: t.accent, borderRadius: 6, padding: '4px 10px',
                      fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                      fontFamily: fontBody,
                    }}
                  >
                    + Add Choice
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {outcomeInputs.map((out, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      required
                      placeholder={`Outcome ${index + 1} name`}
                      value={out.name}
                      onChange={e => handleOutcomeNameChange(index, e.target.value)}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 6,
                        background: t.surface, border: `1px solid ${t.line}`,
                        color: t.text, fontSize: 13, outline: 'none',
                        fontFamily: fontBody,
                      }}
                    />

                    {/* Color Swatch Picker */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {PALETTE.slice(0, 5).map(c => (
                        <span
                          key={c}
                          onClick={() => handleOutcomeColorChange(index, c)}
                          style={{
                            width: 18, height: 18, borderRadius: '50%', background: c,
                            cursor: 'pointer', border: out.color === c ? '2px solid #FFF' : 'none',
                            boxShadow: out.color === c ? `0 0 6px ${c}` : 'none',
                          }}
                        />
                      ))}
                    </div>

                    {/* Delete Outcome button */}
                    {outcomeInputs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOutcome(index)}
                        style={{
                          background: 'none', border: 'none', color: t.down,
                          fontSize: 18, cursor: 'pointer', padding: '0 4px',
                        }}
                        title="Remove Outcome"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Duration & Seed Liquidity Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textDim, marginBottom: 6 }}>
                  Market Duration
                </label>
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: t.surface2, border: `1px solid ${t.line}`,
                    color: t.text, fontSize: 13, outline: 'none',
                    fontFamily: fontBody, cursor: 'pointer',
                  }}
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="180d">180 Days</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: t.textDim }}>
                    Seed Liquidity ({currency})
                  </label>
                  <span style={{ fontSize: 11, color: walletBalance < parseFloat(liquidity || '0') ? '#EF4444' : '#10B981', fontWeight: 600, fontFamily: fontMono }}>
                    Available: {walletBalance.toFixed(2)} {currency}
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={liquidity}
                    onChange={e => setLiquidity(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      background: t.surface2, border: `1px solid ${walletBalance < parseFloat(liquidity || '0') ? '#EF4444' : t.line}`,
                      color: t.text, fontSize: 13, outline: 'none',
                      fontFamily: fontMono,
                    }}
                  />
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: t.textFaint, fontSize: 11, fontWeight: 700,
                  }}>{currency}</span>
                </div>

                {walletBalance < parseFloat(liquidity || '0') && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 12px', borderRadius: 8 }}>
                    <span style={{ fontSize: 11.5, color: '#FCA5A5', fontWeight: 500 }}>
                      Insufficient XLM balance. Available: {walletBalance.toFixed(2)} XLM. Please enter an amount ≤ {walletBalance > 1 ? (walletBalance - 1).toFixed(1) : walletBalance.toFixed(1)} XLM.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: 13, borderRadius: 8, border: 'none',
                background: t.accent, color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'background 0.15s',
                marginTop: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6D8AFF'}
              onMouseLeave={e => e.currentTarget.style.background = t.accent}
            >
              Deploy Multi-Outcome Contract
            </button>
          </form>
        ) : txState === 'loading' ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, padding: '40px 0',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `3px solid ${t.line}`, borderTopColor: t.accent,
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ textAlign: 'center', fontFamily: fontBody }}>
              <div style={{ color: t.text, fontWeight: 600, fontSize: 15 }}>Compiling WASM &amp; Deploying Multi-Outcome Market</div>
              <div style={{ color: t.textDim, fontSize: 12, marginTop: 4, fontFamily: fontMono }}>
                Soroban Contract Hash: SAC7M...{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 14, padding: '30px 0', color: t.up,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: `${t.up}18`,
              border: `2px solid ${t.up}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ textAlign: 'center', fontFamily: fontBody }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Multi-Outcome Contract Deployed!</div>
              <div style={{ color: t.textDim, fontSize: 12, marginTop: 4 }}>
                AMM pools initialized for {outcomeInputs.length} outcome tokens on Stellar.
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalScale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
