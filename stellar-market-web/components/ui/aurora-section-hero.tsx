'use client';

import React from 'react';

export interface BackgroundSceneProps {
  beamCount?: number;
}

const BackgroundScene: React.FC<BackgroundSceneProps> = () => {
  return (
    <div className="scene" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', background: '#000000', zIndex: 1 }}>
      <style>{`
        @keyframes fullScreenSilkWave1 {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(-45px, 30px) scale(1.06) rotate(2deg);
          }
          66% {
            transform: translate(35px, -25px) scale(0.96) rotate(-1.5deg);
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
        }

        @keyframes fullScreenSilkWave2 {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(50px, -35px) scale(0.95) rotate(-2deg);
          }
          66% {
            transform: translate(-40px, 30px) scale(1.07) rotate(1.8deg);
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
        }

        @keyframes fullScreenSilkWave3 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-25px, -35px) scale(1.08);
            opacity: 1;
          }
        }
      `}</style>
      <svg 
        viewBox="0 0 1440 900" 
        preserveAspectRatio="none" 
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <defs>
          {/* Left Satin Wave Gradient */}
          <linearGradient id="fullSilkGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#3730a3" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#c7d2fe" stopOpacity="0.95" />
            <stop offset="80%" stopColor="#4338ca" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Center Main Metallic Satin Gradient */}
          <linearGradient id="fullSilkGradCenter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f0d24" stopOpacity="0.95" />
            <stop offset="18%" stopColor="#2e1065" stopOpacity="0.92" />
            <stop offset="38%" stopColor="#5b21b6" stopOpacity="0.95" />
            <stop offset="52%" stopColor="#8b5cf6" stopOpacity="0.98" />
            <stop offset="64%" stopColor="#ddd6fe" stopOpacity="1" />
            <stop offset="78%" stopColor="#7c3aed" stopOpacity="0.92" />
            <stop offset="90%" stopColor="#3b0764" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#05020a" stopOpacity="0.3" />
          </linearGradient>

          {/* Right Satin Glow Gradient */}
          <linearGradient id="fullSilkGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="20%" stopColor="#6366f1" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#e0e7ff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Smooth Blur Filters */}
          <filter id="heavyBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id="softSheenBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>

        {/* Base Pitch Black */}
        <rect width="100%" height="100%" fill="#000000" />

        {/* 1. LEFT SILK WAVE (Behind Trade Everything text) */}
        <g style={{ animation: 'fullScreenSilkWave1 18s ease-in-out infinite alternate', transformOrigin: '25% 40%' }}>
          <path 
            d="M -150 -100 C 350 150, 150 550, 750 1000 L 450 1000 C -150 550, 50 150, -350 -100 Z" 
            fill="url(#fullSilkGradLeft)" 
            filter="url(#heavyBlur)"
          />
        </g>

        {/* 2. CENTER & MAIN SILK WAVE (Sweeping right across center) */}
        <g style={{ animation: 'fullScreenSilkWave2 15s ease-in-out infinite alternate', transformOrigin: '55% 50%' }}>
          <path 
            d="M 450 -100 C 920 200, 380 620, 1150 1000 L 850 1000 C 180 620, 650 200, 200 -100 Z" 
            fill="url(#fullSilkGradCenter)" 
            filter="url(#heavyBlur)"
          />

          {/* Sheen Highlight Overlay */}
          <path 
            d="M 520 -100 C 880 220, 480 600, 1050 1000" 
            fill="none"
            stroke="#e0e7ff"
            strokeWidth="38"
            strokeOpacity="0.5"
            filter="url(#heavyBlur)"
          />
        </g>

        {/* 3. RIGHT SILK WAVE (Surrounding Phone Mockup & top-right) */}
        <g style={{ animation: 'fullScreenSilkWave3 12s ease-in-out infinite alternate', transformOrigin: '80% 50%' }}>
          <path 
            d="M 720 -100 C 1180 180, 780 600, 1380 1000 L 1550 1000 L 1550 -100 Z" 
            fill="url(#fullSilkGradRight)" 
            filter="url(#softSheenBlur)"
          />

          {/* Vertical Glow Core Beam */}
          <path 
            d="M 920 -100 L 960 -100 L 1120 1000 L 1080 1000 Z" 
            fill="#ffffff" 
            opacity="0.35"
            filter="url(#heavyBlur)"
          />
        </g>
      </svg>
    </div>
  );
};

export default BackgroundScene;
