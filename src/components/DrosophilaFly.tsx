'use client';

import React, { useEffect, useState } from 'react';

interface DrosophilaFlyProps {
  isDeciding: boolean;
  winner?: 'A' | 'B' | 'TIE' | null;
  hoveredSide?: 'A' | 'B' | null;
}

export const DrosophilaFly: React.FC<DrosophilaFlyProps> = ({
  isDeciding,
  winner,
  hoveredSide,
}) => {
  const [flyState, setFlyState] = useState<'idle' | 'inspecting' | 'winnerA' | 'winnerB'>('idle');
  const [wingBuzz, setWingBuzz] = useState(true);

  useEffect(() => {
    if (isDeciding) {
      setFlyState('inspecting');
      setWingBuzz(true);
    } else if (winner === 'A') {
      setFlyState('winnerA');
      setWingBuzz(false);
    } else if (winner === 'B') {
      setFlyState('winnerB');
      setWingBuzz(false);
    } else if (hoveredSide === 'A') {
      setFlyState('winnerA');
    } else if (hoveredSide === 'B') {
      setFlyState('winnerB');
    } else {
      setFlyState('idle');
      setWingBuzz(true);
    }
  }, [isDeciding, winner, hoveredSide]);

  // Determine translation & rotation based on state
  let transformStyle = 'translate(0px, 0px) rotate(0deg)';
  if (flyState === 'winnerA') {
    transformStyle = 'translate(-70px, -15px) rotate(-22deg) scale(1.08)';
  } else if (flyState === 'winnerB') {
    transformStyle = 'translate(70px, -15px) rotate(22deg) scale(1.08)';
  } else if (flyState === 'inspecting') {
    transformStyle = 'translate(0px, -20px) scale(1.15)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none py-2">
      {/* Floating Fly Container */}
      <div
        className="transition-all duration-700 ease-out"
        style={{ transform: transformStyle }}
      >
        <div className={`relative ${flyState === 'idle' ? 'animate-bounce' : ''}`} style={{ animationDuration: '3s' }}>
          <svg
            width="140"
            height="140"
            viewBox="0 0 200 200"
            className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            <defs>
              {/* Ruby Red Eye Gradient */}
              <radialGradient id="flyEye" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#ff2a4b" />
                <stop offset="65%" stop-color="#ba0022" />
                <stop offset="100%" stop-color="#4a000d" />
              </radialGradient>
              
              {/* Amber Thorax Gradient */}
              <linearGradient id="flyBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#e29b43" />
                <stop offset="60%" stop-color="#b86819" />
                <stop offset="100%" stop-color="#542805" />
              </linearGradient>

              {/* Translucent Wings */}
              <linearGradient id="flyWing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
                <stop offset="40%" stop-color="#cbe6f7" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#a4d8fa" stop-opacity="0.25" />
              </linearGradient>
            </defs>

            {/* Left Legs */}
            <path d="M 85 95 Q 45 80 30 65" stroke="#3d2109" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M 85 105 Q 40 105 25 115" stroke="#3d2109" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M 85 115 Q 45 140 35 160" stroke="#3d2109" stroke-width="3" fill="none" stroke-linecap="round" />

            {/* Right Legs */}
            <path d="M 115 95 Q 155 80 170 65" stroke="#3d2109" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M 115 105 Q 160 105 175 115" stroke="#3d2109" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M 115 115 Q 155 140 165 160" stroke="#3d2109" stroke-width="3" fill="none" stroke-linecap="round" />

            {/* Abdomen (Striped Drosophila Pattern) */}
            <ellipse cx="100" cy="135" rx="20" ry="32" fill="url(#flyBody)" />
            {/* Stripes */}
            <path d="M 83 125 Q 100 130 117 125" stroke="#2b1504" stroke-width="3.5" fill="none" />
            <path d="M 85 137 Q 100 142 115 137" stroke="#2b1504" stroke-width="3.5" fill="none" />
            <path d="M 88 149 Q 100 153 112 149" stroke="#2b1504" stroke-width="3.5" fill="none" />

            {/* Thorax */}
            <ellipse cx="100" cy="98" rx="18" ry="17" fill="url(#flyBody)" stroke="#381b05" stroke-width="1" />

            {/* Left Wing */}
            <g
              className={isDeciding || wingBuzz ? 'animate-pulse' : ''}
              style={{
                transformOrigin: '92px 90px',
                animationDuration: '0.08s',
                transform: flyState === 'winnerA' ? 'rotate(-25deg)' : 'rotate(-12deg)',
              }}
            >
              <ellipse cx="65" cy="72" rx="19" ry="42" transform="rotate(-30 65 72)" fill="url(#flyWing)" stroke="#a1c9e8" stroke-width="1" />
              <path d="M 80 85 Q 65 65 52 45" stroke="#77a5cc" stroke-width="0.8" fill="none" opacity="0.6" />
              <path d="M 72 75 Q 55 70 48 60" stroke="#77a5cc" stroke-width="0.8" fill="none" opacity="0.6" />
            </g>

            {/* Right Wing */}
            <g
              className={isDeciding || wingBuzz ? 'animate-pulse' : ''}
              style={{
                transformOrigin: '108px 90px',
                animationDuration: '0.08s',
                transform: flyState === 'winnerB' ? 'rotate(25deg)' : 'rotate(12deg)',
              }}
            >
              <ellipse cx="135" cy="72" rx="19" ry="42" transform="rotate(30 135 72)" fill="url(#flyWing)" stroke="#a1c9e8" stroke-width="1" />
              <path d="M 120 85 Q 135 65 148 45" stroke="#77a5cc" stroke-width="0.8" fill="none" opacity="0.6" />
              <path d="M 128 75 Q 145 70 152 60" stroke="#77a5cc" stroke-width="0.8" fill="none" opacity="0.6" />
            </g>

            {/* Head */}
            <ellipse cx="100" cy="75" rx="14" ry="12" fill="#8c470e" />

            {/* Antennae */}
            <path d="M 96 66 Q 90 52 82 50" stroke="#331a06" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M 104 66 Q 110 52 118 50" stroke="#331a06" stroke-width="2" fill="none" stroke-linecap="round" />
            {/* Aristae feathers */}
            <circle cx="82" cy="50" r="2" fill="#e29b43" />
            <circle cx="118" cy="50" r="2" fill="#e29b43" />

            {/* Huge Ruby-Red Drosophila Eyes */}
            <ellipse
              cx="87"
              cy="74"
              rx="11"
              ry="13"
              transform="rotate(-15 87 74)"
              fill="url(#flyEye)"
              stroke="#2e0007"
              stroke-width="1"
            />
            <ellipse
              cx="113"
              cy="74"
              rx="11"
              ry="13"
              transform="rotate(15 113 74)"
              fill="url(#flyEye)"
              stroke="#2e0007"
              stroke-width="1"
            />
            
            {/* Eye Corneal Reflections (Gleam) */}
            <circle cx="85" cy="70" r="3.5" fill="#ffffff" opacity="0.85" />
            <circle cx="111" cy="70" r="3.5" fill="#ffffff" opacity="0.85" />
          </svg>
        </div>
      </div>

      {/* Fly Status Badge */}
      <div className="mt-1 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300 shadow-md flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        {isDeciding ? (
          <span className="text-amber-300 font-semibold">The fly is analyzing both icons...</span>
        ) : winner === 'A' ? (
          <span className="text-cyan-400 font-semibold">Fly preferred Icon A!</span>
        ) : winner === 'B' ? (
          <span className="text-purple-400 font-semibold">Fly preferred Icon B!</span>
        ) : (
          <span>Drosophila is waiting for candidates</span>
        )}
      </div>
    </div>
  );
};
