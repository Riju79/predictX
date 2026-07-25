'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import { useWallet } from '@/src/wallet';
import { Outcome, MarketState, MarketStatus } from '@/src/bindings/market';
import BackgroundScene from '@/components/ui/aurora-section-hero';
import { 
  STELLAR_CONFIG, 
  toRawAmount as configToRawAmount, 
  fromRawAmount as configFromRawAmount, 
  getExpirationLedger,
  getMarketClient, 
  getTokenClient 
} from '@/src/config/stellar';

const MARKET_ID = STELLAR_CONFIG.contracts.market;
const TOKEN_ID = STELLAR_CONFIG.contracts.token;
const MARKET_NUMERIC_ID = 0n;

const toRawAmount = (val: string) => configToRawAmount(val);
const fromRawAmount = (val: bigint | number) => configFromRawAmount(val).toFixed(4);

export default function Home() {
  // ── Wallet context ────────────────────────────────────────────────────────
  const wallet = useWallet();
  const walletConnected = wallet.isConnected;
  const publicKey = wallet.publicKey;
  const connectWallet = wallet.connect;
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
  const [sideNavOpen, setSideNavOpen] = useState(false);
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

  // ── Automatic Product Card Deck Slider ────────────────────────────────────
  useEffect(() => {
    const modes: ('trade' | 'managed' | 'funded')[] = ['trade', 'managed', 'funded'];
    const interval = setInterval(() => {
      setProdMode(current => {
        const nextIdx = (modes.indexOf(current) + 1) % modes.length;
        return modes[nextIdx];
      });
    }, 3500);
    return () => clearInterval(interval);
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

  // ── Smooth Scroll (Lenis) ──────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Smooth scroll for internal anchor navigation links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl as HTMLElement, { offset: -60, duration: 1.2 });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  // ── Reveal on scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add('in');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Count-up stats (Page Load + Re-trigger on Cursor Hover) ────────────
  useEffect(() => {
    const runCountUp = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const isDecimal = el.dataset.decimal === 'true';

      if (isNaN(target)) return;

      if (isDecimal) {
        let cur = 0;
        const step = target / 20;
        const tick = () => {
          cur += step;
          if (cur >= target) { el.textContent = prefix + target.toFixed(2) + suffix; return; }
          el.textContent = prefix + cur.toFixed(2) + suffix;
          requestAnimationFrame(tick);
        };
        tick();
        return;
      }

      let cur = 0;
      const step = Math.max(1, target / 40);
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = prefix + Math.round(target) + suffix; return; }
        el.textContent = prefix + Math.floor(cur) + suffix;
        requestAnimationFrame(tick);
      };
      tick();
    };

    const els = document.querySelectorAll<HTMLElement>('.stat .num');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        runCountUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));

    // Re-trigger count-up animation when someone puts cursor on the stat item or number
    const parentStats = document.querySelectorAll<HTMLElement>('.stat');
    const cleanupHandlers: Array<{ target: HTMLElement; handler: () => void }> = [];

    parentStats.forEach(statEl => {
      const numEl = statEl.querySelector<HTMLElement>('.num');
      if (!numEl) return;

      const handler = () => runCountUp(numEl);
      statEl.addEventListener('mouseenter', handler);
      cleanupHandlers.push({ target: statEl, handler });
    });

    return () => {
      io.disconnect();
      cleanupHandlers.forEach(({ target, handler }) => target.removeEventListener('mouseenter', handler));
    };
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



  const loadMarketData = async (pk: string) => {
    try {
      const tokenClient = getTokenClient();
      const balRes = await tokenClient.balance({ id: pk });
      if (balRes && balRes.result !== undefined) {
        setTokenBalance(fromRawAmount(balRes.result as bigint));
      }
    } catch (e: any) {
      if (!e?.message?.includes('Account not found')) {
        console.warn('Error loading token balance:', e);
      }
    }

    try {
      const marketClient = getMarketClient();
      const stateRes = await marketClient.get_market_state({ market_id: MARKET_NUMERIC_ID });
      if (stateRes?.result) {
        setMarketState(stateRes.result as MarketState);
      }
    } catch (e) {
      // Uninitialized on-chain market #0 defaults safely to local state
    }
  };

  const placeBet = async (outcomeIndex: number) => {
    if (!walletConnected) { setWalletError('Connect wallet first.'); return; }
    try {
      setStatusMsg('Submitting bet...');
      const marketClient = getMarketClient(publicKey);
      const tokenClient = getTokenClient(publicKey);
      const raw = toRawAmount(betAmount);
      // Approve the market contract to spend tokens with dynamic ledger expiration
      const expLedger = await getExpirationLedger();
      const approveTx = await tokenClient.approve({
        from: publicKey,
        spender: MARKET_ID,
        amount: raw,
        expiration_ledger: expLedger,
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
      <nav id="mainnav" className={scrolled ? 'scrolled' : ''} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 56px',
        background: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Hamburger Menu Toggle Icon (two horizontal white bars) */}
          <div 
            onClick={() => setSideNavOpen(true)}
            title="Open Menu"
            style={{ display: 'flex', flexDirection: 'column', gap: '5.5px', cursor: 'pointer', padding: '4px' }}
          >
            <div style={{ width: '24px', height: '2.5px', background: '#ffffff', borderRadius: '2px' }} />
            <div style={{ width: '24px', height: '2.5px', background: '#ffffff', borderRadius: '2px' }} />
          </div>

          {/* Left Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#hero" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Home</a>
            <a href="#funded" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Sports</a>
          </div>
        </div>

        {/* Centered App Logo in Top Middle of Hero Section */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <img src="/logo.png" alt="PredictX Logo" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>PredictX</span>
        </div>

        {/* Top Right Launch App Button (Cool Whitish/Bluish Sheen) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link 
            href="/app"
            style={{
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700,
              padding: '9px 24px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 55%, #c7d2fe 100%)',
              border: '1px solid #ffffff',
              color: '#090714',
              boxShadow: '0 0 25px rgba(199, 210, 254, 0.45), 0 4px 15px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.25s ease',
              letterSpacing: '-0.2px'
            }}
          >
            Launch App ➔
          </Link>
        </div>
      </nav>

      {/* ── SIDE POPUP BAR (Product, FAQ, Support - Hero Aesthetic) ── */}
      {sideNavOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setSideNavOpen(false)} 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 200,
              transition: 'all 0.3s ease'
            }} 
          />
          {/* Minimalist Hero-Aesthetic Side Drawer Popup Bar */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '340px',
            maxWidth: '85vw',
            background: '#040308',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '20px 0 60px rgba(0, 0, 0, 0.98), 0 0 40px rgba(124, 58, 237, 0.2)',
            zIndex: 210,
            padding: '44px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px'
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo.png" alt="PredictX Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px', fontFamily: 'Inter, sans-serif' }}>PredictX</span>
              </div>
              <button 
                onClick={() => setSideNavOpen(false)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid rgba(255, 255, 255, 0.12)', 
                  color: '#94a3b8', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>

            {/* Navigation Options in Serif & Clean Aesthetics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
              <a 
                href="#product" 
                onClick={() => setSideNavOpen(false)}
                style={{ 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  fontSize: '28px', 
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 400, 
                  letterSpacing: '-0.5px',
                  transition: 'color 0.2s ease'
                }}
              >
                Product
              </a>

              <a 
                href="#faq" 
                onClick={() => setSideNavOpen(false)}
                style={{ 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  fontSize: '28px', 
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 400, 
                  letterSpacing: '-0.5px',
                  transition: 'color 0.2s ease'
                }}
              >
                FAQ
              </a>

              <a 
                href="mailto:support@predictx.trade" 
                onClick={() => setSideNavOpen(false)}
                style={{ 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  fontSize: '28px', 
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 400, 
                  letterSpacing: '-0.5px',
                  transition: 'color 0.2s ease'
                }}
              >
                Support
              </a>
            </div>

            {/* Bottom Section */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '24px' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Onchain prediction trading powered by Soroban on Stellar.
              </div>
              <Link 
                href="/app"
                onClick={() => setSideNavOpen(false)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 55%, #c7d2fe 100%)',
                  border: '1px solid #ffffff',
                  color: '#090714',
                  textDecoration: 'none',
                  padding: '14px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '15px',
                  boxShadow: '0 0 25px rgba(199, 210, 254, 0.45)',
                  letterSpacing: '-0.2px'
                }}
              >
                Start Trading ➔
              </Link>
            </div>
          </div>
        </>
      )}

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
          <div className="copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ 
              fontFamily: 'Fraunces, serif', 
              fontWeight: 400, 
              fontSize: 'clamp(64px, 8.5vw, 115px)', 
              color: '#ffffff', 
              lineHeight: 0.98, 
              letterSpacing: '-2px',
              margin: '0 0 24px 0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span>Trade</span>
              <span>Everything</span>
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '15px', fontWeight: 400, marginBottom: '32px', flexWrap: 'wrap' }}>
              <span>Backed by</span>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#ffffff', 
                color: '#000000', 
                fontWeight: 900, 
                fontSize: '12px', 
                padding: '3px 8px', 
                borderRadius: '6px',
                lineHeight: 1,
                letterSpacing: '-0.3px'
              }}>
                Stellar
              </span>
              <span>the same team behind</span>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', 
                color: '#ffffff', 
                fontWeight: 800, 
                fontSize: '12px', 
                padding: '3px 8px', 
                borderRadius: '6px',
                lineHeight: 1,
                letterSpacing: '-0.3px',
                boxShadow: '0 0 12px rgba(124, 58, 237, 0.4)'
              }}>
                Soroban
              </span>
            </div>

            <div>
              <Link 
                href="/app" 
                style={{ 
                  textDecoration: 'none', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  padding: '12px 28px', 
                  borderRadius: '9999px',
                  background: 'linear-gradient(180deg, #044e39 0%, #022c22 100%)',
                  border: '1.5px solid #10b981',
                  color: '#ffffff',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.25s ease'
                }}
              >
                Start trading
              </Link>
            </div>
          </div>
            {/* Ambient Purple Light Pillar behind phone */}
            <div style={{
              position: 'absolute',
              width: '440px',
              height: '640px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.55) 0%, rgba(99, 102, 241, 0.25) 45%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
              zIndex: 1
            }} />

            {/* Device Frame Container with Synchronized Floating Motion */}
            <style>{`
              @keyframes mobileFloatSync {
                0% {
                  transform: translateY(0px) rotate(0deg);
                }
                33% {
                  transform: translateY(-16px) rotate(1.2deg);
                }
                66% {
                  transform: translateY(12px) rotate(-1deg);
                }
                100% {
                  transform: translateY(0px) rotate(0deg);
                }
              }
            `}</style>
            <div style={{ 
              position: 'relative', 
              zIndex: 10, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              animation: 'mobileFloatSync 14s ease-in-out infinite'
            }}>
              {/* Titanium Borderless iPhone Device Frame */}
              <div style={{
                width: '270px',
                height: '535px',
                borderRadius: '42px',
                background: '#09070e',
                border: '2.5px solid #272136',
                boxShadow: '0 25px 65px rgba(0, 0, 0, 0.95), 0 0 35px rgba(124, 58, 237, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                padding: '12px 10px 10px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10
              }}>
                {/* Dynamic Island Notch */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '82px',
                  height: '20px',
                  background: '#000000',
                  borderRadius: '20px',
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '0 6px'
                }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1c1829' }} />
                </div>

                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 12px 6px', fontSize: '10px', fontWeight: 600, color: '#ffffff', opacity: 0.8 }}>
                  <span>9:41</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '9px' }}>
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Phone Screen App Interface */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 8px' }}>
                  {/* Brand Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                    <img src="/logo.png" alt="PredictX Logo" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', fontFamily: 'Inter, sans-serif' }}>PredictX</span>
                  </div>

                  {/* Main Balance Display */}
                  <div style={{ textAlign: 'center', marginTop: '4px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>$100,000</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>▲</span> +12.4% Today
                    </div>
                  </div>

                  {/* Live Line Chart SVG */}
                  <div style={{ width: '100%', height: '80px', position: 'relative', margin: '4px 0' }}>
                    <svg viewBox="0 0 240 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Gradient Fill under Curve */}
                      <path 
                        d="M 0 55 Q 30 60, 60 35 T 120 40 T 180 20 T 240 10 L 240 80 L 0 80 Z" 
                        fill="url(#chartGlow)" 
                      />
                      {/* Vibrant Green Curve Line */}
                      <path 
                        d="M 0 55 Q 30 60, 60 35 T 120 40 T 180 20 T 240 10" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>

                  {/* PredictX Market Holdings List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    {/* Item 1: Sports */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px' }}>⚽</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>Sports Trading</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399' }}>$12,740</span>
                    </div>

                    {/* Item 2: Funded Account */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px' }}>🏆</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>Funded Account</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399' }}>$90,000</span>
                    </div>

                    {/* Item 3: Prediction Markets */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px' }}>⚡</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>Prediction Pools</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399' }}>$5,420</span>
                    </div>
                  </div>

                  {/* Bottom Navigation Dock */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', background: '#000000', padding: '8px', borderRadius: '24px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '12px', opacity: 0.5 }}>🏠</span>
                    <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '2px 10px', borderRadius: '12px' }}>📈</span>
                    <span style={{ fontSize: '12px', opacity: 0.5 }}>🔍</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* ── FUNDED / SPORTS SECTION ── */}
      <section id="funded">
        <div className="funded">
          <div className="funded-grid">
            <div className="reveal reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '560px' }}>
              <div>
                <h2 style={{ 
                  fontSize: 'clamp(40px, 5.2vw, 68px)', 
                  fontWeight: 400, 
                  color: '#e2e8f0', 
                  letterSpacing: '-1px', 
                  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
                  lineHeight: 1.12,
                  margin: '0 0 16px 0'
                }}>
                  Pred<span style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{
                      position: 'absolute',
                      top: '0.04em',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0.34em',
                      height: '0.34em',
                      backgroundColor: '#7c3aed',
                      borderRadius: '50%',
                      boxShadow: '0 0 12px #8b5cf6, 0 0 24px #a855f7',
                      zIndex: 3
                    }} />
                    i
                  </span>ct & trade global sports
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 400, margin: 0, lineHeight: 1.5 }}>
                  Back your favorite teams, predict match outcomes, and trade live odds settled instantly on Stellar.
                </p>
              </div>

              <div style={{ marginTop: '4px' }}>
                <Link 
                  href="/app?category=Sports" 
                  className="funded-btn" 
                  style={{ 
                    textDecoration: 'none', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    padding: '12px 28px', 
                    borderRadius: '9999px',
                    background: 'linear-gradient(180deg, #044e39 0%, #022c22 100%)',
                    border: '1.5px solid #10b981',
                    color: '#34d399',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Predict Sports Now ➔
                </Link>
              </div>

              <ul className="perks" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', margin: '8px 0 0 0', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#cbd5e1', fontSize: '15px', fontWeight: 500 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: '#94a3b8', flexShrink: 0 }}>
                    <path d="M23 6l-9.5 9.5-5-5L1 18" />
                    <path d="M17 6h6v6" />
                  </svg>
                  Predict Premier League, NBA, Champions League & more
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#cbd5e1', fontSize: '15px', fontWeight: 500 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: '#94a3b8', flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Real-time decentralized odds & transparent pools
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#cbd5e1', fontSize: '15px', fontWeight: 500 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: '#94a3b8', flexShrink: 0 }}>
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M6 12h.01M18 12h.01" />
                  </svg>
                  Instant onchain payouts directly to your wallet
                </li>
              </ul>
            </div>

            <div className="particle-wrap reveal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                width={650} 
                height={650} 
                style={{ 
                  maxWidth: '125%', 
                  maxHeight: '580px', 
                  objectFit: 'contain',
                  transform: 'scale(1.25)',
                  filter: 'drop-shadow(0 0 45px rgba(16, 185, 129, 0.5))'
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
          <div className="tab-phone-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Titanium iPhone Hardware Shell */}
            <div style={{
              width: '310px',
              minHeight: '565px',
              borderRadius: '44px',
              background: '#47515C',
              border: '3px solid #687482',
              boxShadow: '0 28px 70px -10px rgba(15, 23, 42, 0.48), 0 0 22px rgba(0,0,0,0.16)',
              padding: '9px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Titanium Hardware Side Buttons */}
              <div style={{ position: 'absolute', left: '-5px', top: '80px', width: '3px', height: '22px', background: '#5B6673', borderRadius: '2px 0 0 2px' }} />
              <div style={{ position: 'absolute', left: '-5px', top: '115px', width: '3px', height: '38px', background: '#5B6673', borderRadius: '2px 0 0 2px' }} />
              <div style={{ position: 'absolute', left: '-5px', top: '160px', width: '3px', height: '38px', background: '#5B6673', borderRadius: '2px 0 0 2px' }} />
              <div style={{ position: 'absolute', right: '-5px', top: '115px', width: '3px', height: '55px', background: '#5B6673', borderRadius: '0 2px 2px 0' }} />

              {/* iPhone Inner Screen Display (Exact Slate Grey Palette from Screenshot) */}
              <div style={{
                width: '100%',
                height: '100%',
                flex: 1,
                borderRadius: '34px',
                background: 'linear-gradient(180deg, #4A5560 0%, #39424B 35%, #293037 100%)',
                padding: '8px 12px 14px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                color: '#FFFFFF'
              }}>
                {/* iPhone Dynamic Island & Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '24px', marginBottom: '6px', padding: '0 6px', zIndex: 30 }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>9:41</span>
                  {/* Dynamic Island Notch */}
                  <div style={{ width: '88px', height: '22px', background: '#000000', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#102A45', border: '1px solid #1E3A5F' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#FFFFFF' }}>
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Floating Top Notification Pill */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '14px',
                  padding: '7px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src="/logo.png" alt="PredictX" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#CBD5E1', fontWeight: 600 }}>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>PredictX</span>
                      <span>9:41 AM</span>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      Soroban Testnet: BTC-PERP Trade Executed
                    </div>
                  </div>
                </div>

                {/* Tab Content inside iPhone screen */}
                <div className={`tab-panel${activeTab === 0 ? ' active' : ''}`} style={{ flex: 1, display: activeTab === 0 ? 'flex' : 'none', flexDirection: 'column' }}>
                  {/* Asset Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#B2BDC8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        BTC · PERPETUAL
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', marginTop: '1px' }}>
                        Bitcoin Perpetual
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace', marginTop: '1px' }}>
                        $96,480.50
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22C55E', fontSize: '11px', fontWeight: 800, marginTop: '1px' }}>
                        <span>▲ 5.21%</span>
                        <span style={{ color: '#B2BDC8', fontWeight: 600, fontSize: '10px' }}>Today</span>
                      </div>
                    </div>

                    {/* Top Right Circular Asset Icon */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                      fontSize: '18px',
                      fontWeight: 900,
                      color: '#000000'
                    }}>
                      ₿
                    </div>
                  </div>

                  {/* Smooth Green Area Line Chart */}
                  <div style={{ position: 'relative', width: '100%', height: '80px', margin: '8px 0 6px' }}>
                    <svg width="100%" height="80" viewBox="0 0 260 80" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="exactPhonePerpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon fill="url(#exactPhonePerpGradient)" points="0,55 25,45 50,50 80,30 110,35 140,16 170,20 200,8 230,12 260,2 260,80 0,80" />
                      <polyline fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points="0,55 25,45 50,50 80,30 110,35 140,16 170,20 200,8 230,12 260,2" />
                      {/* Circle Dot at Current Peak */}
                      <circle cx="260" cy="2" r="3.5" fill="#22C55E" stroke="#000000" strokeWidth="1.2" />
                    </svg>
                  </div>

                  {/* Your PNL */}
                  <div style={{ marginTop: '2px' }}>
                    <div style={{ fontSize: '10px', color: '#B2BDC8', fontWeight: 600 }}>Your PNL</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#22C55E', letterSpacing: '-0.5px', marginTop: '1px' }}>
                      ▲ 50.21% <span style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E' }}>Today</span>
                    </div>
                  </div>

                  {/* Multiplier & Purple Slider Bar */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#B2BDC8', fontWeight: 600 }}>Multiplier</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', marginTop: '1px' }}>
                      x10
                    </div>

                    {/* Exact Purple Slider Track & Pill Knob */}
                    <div style={{ position: 'relative', width: '100%', height: '5px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.15)', marginTop: '6px' }}>
                      <div style={{ width: '42%', height: '100%', borderRadius: '3px', background: '#7700ED' }} />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '42%',
                        transform: 'translate(-50%, -50%)',
                        width: '18px',
                        height: '12px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.4)'
                      }} />
                    </div>
                    <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '3px', fontWeight: 600 }}>
                      x1
                    </div>
                  </div>

                  {/* Link Button */}
                  <Link href="/app?tab=perps" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto', padding: '8px', background: '#22C55E', color: '#000000', borderRadius: '9px', fontSize: '12px', fontWeight: 900, textDecoration: 'none', boxShadow: '0 3px 12px rgba(34,197,94,0.3)' }}>
                    Trade Real Perps Terminal ➔
                  </Link>
                </div>
                <div className={`tab-panel${activeTab === 1 ? ' active' : ''}`} style={{ display: activeTab === 1 ? 'flex' : 'none', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                  {/* Market Card 1 */}
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '12px' }}>🗳️</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Elections</span>
                      </div>
                      <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 600 }}>Nov 2028</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px', lineHeight: 1.3 }}>US Presidential Election 2028: Democratic Nominee</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[{ name: 'Kamala Harris', prob: 42 }, { name: 'Gavin Newsom', prob: 28 }, { name: 'Michelle Obama', prob: 18 }].map((o, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#1E2430', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0, border: '1px solid #2B3242' }}>{o.name.charAt(0)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: '#E2E8F0', fontWeight: 600, marginBottom: '2px' }}>{o.name}</div>
                            <div style={{ width: '100%', height: '2px', background: '#1E2532', borderRadius: '1px' }}>
                              <div style={{ width: `${o.prob}%`, height: '100%', background: i === 0 ? '#10B981' : '#3B82F6', borderRadius: '1px' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', minWidth: '26px', textAlign: 'right' }}>{o.prob}%</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', marginTop: '7px', fontSize: '9px', color: '#64748B' }}>$45M vol</div>
                  </div>

                  {/* Market Card 2 */}
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '12px' }}>🏀</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sports</span>
                      </div>
                      <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 600 }}>Jun 2026</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px', lineHeight: 1.3 }}>NBA Championship 2026 Winner</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[{ name: 'Boston Celtics', prob: 35 }, { name: 'OKC Thunder', prob: 30 }, { name: 'Denver Nuggets', prob: 20 }].map((o, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#1E2430', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0, border: '1px solid #2B3242' }}>{o.name.charAt(0)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: '#E2E8F0', fontWeight: 600, marginBottom: '2px' }}>{o.name}</div>
                            <div style={{ width: '100%', height: '2px', background: '#1E2532', borderRadius: '1px' }}>
                              <div style={{ width: `${o.prob}%`, height: '100%', background: i === 0 ? '#10B981' : '#3B82F6', borderRadius: '1px' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', minWidth: '26px', textAlign: 'right' }}>{o.prob}%</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', marginTop: '7px', fontSize: '9px', color: '#64748B' }}>$24M vol</div>
                  </div>

                  {/* CTA */}
                  <Link href="/app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px', padding: '9px', background: 'linear-gradient(135deg, #7700ED 0%, #4F46E5 100%)', color: '#fff', borderRadius: '9px', fontSize: '11px', fontWeight: 900, textDecoration: 'none', boxShadow: '0 0 12px rgba(119,0,237,0.3)' }}>
                    Explore All Prediction Markets ➔
                  </Link>
                </div>
                <div className={`tab-panel${activeTab === 2 ? ' active' : ''}`} style={{ display: activeTab === 2 ? 'flex' : 'none', flexDirection: 'column', gap: '8px', flex: 1 }}>

                  {/* Agent Card 1 */}
                  <div style={{ background: 'rgba(119,0,237,0.1)', border: '1px solid rgba(119,0,237,0.3)', borderRadius: '12px', padding: '10px 11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '8px', background: 'linear-gradient(135deg, #7700ED, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🤖</div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF' }}>AlphaQuant-AI #104</div>
                          <div style={{ fontSize: '8px', color: '#A78BFA', fontWeight: 600 }}>Autonomous · Soroban</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '8px', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>● ACTIVE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>+34.8%</div>
                        <div style={{ fontSize: '8px', color: '#64748B' }}>APY · 28 days</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>128.4K XLM</div>
                        <div style={{ fontSize: '8px', color: '#64748B' }}>Vault TVL</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '7px', padding: '6px 8px', fontSize: '9px', color: '#CBD5E1', lineHeight: 1.5 }}>
                      <span style={{ color: '#A78BFA', fontWeight: 700 }}>Strategy: </span>Rebalances perps every 4h via Soroban price feeds. Auto-hedges if drawdown &gt; 3.5%
                    </div>
                  </div>

                  {/* Agent Card 2 */}
                  <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '12px', padding: '10px 11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>⚡</div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF' }}>MomentumBot #22</div>
                          <div style={{ fontSize: '8px', color: '#60A5FA', fontWeight: 600 }}>Trend-Follow · Soroban</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '8px', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>● ACTIVE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>+21.3%</div>
                        <div style={{ fontSize: '8px', color: '#64748B' }}>APY · 14 days</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>74.1K XLM</div>
                        <div style={{ fontSize: '8px', color: '#64748B' }}>Vault TVL</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '7px', padding: '6px 8px', fontSize: '9px', color: '#CBD5E1', lineHeight: 1.5 }}>
                      <span style={{ color: '#60A5FA', fontWeight: 700 }}>Strategy: </span>Follows BTC momentum signals. Exits positions on RSI divergence above 72
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href="/app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px', padding: '9px', background: 'linear-gradient(135deg, #7700ED 0%, #4F46E5 100%)', color: '#fff', borderRadius: '9px', fontSize: '11px', fontWeight: 900, textDecoration: 'none', boxShadow: '0 0 12px rgba(119,0,237,0.3)' }}>
                    Deploy Autonomous Agent ➔
                  </Link>
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
          <div style={{
            background: 'linear-gradient(135deg, #81A8D3 0%, #6B98C7 100%)',
            borderRadius: '28px',
            padding: '40px 20px',
            minHeight: '520px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.08), 0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              position: 'relative',
              width: '320px',
              height: '430px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {[
                { mode: 'trade' as const, tag: '1 · TRADE', title: 'PREDICTX', desc: 'Trade perpetuals, prediction markets, and spot — all from one order book.' },
                { mode: 'managed' as const, tag: '2 · MANAGED', title: 'PREDICTX', desc: 'Use investment agents to automate any investing thesis.' },
                { mode: 'funded' as const, tag: '3 · FUNDED', title: 'PREDICTX', desc: 'Get funded up to $100,000 and keep up to 90% of profits.' },
              ].map((card, i) => {
                const modesList = ['trade', 'managed', 'funded'];
                const activeIdx = modesList.indexOf(prodMode);
                const diff = i - activeIdx;
                
                const isActive = diff === 0;
                const translateX = diff * 115;
                const scale = isActive ? 1.0 : Math.abs(diff) === 1 ? 0.86 : 0.74;
                const zIndex = isActive ? 10 : 10 - Math.abs(diff);
                const opacity = isActive ? 1.0 : 0.62;

                return (
                  <div
                    key={card.mode}
                    onClick={() => setProdMode(card.mode)}
                    style={{
                      position: 'absolute',
                      width: '310px',
                      height: '420px',
                      borderRadius: '26px',
                      background: 'radial-gradient(ellipse at 50% 20%, #152535 0%, #070C13 100%)',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      zIndex,
                      opacity,
                      boxShadow: isActive 
                        ? '0 30px 60px -15px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 0, 0, 0.3)' 
                        : '0 15px 30px rgba(0, 0, 0, 0.4)',
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, z-index 0.4s ease',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Top Label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 8px #ffffff' }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {card.title}
                      </span>
                    </div>

                    {/* 3D Glass Graphic & Glowing Purple Dot */}
                    <div style={{ position: 'relative', width: '100%', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {/* Pedestal Base */}
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        width: '180px',
                        height: '100px',
                        borderRadius: '20px',
                        background: 'linear-gradient(180deg, #1C2B3A 0%, #0A121A 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.5)'
                      }}>
                        <div style={{
                          width: '140px',
                          height: '50px',
                          margin: '10px auto 0',
                          borderRadius: '50%',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 80%)'
                        }} />
                      </div>

                      {/* Floating Glassmorphic Ring Artwork */}
                      <div style={{
                        position: 'relative',
                        width: '130px',
                        height: '130px',
                        marginBottom: '40px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.03) 70%)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.2)',
                        transform: 'perspective(500px) rotateX(40deg) rotateZ(-15deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '65px',
                          height: '65px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.35)',
                          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 80%)'
                        }} />
                      </div>

                      {/* Glowing Purple Dot Floating Beside 3D Ring */}
                      <div style={{
                        position: 'absolute',
                        right: '25px',
                        top: '40px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#7700ED',
                        boxShadow: '0 0 20px 6px rgba(119,0,237,0.85), 0 0 8px #ffffff'
                      }} />
                    </div>

                    {/* Bottom Caption Pill & Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
                      <div>
                        <div style={{
                          background: '#FFFFFF',
                          color: '#000000',
                          padding: '6px 14px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: 900,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          display: 'inline-block',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                        }}>
                          {card.tag}
                        </div>
                      </div>
                      <p style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        lineHeight: 1.35,
                        margin: 0,
                        letterSpacing: '-0.3px'
                      }}>
                        {card.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="snapshot-label">PERFORMANCE SNAPSHOT</div>
        <div className="stats-row">
          <div className="stat"><div className="num" data-count="150" data-suffix="+">0</div><div className="lbl">COUNTRIES AVAILABLE</div></div>
          <div className="stat"><div className="num" data-count="200" data-suffix="ms">0</div><div className="lbl">FASTEST EXECUTION</div></div>
          <div className="stat"><div className="num" data-count="0.01" data-prefix="$" data-decimal="true">$0.00</div><div className="lbl">MINIMUM ORDER SIZE</div></div>
          <div className="stat"><div className="num" data-count="50" data-suffix="x">0</div><div className="lbl">LEVERAGE POSITIONS UP TO</div></div>
          <div className="stat"><div className="num" data-count="100" data-suffix="%">0</div><div className="lbl">HISTORICAL UPTIME</div></div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="trust reveal">
        <div className="audited"><span className="check">✓</span> AUDITED BY INDEPENDENT SECURITY FIRM</div>
        <div className="sub">SECURING THE MOST TRUSTED STELLAR PROTOCOLS</div>
        <div className="logo-row-marquee">
          <div className="logo-track">
            {[
              { name: 'SOROBAN', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="currentColor"/></svg> },
              { name: 'BLEND', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6L11 12L4 18M20 6L13 12L20 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { name: 'AQUARIUS', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 5 10.5 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10.5 12 3 12 3Z" fill="currentColor"/></svg> },
              { name: 'ULTRA', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/></svg> },
              { name: 'STELLARX', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5"/><path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> },
              { name: 'ANCHOR', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="currentColor" strokeWidth="2.5"/><path d="M12 7.5V20M12 20C7 20 5 15 5 15M12 20C17 20 19 15 19 15M8 12H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> },
              { name: 'LOBSTR', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 9V17L12 21L20 17V9L12 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2"/></svg> },
              { name: 'PHOENIX', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 14.5 6.5 14.5 9.5C14.5 10.88 13.88 12 13 13C15 13 18 11.5 18 8C18 14 13.5 19 12 22C10.5 19 6 14 6 8C6 11.5 9 13 11 13C10.12 12 9.5 10.88 9.5 9.5C9.5 6.5 12 2 12 2Z" fill="currentColor"/></svg> }
            ].concat(
              { name: 'SOROBAN', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="currentColor"/></svg> },
              { name: 'BLEND', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6L11 12L4 18M20 6L13 12L20 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { name: 'AQUARIUS', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 5 10.5 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10.5 12 3 12 3Z" fill="currentColor"/></svg> },
              { name: 'ULTRA', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/></svg> },
              { name: 'STELLARX', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5"/><path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> },
              { name: 'ANCHOR', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="currentColor" strokeWidth="2.5"/><path d="M12 7.5V20M12 20C7 20 5 15 5 15M12 20C17 20 19 15 19 15M8 12H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> },
              { name: 'LOBSTR', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 9V17L12 21L20 17V9L12 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2"/></svg> },
              { name: 'PHOENIX', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 14.5 6.5 14.5 9.5C14.5 10.88 13.88 12 13 13C15 13 18 11.5 18 8C18 14 13.5 19 12 22C10.5 19 6 14 6 8C6 11.5 9 13 11 13C10.12 12 9.5 10.88 9.5 9.5C9.5 6.5 12 2 12 2Z" fill="currentColor"/></svg> }
            ).concat(
              { name: 'SOROBAN', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="currentColor"/></svg> },
              { name: 'BLEND', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6L11 12L4 18M20 6L13 12L20 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { name: 'AQUARIUS', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 5 10.5 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10.5 12 3 12 3Z" fill="currentColor"/></svg> },
              { name: 'ULTRA', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/></svg> },
              { name: 'STELLARX', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5"/><path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> },
              { name: 'ANCHOR', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="currentColor" strokeWidth="2.5"/><path d="M12 7.5V20M12 20C7 20 5 15 5 15M12 20C17 20 19 15 19 15M8 12H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> },
              { name: 'LOBSTR', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 9V17L12 21L20 17V9L12 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2"/></svg> },
              { name: 'PHOENIX', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 14.5 6.5 14.5 9.5C14.5 10.88 13.88 12 13 13C15 13 18 11.5 18 8C18 14 13.5 19 12 22C10.5 19 6 14 6 8C6 11.5 9 13 11 13C10.12 12 9.5 10.88 9.5 9.5C9.5 6.5 12 2 12 2Z" fill="currentColor"/></svg> }
            ).map((p, idx) => (
              <div key={idx} className="protocol-item">
                <span className="protocol-icon">{p.svg}</span>
                <span className="protocol-name">{p.name}</span>
              </div>
            ))}
          </div>
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
            Start trading ➔
          </Link>
        </div>
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ flex: 1, minWidth: '260px', margin: 0 }}>Risk warning: Perpetual and prediction-market trading, especially with leverage, is high risk. Losses may exceed deposits. This is not investment advice. Results are not guaranteed.</p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer', userSelect: 'none'
          }}>
            <img src="/logo.png" alt="PredictX Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'invert(1)' }} />
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#000000', letterSpacing: '-0.4px', fontFamily: 'Inter, sans-serif' }}>PredictX</span>
          </div>
        </div>
      </footer>
    </>
  );
}
