'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
import { Client as MarketClient, Outcome, MarketState, MarketStatus } from '@/src/bindings/market';
import { Client as TokenClient } from '@/src/bindings/token';
import BackgroundScene from '@/components/ui/aurora-section-hero';

const MARKET_ID = "CBJTVNQSVDZG6ND2CZCMM2ES5PYDSGRDCKD4KKWM44E2XY64M42LULDB";
const TOKEN_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const MARKET_NUMERIC_ID = 0n; // first market ID
const DECIMALS = 7;



const toRawAmount = (val: string) => {
  const parsed = parseFloat(val);
  if (isNaN(parsed) || parsed <= 0) return 0n;
  return BigInt(Math.round(parsed * Math.pow(10, DECIMALS)));
};

const fromRawAmount = (val: bigint | number) =>
  (Number(val) / Math.pow(10, DECIMALS)).toFixed(4);

const getMarketClient = (publicKey?: string) =>
  new MarketClient({
    contractId: MARKET_ID,
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    publicKey,
    signTransaction: publicKey
      ? (xdr: string) => signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE })
      : undefined,
  });

const getTokenClient = (publicKey?: string) =>
  new TokenClient({
    contractId: TOKEN_ID,
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    publicKey,
    signTransaction: publicKey
      ? (xdr: string) => signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE })
      : undefined,
  });

export default function Home() {
  // ── Wallet state ──────────────────────────────────────────────────────────
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [walletError, setWalletError] = useState('');

  // ── Market state ──────────────────────────────────────────────────────────
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [statusMsg, setStatusMsg] = useState('');
  const [betAmount, setBetAmount] = useState('10');
  const [showModal, setShowModal] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const [prodMode, setProdMode] = useState<'trade' | 'managed' | 'funded'>('managed');
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [promoVisible, setPromoVisible] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(10 * 3600);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroParticlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  // ── Scroll listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  // ── Starfield ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = document.getElementById('stars');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 4 + 's';
      container.appendChild(s);
    }
  }, []);

  // ── Particle canvas (3D FIFA World Cup Trophy) ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate 3D coordinates for the FIFA World Cup trophy shape
    const generateTrophy3D = () => {
      const particles = [];
      const numParticles = 4500; // High density to match the reference image

      for (let i = 0; i < numParticles; i++) {
        let px = 0, py = 0, pz = 0;
        const part = Math.random();

        if (part < 0.38) {
          // 1. Globe (sphere at the top)
          const theta = Math.random() * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * Math.random() - 1.0);
          const r = 48 * (0.9 + 0.1 * Math.random()); // Surface shell shell
          px = r * Math.sin(phi) * Math.cos(theta);
          py = 85 + r * Math.sin(phi) * Math.sin(theta);
          pz = r * Math.cos(phi);
        } else if (part < 0.63) {
          // 2. Flared Base
          const h = Math.random() * 85; // Base height offset
          py = -150 + h;
          const rBase = 62 - h * 0.22; // Wider at bottom
          const theta = Math.random() * 2 * Math.PI;
          const r = rBase * (0.88 + 0.12 * Math.random());
          px = r * Math.cos(theta);
          pz = r * Math.sin(theta);
        } else {
          // 3. Torso & Intertwined Humanoid Figures
          const h = Math.random() * 125; // y from -65 to 60
          py = -65 + h;

          // Spiral logic to create 2 stylized figures wrapping up
          const isFigureA = Math.random() < 0.5;
          const angle = (py * 0.04) + (isFigureA ? 0 : Math.PI);
          const offsetRadius = 15 * Math.sin((h / 125) * Math.PI); // Flairs in center

          const cx = offsetRadius * Math.cos(angle);
          const cz = offsetRadius * Math.sin(angle);

          // Thickness of arms/body branches
          const branchR = (16 - (h / 125) * 3) * (0.8 + 0.2 * Math.random());
          const theta = Math.random() * 2 * Math.PI;

          px = cx + branchR * Math.cos(theta);
          pz = cz + branchR * Math.sin(theta);
        }

        particles.push({
          x: px,
          y: py,
          z: pz,
          o: Math.random() * 0.7 + 0.3,
          spd: Math.random() * 0.015 + 0.005,
        });
      }
      return particles;
    };

    const pts = generateTrophy3D();
    let t = 0;
    let rafId: number;

    const draw = () => {
      t += 0.008; // Rotate speed
      ctx.clearRect(0, 0, 500, 500);

      // Tilts: X-tilt brings the top forward, Z-tilt tilts the trophy diagonally (like the image)
      const cosX = Math.cos(-0.25);
      const sinX = Math.sin(-0.25);
      const cosZ = Math.cos(-0.35);
      const sinZ = Math.sin(-0.35);

      const cosY = Math.cos(t);
      const sinY = Math.sin(t);

      // Render particles with 3D projection
      pts.forEach(p => {
        // 1. Rotate around Y-axis (Auto-spin)
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y1 = p.y;

        // 2. Rotate around X-axis (Pitch tilt)
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // 3. Rotate around Z-axis (Roll tilt to match the image's diagonal slant)
        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        // Perspective Projection
        const fov = 350;
        const scale = fov / (fov + z3);
        const screenX = 250 + x3 * scale;
        const screenY = 220 - y3 * scale; // Shifted center slightly upward

        // Draw particle if within bounds
        if (screenX >= 0 && screenX <= 500 && screenY >= 0 && screenY <= 500) {
          // Beautiful glowing green colors
          ctx.fillStyle = '#10B981'; 
          ctx.globalAlpha = p.o * (0.6 + 0.4 * Math.sin(t * p.spd * 80)) * Math.max(0.2, (scale * 0.9));
          ctx.beginPath();
          ctx.arc(screenX, screenY, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── Reveal on scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add('in');
      });
    }, { threshold: 0.2 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Count-up stats ────────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.stat .num');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        const target = +(el.dataset.count || 0);
        const suffix = el.dataset.suffix || '';
        let cur = 0;
        const step = Math.max(1, target / 40);
        const tick = () => {
          cur += step;
          if (cur >= target) { el.textContent = target + suffix; return; }
          el.textContent = Math.floor(cur) + suffix;
          requestAnimationFrame(tick);
        };
        tick();
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Hero Ambient Particles ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = heroParticlesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      maxOpacity: number;
      fadeSpeed: number;
    }

    const particles: Particle[] = [];
    const particleCount = 45;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.5,
        maxOpacity: Math.random() * 0.4 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002,
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        // Update physics
        p.y += p.speedY;
        p.x += p.speedX;

        // Fade in/out logic
        if (p.y < height * 0.15) {
          p.opacity -= p.fadeSpeed;
        } else if (p.opacity < p.maxOpacity) {
          p.opacity += p.fadeSpeed;
        }

        // Reset particle if it goes off screen or fades out
        if (p.y < 0 || p.opacity <= 0 || p.x < 0 || p.x > width) {
          p.x = Math.random() * width;
          p.y = height + Math.random() * 20;
          p.size = Math.random() * 2 + 1;
          p.speedY = -(Math.random() * 0.4 + 0.15);
          p.speedX = (Math.random() - 0.5) * 0.15;
          p.opacity = 0;
          p.maxOpacity = Math.random() * 0.4 + 0.2;
          p.fadeSpeed = Math.random() * 0.005 + 0.002;
        }

        // Draw particle with green glow style matching theme
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 168, 102, ${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(34, 168, 102, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ── Hero parallax ─────────────────────────────────────────────────────────
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    
    // Set CSS variables for layered parallax background
    heroRef.current.style.setProperty('--mouse-x', x.toString());
    heroRef.current.style.setProperty('--mouse-y', y.toString());

    // Apply 3D tilt rotation to the phone wrapper
    if (phoneRef.current) {
      phoneRef.current.style.transform = `rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
    }
  };
  const handleHeroMouseLeave = () => {
    if (heroRef.current) {
      heroRef.current.style.setProperty('--mouse-x', '0');
      heroRef.current.style.setProperty('--mouse-y', '0');
    }
    if (phoneRef.current) {
      phoneRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
  };

  // ── Wallet ────────────────────────────────────────────────────────────────
  const connectWallet = async () => {
    try {
      setWalletError('');
      const connected = await isConnected();
      if (!connected) { setWalletError('Freighter wallet not found. Please install it.'); return; }
      await requestAccess();
      const addr = await getAddress();
      setPublicKey(addr.address);
      setWalletConnected(true);
      await loadMarketData(addr.address);
    } catch (e: unknown) {
      setWalletError(e instanceof Error ? e.message : 'Failed to connect wallet');
    }
  };

  const loadMarketData = async (pk: string) => {
    try {
      const marketClient = getMarketClient(pk);
      const tokenClient = getTokenClient(pk);
      const [stateRes, balRes] = await Promise.all([
        marketClient.get_market_state({ market_id: MARKET_NUMERIC_ID }),
        tokenClient.balance({ id: pk }),
      ]);
      setMarketState(stateRes.result as MarketState);
      setTokenBalance(fromRawAmount(balRes.result as bigint));
    } catch (e) {
      console.error('Error loading market data:', e);
    }
  };

  const placeBet = async (outcomeIndex: number) => {
    if (!walletConnected) { setWalletError('Connect wallet first.'); return; }
    try {
      setStatusMsg('Submitting bet...');
      const marketClient = getMarketClient(publicKey);
      const tokenClient = getTokenClient(publicKey);
      const raw = toRawAmount(betAmount);
      // Approve the market contract to spend tokens
      const approveTx = await tokenClient.approve({
        from: publicKey,
        spender: MARKET_ID,
        amount: raw,
        expiration_ledger: 999999,
      });
      await approveTx.signAndSend();
      // Buy shares for the chosen outcome
      const outcome = outcomeIndex === 0 ? Outcome.Yes : Outcome.No;
      const buyTx = await marketClient.buy_shares({
        user: publicKey,
        market_id: MARKET_NUMERIC_ID,
        outcome,
        payment: raw,
      });
      await buyTx.signAndSend();
      setStatusMsg('✅ Bet placed!');
      await loadMarketData(publicKey);
    } catch (e: unknown) {
      setStatusMsg('❌ ' + (e instanceof Error ? e.message : 'Transaction failed'));
    }
  };

  // ── Product data ──────────────────────────────────────────────────────────
  const prodData = {
    trade: { tag: '1 · TRADE', desc: 'Trade perpetuals, prediction markets, and spot — all from one order book.' },
    managed: { tag: '2 · MANAGED', desc: 'Use investment agents to automate any investing thesis.' },
    funded: { tag: '3 · FUNDED', desc: 'Get funded up to $100,000 and keep up to 90% of profits.' },
  };

  const tabContent = [
    {
      eyebrow: '01 · PERPS', title: 'Perps',
      body: 'Trade stocks, ETFs, crypto and FX with up to 50x leverage, settled instantly on Stellar.',
    },
    {
      eyebrow: '02 · PREDICTION MARKETS', title: 'Prediction Markets',
      body: 'Trade the outcome of real-world events — elections, sports, economics — with transparent onchain odds.',
    },
    {
      eyebrow: '03 · AGENTS', title: 'Agents',
      body: 'Automate your trades with investment agents that follow any thesis you set, 24/7.',
    },
  ];

  const faqItems = [
    { q: 'Why choose PredictX?', a: "We're the first platform to offer funded accounts on prediction markets, combined with perpetual futures, crypto, and equities — trade everything in one application." },
    { q: 'Is PredictX secure?', a: 'All contracts are independently audited and settlement happens onchain via Soroban smart contracts on Stellar.' },
    { q: 'What is our mission?', a: 'To make funded, transparent trading accessible to anyone, anywhere, without gatekeeping capital behind deposits.' },
    { q: 'Where is it available?', a: 'Available in 150+ countries, wherever Stellar-based settlement is supported.' },
  ];

  const shortKey = publicKey ? publicKey.slice(0, 6) + '…' + publicKey.slice(-4) : '';

  return (
    <>
      {/* ── NAV ── */}
      <nav id="mainnav" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-left">
          <div className="logo-mark" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="PredictX Logo" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: '4px' }} />
          </div>
          <ul className="nav-links">
            <li><a href="#funded">Funded</a></li>
            <li><a href="#product">Product</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        <div className="wordmark"><span className="dot" />PredictX</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            className={`connect-btn${walletConnected ? ' connected' : ''}`}
            onClick={walletConnected ? () => setShowModal(true) : connectWallet}
          >
            {walletConnected ? shortKey : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="hero"
        id="hero"
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <BackgroundScene beamCount={60} />
        <div className="hero-body">
          <div className="copy">
            <div className="eyebrow reveal in"><span className="pulse" /> Live on Stellar Testnet</div>
            <h1 className="display reveal in">
              Predict<span className="grad">Everything</span>
            </h1>
            <div className="backed reveal in">
              Settled on <b style={{ color: '#fff' }}>Stellar</b> · secured by{' '}
              <span className="badge-chip">Soroban</span>
            </div>
            <div className="cta-row reveal in">
              <Link href="/app" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Launch App
              </Link>
              <a href="#product-tabs" className="btn-ghost">See how it works</a>
            </div>
          </div>
          <div className="mock-wrap reveal in">
            <div className="phone-tilt-wrapper" ref={phoneRef}>
              <div className="phone-float-idle">
                {/* iPhone Frame (Borderless) */}
                <div style={{
                  width: '274px',
                  height: '524px',
                  borderRadius: '34px',
                  background: '#07050a',
                  position: 'relative',
                  boxShadow: '0 35px 75px rgba(0,0,0,0.85)',
                  transformStyle: 'preserve-3d',
                  padding: '0',
                }}>
                  {/* Dynamic Island Notch */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '95px',
                    height: '22px',
                    background: '#000',
                    borderRadius: '20px',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 8px'
                  }}>
                    {/* Small camera lens reflection */}
                    <div style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#1a1a3a',
                      opacity: 0.8,
                      marginRight: '6px',
                      boxShadow: 'inset 0 0 2px rgba(255,255,255,0.4)'
                    }} />
                  </div>

                  {/* iPhone Screen Content */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '34px',
                    overflow: 'hidden',
                    background: 'radial-gradient(circle at 50% 0%, #0c1a14 0%, #060908 100%)',
                    position: 'relative',
                    padding: '38px 14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {/* Status Bar */}
                    <div style={{ 
                      position: 'absolute',
                      top: '12px',
                      left: '20px',
                      right: '20px',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      fontSize: '10px', 
                      fontWeight: 600,
                      color: '#fff',
                      opacity: 0.8,
                      zIndex: 10
                    }}>
                      <span>9:41</span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span>📶</span>
                        <span style={{ fontSize: '12px', lineHeight: 1 }}>🔋</span>
                      </div>
                    </div>

                    {/* Header / Brand */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      borderBottom: '1px solid rgba(147, 237, 202, 0.15)', 
                      paddingBottom: '10px',
                      marginTop: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '18px', height: '18px', borderRadius: '3px' }} />
                        <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-geist-sans), sans-serif', color: '#fff' }}>PredictX</span>
                      </div>
                      {walletConnected ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          background: 'rgba(147, 237, 202, 0.08)', 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(147, 237, 202, 0.35)',
                          boxShadow: '0 0 8px rgba(147, 237, 202, 0.2)'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--mint)' }} />
                          <span style={{ fontSize: '9px', color: 'var(--mint)', fontWeight: 600 }}>{tokenBalance} USDC</span>
                        </div>
                      ) : (
                        <button 
                          onClick={connectWallet}
                          style={{
                            background: 'rgba(147, 237, 202, 0.06)',
                            border: '1px solid var(--mint)',
                            color: 'var(--mint)',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '9px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 0 8px rgba(147, 237, 202, 0.15)',
                            outline: 'none'
                          }}
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {/* App Title */}
                    <div style={{ padding: '0 4px' }}>
                      <div style={{ fontSize: '9px', color: 'var(--mint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.9 }}>Live Markets</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '1px' }}>PredictX</div>
                    </div>

                    {/* Markets List Scrollable Area with Glassmorphism Cards */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '10px', 
                      overflowY: 'auto',
                      maxHeight: '360px',
                      paddingRight: '2px',
                    }} className="no-scrollbar">
                      {/* Market 1 (Glassmorphism & Neon Glow) */}
                      <div style={{ 
                        background: 'rgba(6, 38, 35, 0.55)', 
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(147, 237, 202, 0.25)', 
                        borderRadius: '16px', 
                        padding: '12px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 12px rgba(147, 237, 202, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: '1.2' }}>Fed Rate Decision</span>
                          <span style={{ 
                            fontSize: '8px', 
                            background: 'rgba(147, 237, 202, 0.15)', 
                            color: 'var(--mint)', 
                            padding: '2px 6px', 
                            borderRadius: '6px', 
                            fontWeight: 600,
                            whiteSpace: 'nowrap' 
                          }}>Economics</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {/* Selected Outcome with Neon Glow */}
                          <div style={{ 
                            flex: 1, 
                            background: 'rgba(147, 237, 202, 0.12)', 
                            border: '1px solid rgba(147, 237, 202, 0.5)', 
                            padding: '6px 8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            boxShadow: '0 0 10px rgba(147, 237, 202, 0.25)',
                            cursor: 'pointer'
                          }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--mint)' }}>Yes</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>88%</span>
                          </div>
                          {/* Inactive Outcome */}
                          <div style={{ 
                            flex: 1, 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            padding: '6px 8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>No</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)' }}>12%</span>
                          </div>
                        </div>
                      </div>

                      {/* Market 2 (Glassmorphism & Neon Glow) */}
                      <div style={{ 
                        background: 'rgba(6, 38, 35, 0.55)', 
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(147, 237, 202, 0.25)', 
                        borderRadius: '16px', 
                        padding: '12px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 12px rgba(147, 237, 202, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: '1.2' }}>BTC Above $100K</span>
                          <span style={{ 
                            fontSize: '8px', 
                            background: 'rgba(147, 237, 202, 0.15)', 
                            color: 'var(--mint)', 
                            padding: '2px 6px', 
                            borderRadius: '6px', 
                            fontWeight: 600,
                            whiteSpace: 'nowrap' 
                          }}>Crypto</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {/* Selected Outcome with Neon Glow */}
                          <div style={{ 
                            flex: 1, 
                            background: 'rgba(147, 237, 202, 0.12)', 
                            border: '1px solid rgba(147, 237, 202, 0.5)', 
                            padding: '6px 8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            boxShadow: '0 0 10px rgba(147, 237, 202, 0.25)',
                            cursor: 'pointer'
                          }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--mint)' }}>Yes</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>55%</span>
                          </div>
                          {/* Inactive Outcome */}
                          <div style={{ 
                            flex: 1, 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            padding: '6px 8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>No</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)' }}>45%</span>
                          </div>
                        </div>
                      </div>

                      {/* Market 3 (Glassmorphism & Neon Glow) */}
                      <div style={{ 
                        background: 'rgba(6, 38, 35, 0.55)', 
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(147, 237, 202, 0.25)', 
                        borderRadius: '16px', 
                        padding: '12px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 12px rgba(147, 237, 202, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: '1.2' }}>Super Bowl LX</span>
                          <span style={{ 
                            fontSize: '8px', 
                            background: 'rgba(147, 237, 202, 0.15)', 
                            color: 'var(--mint)', 
                            padding: '2px 6px', 
                            borderRadius: '6px', 
                            fontWeight: 600,
                            whiteSpace: 'nowrap' 
                          }}>Sports</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {/* Selected Outcome with Neon Glow */}
                          <div style={{ 
                            flex: 1, 
                            background: 'rgba(147, 237, 202, 0.12)', 
                            border: '1px solid rgba(147, 237, 202, 0.5)', 
                            padding: '6px 8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            boxShadow: '0 0 10px rgba(147, 237, 202, 0.25)',
                            cursor: 'pointer'
                          }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--mint)' }}>Eagles</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>70%</span>
                          </div>
                          {/* Inactive Outcome */}
                          <div style={{ 
                            flex: 1, 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            padding: '6px 8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>Chiefs</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)' }}>30%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* iPhone Home Indicator Bar */}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '110px',
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.35)',
                      borderRadius: '2px',
                      zIndex: 20
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNDED ── */}
      <section id="funded">
        {promoVisible && (
          <div className="promo-bar reveal">
            <span>Welcome Offer: Deposit $5, get $200 in trading credit · </span>
            <span>{formatCountdown(secondsLeft)}</span>
            <span className="x" onClick={() => setPromoVisible(false)}>✕</span>
          </div>
        )}
        <div className="funded">
          <div className="funded-grid">
            <div className="reveal reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 500, color: '#ffffff', letterSpacing: '-0.5px', fontFamily: 'Fraunces, serif' }}>
                  Predict the FIFA World Cup 20206
                </h2>
                <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#7700ED', boxShadow: '0 0 15px 4px rgba(119,0,237,0.8)', flexShrink: 0, marginTop: '8px' }} />
              </div>
              <p style={{ color: '#9ca3af', fontSize: '16px', marginTop: '-8px' }}>
                Back your favorite countries, predict brackets, and win from pools settled instantly on the Stellar network.
              </p>
              <div style={{ marginTop: '10px' }}>
                <Link href="/app" className="funded-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Predict World Cup Now
                </Link>
              </div>
              <ul className="perks" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '15px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e5e7eb', fontSize: '14px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: '#10b981', flexShrink: 0 }}>
                    <path d="M23 6l-9.5 9.5-5-5L1 18" />
                    <path d="M17 6h6v6" />
                  </svg>
                  Global Bracket Challenges
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e5e7eb', fontSize: '14px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: '#10b981', flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Decentralized Pool Settlement
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e5e7eb', fontSize: '14px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: '#10b981', flexShrink: 0 }}>
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Zero-fee Prediction Trades
                </li>
              </ul>
            </div>
            <div className="particle-wrap reveal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={500} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '420px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.45))'
                }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SCROLLY TABS ── */}
      <section className="scrolly" id="product-tabs">
        <div className="scrolly-inner">
          <div className="tab-copy">
            {tabContent.map((t, i) => (
              <div key={i} className={`tab-panel${activeTab === i ? ' active' : ''}`}>
                <div className="eyebrow-light">{t.eyebrow}</div>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </div>
            ))}
          </div>
          <div className="tab-phone-wrap">
            <div className="tab-phone">
              <div className={`tab-panel${activeTab === 0 ? ' active' : ''}`}>
                <div style={{ opacity: .6, fontSize: 11, marginBottom: 10 }}>WTI · Crude Oil</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>$102.96</div>
                <div style={{ color: '#4ade80', fontSize: 12, marginBottom: 14 }}>▲ 5.21% Today</div>
                <svg width="100%" height="80" viewBox="0 0 260 80">
                  <polyline fill="none" stroke="#4ade80" strokeWidth="2"
                    points="0,60 30,50 60,55 90,35 120,40 150,20 180,28 210,10 240,18 260,5" />
                </svg>
                <div style={{ marginTop: 16, fontSize: 11, opacity: .6 }}>Multiplier</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>x10</div>
              </div>
              <div className={`tab-panel${activeTab === 1 ? ' active' : ''}`}>
                <div style={{ opacity: .6, fontSize: 11, marginBottom: 10 }}>Fed Decision in March</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1a2230', padding: '10px 12px', borderRadius: 10, marginBottom: 8 }}>
                  <span>No Change</span><b style={{ color: '#4ade80' }}>88%</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1a2230', padding: '10px 12px', borderRadius: 10 }}>
                  <span>25bps decrease</span><b style={{ color: '#f87171' }}>12%</b>
                </div>
                <div style={{ opacity: .6, fontSize: 11, margin: '18px 0 8px' }}>Eagles vs Chiefs</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1a2230', padding: '10px 12px', borderRadius: 10, marginBottom: 8 }}>
                  <span>Eagles</span><b style={{ color: '#4ade80' }}>70%</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1a2230', padding: '10px 12px', borderRadius: 10 }}>
                  <span>Chiefs</span><b style={{ color: '#f87171' }}>30%</b>
                </div>
              </div>
              <div className={`tab-panel${activeTab === 2 ? ' active' : ''}`}>
                <div style={{ opacity: .6, fontSize: 11, marginBottom: 10 }}>Agent · Momentum Long</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#4ade80' }}>+18.4%</div>
                <div style={{ fontSize: 12, opacity: .6, marginBottom: 14 }}>Since deployed · 21 days</div>
                <div style={{ background: '#1a2230', borderRadius: 10, padding: 12, fontSize: 12, marginBottom: 8 }}>
                  Rebalances every 4h based on volatility signals.
                </div>
                <div style={{ background: '#1a2230', borderRadius: 10, padding: 12, fontSize: 12 }}>
                  Auto-hedges downside beyond -5% drawdown.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tabnav">
          {['01 · Perps', '02 · Prediction Markets', '03 · Agents'].map((label, i) => (
            <div
              key={i}
              className={`tabitem${activeTab === i ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT + STATS ── */}
      <section className="product" id="product">
        <h2 className="reveal">Product</h2>
        <div className="prod-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(['trade', 'managed', 'funded'] as const).map(mode => (
              <button
                key={mode}
                className={`toggle-btn${prodMode === mode ? ' active' : ''}`}
                onClick={() => setProdMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <div className="prod-visual">
            <div className="coin" />
            <div className="prod-caption">
              <div className="tag">{prodData[prodMode].tag}</div>
              <p>{prodData[prodMode].desc}</p>
            </div>
          </div>
        </div>
        <div className="snapshot-label">PERFORMANCE SNAPSHOT</div>
        <div className="stats-row">
          <div className="stat"><div className="num" data-count="150" data-suffix="+">0</div><div className="lbl">COUNTRIES AVAILABLE</div></div>
          <div className="stat"><div className="num" data-count="200" data-suffix="ms">0</div><div className="lbl">FASTEST EXECUTION</div></div>
          <div className="stat"><div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(30px,4vw,46px)' }}>$0.01</div><div className="lbl">MINIMUM ORDER SIZE</div></div>
          <div className="stat"><div className="num" data-count="50" data-suffix="x">0</div><div className="lbl">LEVERAGE POSITIONS UP TO</div></div>
          <div className="stat"><div className="num" data-count="100" data-suffix="%">0</div><div className="lbl">HISTORICAL UPTIME</div></div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="trust reveal">
        <div className="audited"><span className="check">✓</span> AUDITED BY INDEPENDENT SECURITY FIRM</div>
        <div className="sub">SECURING THE MOST TRUSTED STELLAR PROTOCOLS</div>
        <div className="logo-row">
          <span>SOROBAN</span><span>BLEND</span><span>AQUARIUS</span><span>ULTRA</span><span>STELLARX</span><span>ANCHOR</span>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="testimonial">
        <div className="quote-card reveal">
          <q>PredictX is the simplest way to trade for new and seasoned traders — funded accounts and prediction markets in one app.</q>
          <div className="quote-author">
            <b>Alex Rivera</b>
            <span>Early ecosystem investor, PredictX</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq" id="faq">
        <div className="faq-head reveal"><div className="fam">FAQ</div></div>
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className={`faq-item${openFaq === i ? ' open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
            >
              <div className="q"><span className="idx">{i + 1}</span>{item.q}</div>
              <div className="a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#hero">Trade</a>
            <a href="#funded">Funded</a>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <a href="#">Discord</a>
            <a href="#">Instagram</a>
            <a href="#">X</a>
          </div>
          <Link href="/app" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
            Start trading
          </Link>
        </div>
        <div className="footer-bottom">
          <p>Risk warning: Perpetual and prediction-market trading, especially with leverage, is high risk. Losses may exceed deposits. This is not investment advice. Results are not guaranteed.</p>
          <div className="wordmark" style={{ color: '#0d1b22', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="PredictX Logo" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: '3px' }} />
            PredictX
          </div>
        </div>
      </footer>

      {/* ── MARKETS MODAL ── */}
      {showModal && (
        <div className="markets-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="markets-modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>Prediction Markets</h2>

            {/* Wallet status */}
            <div className="wallet-status">
              <span className={`wallet-dot${walletConnected ? '' : ' disconnected'}`} />
              {walletConnected
                ? <span>Connected · <b style={{ color: '#22A866' }}>{shortKey}</b> · Balance: <b>{tokenBalance} USDC</b></span>
                : <span>Wallet not connected</span>
              }
              {!walletConnected && (
                <button className="btn-primary" style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: 13 }} onClick={connectWallet}>
                  Connect Freighter
                </button>
              )}
            </div>

            {walletError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 14 }}>{walletError}</p>}
            {statusMsg && <p style={{ color: '#22A866', fontSize: 13, marginBottom: 14 }}>{statusMsg}</p>}

            {/* Bet amount input */}
            {walletConnected && (
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, opacity: .7 }}>Bet amount (USDC):</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={e => setBetAmount(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.15)',
                    color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 13, width: 100
                  }}
                />
              </div>
            )}

            {/* Market card */}
            {marketState ? (
              <div className="market-card">
                <h3>Market #{marketState.id.toString()}</h3>
                <div className="market-meta">
                  <span>📅 Resolves: {new Date(Number(marketState.resolution_time) * 1000).toLocaleDateString()}</span>
                  <span>📊 {MarketStatus[marketState.status]}</span>
                </div>
                <div style={{ fontSize: 12, opacity: .6, marginBottom: 12 }}>
                  Yes pool: {fromRawAmount(marketState.yes_reserves)} · No pool: {fromRawAmount(marketState.no_reserves)}
                </div>
                <div className="market-outcomes">
                  {(['Yes', 'No'] as const).map((label, i) => (
                    <button
                      key={i}
                      className="outcome-btn"
                      onClick={() => placeBet(i)}
                      disabled={!walletConnected || marketState.status !== MarketStatus.Open}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="market-card" style={{ opacity: .6, textAlign: 'center', padding: 40 }}>
                {walletConnected ? 'Loading market data…' : 'Connect wallet to view live markets'}
              </div>
            )}

            {/* Demo market cards */}
            {[
              { title: 'Fed Rate Decision — March 2025', meta: 'Economics · Closes Mar 20', outcomes: ['No Change (88%)', '25bps Cut (12%)'] },
              { title: 'Super Bowl LX Winner', meta: 'Sports · Closes Feb 8', outcomes: ['Eagles (70%)', 'Chiefs (30%)'] },
              { title: 'BTC above $100K by Q2 2025?', meta: 'Crypto · Closes Jun 30', outcomes: ['Yes (55%)', 'No (45%)'] },
            ].map((m, i) => (
              <div className="market-card" key={i}>
                <h3>{m.title}</h3>
                <div className="market-meta"><span>{m.meta}</span></div>
                <div className="market-outcomes">
                  {m.outcomes.map((o, j) => (
                    <button key={j} className="outcome-btn" onClick={() => walletConnected ? placeBet(j) : connectWallet()}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
