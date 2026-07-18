'use client';

import React from 'react';

interface EntityLogoProps {
  name: string;
  className?: string;
  size?: number;
}

export default function EntityLogo({ name, className = '', size = 32 }: EntityLogoProps) {
  const normName = name.toLowerCase().trim();

  // Consistently styled high-quality circular wrapper or pure SVGs
  const renderSVG = () => {
    switch (normName) {
      // --- CRYPTO ---
      case 'btc':
      case 'bitcoin':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="fill-[#F7931A]">
            <circle cx="16" cy="16" r="16" />
            <path d="M22.7 14.5c.3-2.1-1.3-3.2-3.5-3.9l.7-2.9h-1.8l-.7 2.8c-.5-.1-1-.2-1.5-.3l.7-2.9h-1.8l-.7 2.8c-.4-.1-.8-.2-1.2-.2l-2.5-.6v1.8s1.3.3 1.3.3c.7.2.9.6.8 1l-.8 3.3c.1 0 .1.1.2.1v-.1l1.3 5c-.1.3-.4.7-1 .5 0 0-1.3-.3-1.3-.3l-1.2 2.7 2.4.6c.4.1.9.2 1.3.3l-.7 3h1.8l.7-2.9c.5.1 1 .2 1.5.2l-.7 2.9h1.8l.7-2.8c3 .6 5.3.3 6.2-2.4.8-2.2-.1-3.5-1.7-4.3 1.2-.3 2.1-1.1 2.3-2.8zm-4.1 6c-.5 2.2-4.1 1-5.3.7l.9-3.8c1.2.3 4.9.9 4.4 3.1zm.5-6.2c-.5 2-3.5 1-4.5.7l.8-3.4c1 .2 4.2.7 3.7 2.7z" fill="#FFF"/>
          </svg>
        );
      case 'eth':
      case 'ethereum':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#627EEA" />
            <path d="M16 4.5v9l7.5-3.4L16 4.5z" fill="#FFF" fillOpacity="0.8"/>
            <path d="M16 4.5L8.5 10.1l7.5 3.4v-9z" fill="#FFF" fillOpacity="0.6"/>
            <path d="M16 21.6v5.9l7.5-10.5-7.5 4.6z" fill="#FFF" fillOpacity="0.8"/>
            <path d="M16 27.5v-5.9L8.5 17l7.5 10.5z" fill="#FFF" fillOpacity="0.6"/>
            <path d="M16 20.3l7.5-4.7-7.5-3.4v8.1z" fill="#FFF" fillOpacity="0.95"/>
            <path d="M16 12.2L8.5 15.6l7.5 4.7v-8.1z" fill="#FFF" fillOpacity="0.75"/>
          </svg>
        );
      case 'sol':
      case 'solana':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#000" />
            <g>
              <linearGradient id="solGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00FFA3" />
                <stop offset="50%" stopColor="#854BFE" />
                <stop offset="100%" stopColor="#DC1FFF" />
              </linearGradient>
              <path d="M7 21h18l-4 4H7v-4zM25 11H7l4-4h18l-4 4zm0 5H7l4 4h18l-4-4z" fill="url(#solGrad)" />
            </g>
          </svg>
        );
      case 'xlm':
      case 'stellar':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#09090B" stroke="#232323" strokeWidth="1" />
            <path d="M22.5 10.5c-.5-1-1.6-1.5-2.8-1.2l-3.3.9-3.3-.9c-1.2-.3-2.3.2-2.8 1.2-.5 1-.2 2.3.6 3l2.8 2.2-1.2 3.6c-.4 1.2 0 2.4 1 3.1.5.3 1.1.5 1.7.5s1.2-.2 1.7-.5l3.2-2.3 3.2 2.3c.5.3 1.1.5 1.7.5.6 0 1.2-.2 1.7-.5 1-.7 1.4-1.9 1-3.1l-1.2-3.6 2.8-2.2c.8-.7 1.1-2 .6-3z" fill="#FFF"/>
            <path d="M16 11.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" fill="#14F195"/>
          </svg>
        );
      case 'xrp':
      case 'ripple':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#23292F"/>
            <path d="M16 7.5L8.5 15h15L16 7.5zM8.5 17l7.5 7.5 7.5-7.5H8.5z" fill="#FFF"/>
          </svg>
        );

      // --- TECH ---
      case 'apple':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#000" stroke="#232323" strokeWidth="1" />
            <path d="M19.9 13.9c-.1-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.2.7-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1 8.5.7 1 1.5 2.1 2.6 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.8-2.2-3.3zm-2.9-7.9c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2z" fill="#FFF"/>
          </svg>
        );
      case 'google':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#FFF" />
            <path d="M22.5 16.3c0-.5-.1-1-.2-1.5H16v2.8h3.7c-.2.9-.7 1.7-1.4 2.2v1.8h2.3c1.4-1.3 2.2-3.1 2.2-5.3z" fill="#4285F4"/>
            <path d="M16 23c1.9 0 3.5-.6 4.7-1.7l-2.3-1.8c-.6.4-1.4.7-2.4.7-1.8 0-3.4-1.2-4-2.9H9.6v1.9c1.2 2.4 3.7 3.8 6.4 3.8z" fill="#34A853"/>
            <path d="M12 17.3c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5V12.4H9.6c-.7 1.4-1.1 3-1.1 4.6s.4 3.2 1.1 4.6l2.4-1.9z" fill="#FBBC05"/>
            <path d="M16 11.8c1 0 2 .4 2.7 1.1l2-2c-1.3-1.2-3-1.9-4.7-1.9-2.7 0-5.2 1.4-6.4 3.8l2.4 1.9c.6-1.7 2.2-2.9 4-2.9z" fill="#EA4335"/>
          </svg>
        );
      case 'microsoft':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#1C1C1E"/>
            <g transform="translate(7, 7)">
              <rect x="0" y="0" width="8" height="8" fill="#F25022"/>
              <rect x="10" y="0" width="8" height="8" fill="#7FBA00"/>
              <rect x="0" y="10" width="8" height="8" fill="#00A4EF"/>
              <rect x="10" y="10" width="8" height="8" fill="#FFB900"/>
            </g>
          </svg>
        );
      case 'openai':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#10A37F" />
            <path d="M21.7 14.5c.3-.8.2-1.7-.3-2.3-.5-.7-1.4-1-2.2-.9.2-.8.1-1.7-.4-2.4-.6-.7-1.5-1-2.4-.8-.3-.8-.9-1.4-1.7-1.7-.9-.4-1.9-.3-2.6.2-.8-.3-1.7-.2-2.3.3-.7.5-1 1.4-.9 2.2-.8-.2-1.7-.1-2.4.4-.7.6-1 1.5-.8 2.4-.8.3-1.4.9-1.7 1.7-.4.9-.3 1.9.2 2.6-.3.8-.2 1.7.3 2.3.5.7 1.4 1 2.2.9-.2.8-.1 1.7.4 2.4.6.7 1.5 1 2.4.8.3.8.9 1.4 1.7 1.7.9.4 1.9.3 2.6-.2.8.3 1.7.2 2.3-.3.7-.5 1-1.4.9-2.2.8.2 1.7.1 2.4-.4.7-.6 1-1.5.8-2.4.8-.3 1.4-.9 1.7-1.7.4-.9.3-1.9-.2-2.6zM16 11.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5zm0 9c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" fill="#FFF"/>
          </svg>
        );
      case 'nvidia':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#000" />
            <path d="M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S21.5 6 16 6zm0 18.2c-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2c2.2 0 4.3.9 5.8 2.4l-1.8 1.8c-1-.9-2.4-1.5-4-1.5-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c1.6 0 3-.6 4-1.5l1.8 1.8c-1.5 1.5-3.6 2.4-5.8 2.4z" fill="#76B900"/>
          </svg>
        );

      // --- SPORTS ---
      case 'arsenal':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#EF0107" />
            {/* Cannon silhouette */}
            <path d="M9 18h8v2h-8zm6-4h4v2h-4zm2 2h4v2h-4zm5-1.5L24 16l-2 1.5v-3z" fill="#FFF"/>
            <path d="M7 11h18v2H7zm0 8h18v2H7z" fill="#F0E800" opacity="0.4"/>
          </svg>
        );
      case 'real madrid':
      case 'realmadrid':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#FFF" stroke="#FEBE10" strokeWidth="1.5" />
            {/* Diagonal stripe */}
            <line x1="8" y1="24" x2="24" y2="8" stroke="#00529F" strokeWidth="4" />
            <circle cx="16" cy="16" r="6" fill="none" stroke="#FEBE10" strokeWidth="1.5" />
            {/* Crown */}
            <path d="M12 7l2 2.5h4L20 7l-1 4H13z" fill="#FEBE10"/>
          </svg>
        );
      case 'manchester city':
      case 'mancity':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#6CABDD" />
            <circle cx="16" cy="16" r="11" fill="#FFF" opacity="0.3"/>
            {/* Ship */}
            <path d="M12 12h8l-1.5 3h-5zm-1 4h10l-2 3h-6z" fill="#FFF"/>
          </svg>
        );
      case 'barcelona':
      case 'barca':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#004D98" />
            {/* Barca vertical red stripes */}
            <rect x="10" y="4" width="3" height="24" fill="#A50044" />
            <rect x="19" y="4" width="3" height="24" fill="#A50044" />
            {/* Yellow cross/details */}
            <path d="M12 10h8v2h-8zm3-4v10h2V6z" fill="#EDBB00" opacity="0.8"/>
          </svg>
        );

      // --- FINANCE ---
      case 'tesla':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#E82127"/>
            <path d="M10 10h12c-2 2-4 2.5-6 4.5v7h-2v-7c-2-2-4-2.5-6-4.5zm0-2.5c4 .5 8 .5 12 0-2 1-4 1.5-6 1.5s-4-.5-6-1.5z" fill="#FFF"/>
          </svg>
        );
      case 'amazon':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#000" />
            {/* Smile logo */}
            <path d="M9 20c3.5 3 10.5 3 14 0" fill="none" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M22 17l2 3.5-3.5-1" fill="#FF9900"/>
          </svg>
        );
      case 'meta':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#0064E0" />
            {/* Infinity loop */}
            <path d="M16 13.5c-2-2.5-5.5-2.5-7.5 0-2 2.5-2 6.5 0 9 2 2.5 5.5 2.5 7.5 0 2 2.5 5.5 2.5 7.5 0 2-2.5 2-6.5 0-9-2-2.5-5.5-2.5-7.5 0zm-5 5.5c-.8-1-1-2.5 0-3.5.8-1 2.2-1 3 0 1.2 1.5 1.2 3.5 0 5-.8 1-2.2 1-3 0zm10 0c-.8 1-2.2 1-3 0-1.2-1.5-1.2-3.5 0-5 .8-1 2.2-1 3 0 .8 1 1 2.5 0 3.5z" fill="#FFF"/>
          </svg>
        );
      case 'netflix':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#000" />
            <path d="M10 8h3.5l5 12V8H22v16h-3.5l-5-12V24H10z" fill="#E50914" />
          </svg>
        );

      // --- POLITICS ---
      case 'democrat':
      case 'democrats':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#00AEF3" />
            {/* Stylized D or Donkey shape */}
            <text x="16" y="22" fill="#FFF" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">D</text>
          </svg>
        );
      case 'republican':
      case 'republicans':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size}>
            <circle cx="16" cy="16" r="16" fill="#E81B23" />
            {/* Stylized R or Elephant shape */}
            <text x="16" y="22" fill="#FFF" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">R</text>
          </svg>
        );

      default:
        // Generic Placeholder Circle with letter initials
        const initial = name ? name.slice(0, 2).toUpperCase() : 'PX';
        return (
          <div 
            style={{ width: size, height: size }}
            className={`rounded-full bg-gradient-to-tr from-[#14F195] to-[#7700ED] flex items-center justify-center text-[10px] font-black text-white ${className}`}
          >
            {initial}
          </div>
        );
    }
  };

  return <div className={`inline-flex shrink-0 select-none ${className}`}>{renderSVG()}</div>;
}
