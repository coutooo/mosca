'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisionMode } from '@/types/fly';
import { renderVisionMode } from '@/lib/visionEngine';
import { Eye, Sparkles, Layers, Activity } from 'lucide-react';

interface CompoundEyeViewerProps {
  iconAUrl: string;
  iconBUrl: string;
  nameA: string;
  nameB: string;
  visionMode: VisionMode;
  onModeChange: (mode: VisionMode) => void;
  winner?: 'A' | 'B' | 'TIE' | null;
}

export const CompoundEyeViewer: React.FC<CompoundEyeViewerProps> = ({
  iconAUrl,
  iconBUrl,
  nameA,
  nameB,
  visionMode,
  onModeChange,
  winner,
}) => {
  const canvasRefA = useRef<HTMLCanvasElement>(null);
  const canvasRefB = useRef<HTMLCanvasElement>(null);

  // Hidden source canvases to store raw loaded image bitmaps
  const rawCanvasRefA = useRef<HTMLCanvasElement | null>(null);
  const rawCanvasRefB = useRef<HTMLCanvasElement | null>(null);

  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load images and draw to source canvases
  useEffect(() => {
    let active = true;

    const imgA = new Image();
    const imgB = new Image();
    imgA.crossOrigin = 'anonymous';
    imgB.crossOrigin = 'anonymous';

    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount === 2 && active) {
        // Prepare raw source canvases at 320x320
        const cA = document.createElement('canvas');
        cA.width = 320;
        cA.height = 320;
        const ctxA = cA.getContext('2d');
        if (ctxA) ctxA.drawImage(imgA, 0, 0, 320, 320);
        rawCanvasRefA.current = cA;

        const cB = document.createElement('canvas');
        cB.width = 320;
        cB.height = 320;
        const ctxB = cB.getContext('2d');
        if (ctxB) ctxB.drawImage(imgB, 0, 0, 320, 320);
        rawCanvasRefB.current = cB;

        setImagesLoaded(true);
      }
    };

    imgA.onload = checkDone;
    imgB.onload = checkDone;
    imgA.src = iconAUrl;
    imgB.src = iconBUrl;

    return () => {
      active = false;
    };
  }, [iconAUrl, iconBUrl]);

  // Re-render target canvases whenever visionMode or imagesLoaded change
  useEffect(() => {
    if (!imagesLoaded || !rawCanvasRefA.current || !rawCanvasRefB.current) return;

    if (canvasRefA.current) {
      renderVisionMode(rawCanvasRefA.current, canvasRefA.current, visionMode);
    }
    if (canvasRefB.current) {
      renderVisionMode(rawCanvasRefB.current, canvasRefB.current, visionMode);
    }
  }, [imagesLoaded, visionMode]);

  const modes: { id: VisionMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'ommatidia',
      label: 'Compound Eye (800 Facets)',
      icon: <Eye className="w-3.5 h-3.5" />,
      desc: 'Hexagonal facet resolution & optical refraction of adult Drosophila',
    },
    {
      id: 'saliency',
      label: 'Optic Lobe Saliency',
      icon: <Activity className="w-3.5 h-3.5" />,
      desc: 'Lamina L1/L2 high-pass edge contrast & motion capture heatmap',
    },
    {
      id: 'spectral',
      label: 'UV / Insect Spectrum',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      desc: 'R7 UV (~345nm) and R1-R6 rhodopsin (480nm) with red attenuation',
    },
    {
      id: 'normal',
      label: 'Human Retina',
      icon: <Layers className="w-3.5 h-3.5" />,
      desc: 'Standard human trichromatic RGB reference',
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Mode Selector Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          {modes.map((m) => {
            const isActive = visionMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
                title={m.desc}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
        <div className="text-[11px] font-mono text-slate-500 px-2 hidden sm:block">
          {modes.find((m) => m.id === visionMode)?.desc}
        </div>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Icon A Box */}
        <div
          className={`relative flex flex-col items-center p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border transition-all ${
            winner === 'A'
              ? 'border-cyan-400/80 shadow-[0_0_24px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
              : 'border-slate-800/80 hover:border-slate-700'
          }`}
        >
          {winner === 'A' && (
            <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
              <span>🏆 BIOLOGICAL WINNER</span>
            </div>
          )}

          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-mono text-xs">
                A
              </span>
              <span className="truncate max-w-[180px]">{nameA}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Left Optic Lobe
            </span>
          </div>

          <div className="relative w-[260px] h-[260px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-center group">
            <canvas
              ref={canvasRefA}
              width={320}
              height={320}
              className="w-full h-full object-contain"
            />
            {visionMode === 'ommatidia' && (
              <div className="absolute bottom-2 left-2 pointer-events-none bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300/80 border border-cyan-500/20">
                ~792 Ommatidia Facets
              </div>
            )}
          </div>
        </div>

        {/* Icon B Box */}
        <div
          className={`relative flex flex-col items-center p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border transition-all ${
            winner === 'B'
              ? 'border-purple-400/80 shadow-[0_0_24px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/40'
              : 'border-slate-800/80 hover:border-slate-700'
          }`}
        >
          {winner === 'B' && (
            <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-purple-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
              <span>🏆 BIOLOGICAL WINNER</span>
            </div>
          )}

          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-mono text-xs">
                B
              </span>
              <span className="truncate max-w-[180px]">{nameB}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Right Optic Lobe
            </span>
          </div>

          <div className="relative w-[260px] h-[260px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-center group">
            <canvas
              ref={canvasRefB}
              width={320}
              height={320}
              className="w-full h-full object-contain"
            />
            {visionMode === 'ommatidia' && (
              <div className="absolute bottom-2 left-2 pointer-events-none bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-purple-300/80 border border-purple-500/20">
                ~792 Ommatidia Facets
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
