'use client';

import React, { useEffect, useState } from 'react';
import { FlyViewMode } from '@/types/fly';
import { Eye, Cpu, Zap, Sparkles } from 'lucide-react';

interface DrosophilaFlyProps {
  isDeciding: boolean;
  winner?: 'A' | 'B' | 'TIE' | null;
  hoveredSide?: 'A' | 'B' | null;
  viewMode: FlyViewMode;
  onToggleViewMode: (mode: FlyViewMode) => void;
  feedbackEffect?: 'sugar' | 'shock' | null;
}

export const DrosophilaFly: React.FC<DrosophilaFlyProps> = ({
  isDeciding,
  winner,
  hoveredSide,
  viewMode,
  onToggleViewMode,
  feedbackEffect,
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

  const isXRay = viewMode === 'xray';

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* View Mode Switcher Pills */}
      <div className="flex items-center gap-1 p-1 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-800 mb-3 shadow-inner z-10">
        <button
          onClick={() => onToggleViewMode('insect')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            !isXRay
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Insect Body</span>
        </button>
        <button
          onClick={() => onToggleViewMode('xray')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            isXRay
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3 h-3" />
          <span>Brain Connectome (X-Ray)</span>
        </button>
      </div>

      {/* Floating Fly Container */}
      <div
        className="transition-all duration-700 ease-out relative"
        style={{ transform: transformStyle }}
      >
        {/* Floating feedback animations */}
        {feedbackEffect === 'sugar' && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-mono font-bold text-pink-400 animate-bounce bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.5)] z-20">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>+DOPAMINE (🍬 SUGAR)</span>
          </div>
        )}

        {feedbackEffect === 'shock' && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-mono font-bold text-amber-300 animate-ping bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>-DOPAMINE (⚡ SHOCK)</span>
          </div>
        )}

        <div className={`relative ${flyState === 'idle' ? 'animate-bounce' : ''}`} style={{ animationDuration: '3s' }}>
          <svg
            width="170"
            height="170"
            viewBox="0 0 200 200"
            className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          >
            <defs>
              {/* Ruby Red Eye Gradient */}
              <radialGradient id="flyEye" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#ff2a4b" />
                <stop offset="65%" stop-color="#ba0022" />
                <stop offset="100%" stop-color="#4a000d" />
              </radialGradient>

              {/* X-Ray Eye Glow */}
              <radialGradient id="xrayEye" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="50%" stop-color="#0284c7" />
                <stop offset="100%" stop-color="#082f49" />
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
            <path d="M 85 95 Q 45 80 30 65" stroke={isXRay ? '#1e293b' : '#3d2109'} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 85 105 Q 40 105 25 115" stroke={isXRay ? '#1e293b' : '#3d2109'} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 85 115 Q 45 140 35 160" stroke={isXRay ? '#1e293b' : '#3d2109'} strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Right Legs */}
            <path d="M 115 95 Q 155 80 170 65" stroke={isXRay ? '#1e293b' : '#3d2109'} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 115 105 Q 160 105 175 115" stroke={isXRay ? '#1e293b' : '#3d2109'} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 115 115 Q 155 140 165 160" stroke={isXRay ? '#1e293b' : '#3d2109'} strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Abdomen */}
            <ellipse
              cx="100"
              cy="135"
              rx="20"
              ry="32"
              fill={isXRay ? '#040d1a' : 'url(#flyBody)'}
              stroke={isXRay ? '#0ea5e9' : '#381b05'}
              strokeWidth={isXRay ? 1.5 : 1}
              opacity={isXRay ? 0.7 : 1}
            />
            {/* Stripes */}
            {!isXRay && (
              <>
                <path d="M 83 125 Q 100 130 117 125" stroke="#2b1504" strokeWidth="3.5" fill="none" />
                <path d="M 85 137 Q 100 142 115 137" stroke="#2b1504" strokeWidth="3.5" fill="none" />
                <path d="M 88 149 Q 100 153 112 149" stroke="#2b1504" strokeWidth="3.5" fill="none" />
              </>
            )}

            {/* Thorax */}
            <ellipse
              cx="100"
              cy="98"
              rx="18"
              ry="17"
              fill={isXRay ? '#030b17' : 'url(#flyBody)'}
              stroke={isXRay ? '#38bdf8' : '#381b05'}
              strokeWidth={isXRay ? 1.5 : 1}
              opacity={isXRay ? 0.8 : 1}
            />

            {/* Left Wing */}
            <g
              className={isDeciding || wingBuzz ? 'animate-pulse' : ''}
              style={{
                transformOrigin: '92px 90px',
                animationDuration: '0.08s',
                transform: flyState === 'winnerA' ? 'rotate(-25deg)' : 'rotate(-12deg)',
              }}
            >
              <ellipse cx="65" cy="72" rx="19" ry="42" transform="rotate(-30 65 72)" fill="url(#flyWing)" stroke="#a1c9e8" strokeWidth="1" />
              <path d="M 80 85 Q 65 65 52 45" stroke="#77a5cc" strokeWidth="0.8" fill="none" opacity="0.6" />
              <path d="M 72 75 Q 55 70 48 60" stroke="#77a5cc" strokeWidth="0.8" fill="none" opacity="0.6" />
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
              <ellipse cx="135" cy="72" rx="19" ry="42" transform="rotate(30 135 72)" fill="url(#flyWing)" stroke="#a1c9e8" strokeWidth="1" />
              <path d="M 120 85 Q 135 65 148 45" stroke="#77a5cc" strokeWidth="0.8" fill="none" opacity="0.6" />
              <path d="M 128 75 Q 145 70 152 60" stroke="#77a5cc" strokeWidth="0.8" fill="none" opacity="0.6" />
            </g>

            {/* Head */}
            <ellipse
              cx="100"
              cy="75"
              rx="15"
              ry="13"
              fill={isXRay ? '#051124' : '#8c470e'}
              stroke={isXRay ? '#38bdf8' : '#331a06'}
              strokeWidth={isXRay ? 1.5 : 1}
              opacity={isXRay ? 0.75 : 1}
            />

            {/* Antennae */}
            <path d="M 96 66 Q 90 52 82 50" stroke={isXRay ? '#38bdf8' : '#331a06'} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 104 66 Q 110 52 118 50" stroke={isXRay ? '#38bdf8' : '#331a06'} strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="82" cy="50" r="2" fill="#e29b43" />
            <circle cx="118" cy="50" r="2" fill="#e29b43" />

            {/* Eyes */}
            <ellipse
              cx="87"
              cy="74"
              rx="11"
              ry="13"
              transform="rotate(-15 87 74)"
              fill={isXRay ? 'url(#xrayEye)' : 'url(#flyEye)'}
              stroke={isXRay ? '#38bdf8' : '#2e0007'}
              strokeWidth="1"
            />
            <ellipse
              cx="113"
              cy="74"
              rx="11"
              ry="13"
              transform="rotate(15 113 74)"
              fill={isXRay ? 'url(#xrayEye)' : 'url(#flyEye)'}
              stroke={isXRay ? '#a855f7' : '#2e0007'}
              strokeWidth="1"
            />

            {/* Eye Gleams */}
            <circle cx="85" cy="70" r="3.5" fill="#ffffff" opacity={isXRay ? 0.9 : 0.85} />
            <circle cx="111" cy="70" r="3.5" fill="#ffffff" opacity={isXRay ? 0.9 : 0.85} />

            {/* ==================================================== */}
            {/* NEURAL CONNECTOME X-RAY OVERLAYS (165,122 Neurons)   */}
            {/* ==================================================== */}
            {isXRay && (
              <g className="animate-in fade-in duration-300">
                {/* Synaptic Axons Connecting Eyes to Optic Lobes */}
                <path d="M 87 74 Q 93 82 98 84" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.8" />
                <path d="M 113 74 Q 107 82 102 84" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.8" />

                {/* Left Optic Lobe (Medulla & Lobula) - Candidate A Receiver */}
                <g className={isDeciding || flyState === 'winnerA' ? 'animate-pulse' : ''} style={{ animationDuration: '0.4s' }}>
                  <ellipse cx="91" cy="76" rx="5" ry="6" fill="#0284c7" opacity="0.7" />
                  <circle cx="89" cy="74" r="2" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />
                  <circle cx="93" cy="78" r="1.5" fill="#38bdf8" />
                </g>

                {/* Right Optic Lobe (Medulla & Lobula) - Candidate B Receiver */}
                <g className={isDeciding || flyState === 'winnerB' ? 'animate-pulse' : ''} style={{ animationDuration: '0.4s' }}>
                  <ellipse cx="109" cy="76" rx="5" ry="6" fill="#7e22ce" opacity="0.7" />
                  <circle cx="111" cy="74" r="2" fill="#c084fc" filter="drop-shadow(0 0 4px #c084fc)" />
                  <circle cx="107" cy="78" r="1.5" fill="#c084fc" />
                </g>

                {/* Central Complex (Navigation & Saccade Center) */}
                <g>
                  <circle cx="100" cy="78" r="3.5" fill="#047857" opacity="0.8" />
                  <circle cx="100" cy="78" r="1.8" fill="#34d399" filter="drop-shadow(0 0 5px #34d399)" />
                  <path d="M 94 77 Q 100 74 106 77" stroke="#10b981" strokeWidth="1" fill="none" />
                </g>

                {/* Mushroom Body (Memory & Dopamine Valence Center) */}
                <g className={feedbackEffect === 'sugar' || isDeciding ? 'animate-pulse' : ''} style={{ animationDuration: '0.3s' }}>
                  {/* Bilateral Kenyon Cell lobes */}
                  <path d="M 97 70 Q 100 66 103 70 L 100 74 Z" fill="#db2777" opacity="0.85" />
                  <circle cx="98" cy="69" r="1.5" fill="#f472b6" filter="drop-shadow(0 0 4px #f472b6)" />
                  <circle cx="102" cy="69" r="1.5" fill="#f472b6" filter="drop-shadow(0 0 4px #f472b6)" />
                </g>

                {/* Giant Fiber (Escape circuit descending down the ventral cord) */}
                <path d="M 100 84 L 100 120" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.7" />
                <circle cx="100" cy="115" r="2" fill="#fb7185" />

                {/* Glowing Connectome Labels */}
                <text x="50" y="45" fill="#38bdf8" fontSize="6" fontFamily="monospace">Optic Lobe (A)</text>
                <line x1="86" y1="48" x2="89" y2="72" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.6" />

                <text x="115" y="45" fill="#c084fc" fontSize="6" fontFamily="monospace">Optic Lobe (B)</text>
                <line x1="125" y1="48" x2="111" y2="72" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.6" />

                <text x="75" y="100" fill="#ec4899" fontSize="6" fontFamily="monospace">Mushroom Body (DANs)</text>
                <line x1="92" y1="96" x2="98" y2="72" stroke="#ec4899" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.6" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Fly Status Badge */}
      <div className="mt-1 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300 shadow-md flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        {isDeciding ? (
          <span className="text-amber-300 font-semibold">Stimulating bilateral optic lobes...</span>
        ) : winner === 'A' ? (
          <span className="text-cyan-400 font-semibold">Left Optic Lobe Dominated (Icon A)</span>
        ) : winner === 'B' ? (
          <span className="text-purple-400 font-semibold">Right Optic Lobe Dominated (Icon B)</span>
        ) : (
          <span>Connectome Ready (165,122 Neurons)</span>
        )}
      </div>
    </div>
  );
};
