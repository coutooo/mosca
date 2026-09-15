'use client';

import React, { useEffect, useRef } from 'react';
import { AnalysisMetrics } from '@/types/fly';

interface SpikeRasterPlotProps {
  isSimulating: boolean;
  metricsA?: AnalysisMetrics | null;
  metricsB?: AnalysisMetrics | null;
}

export const SpikeRasterPlot: React.FC<SpikeRasterPlotProps> = ({
  isSimulating,
  metricsA,
  metricsB,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const channels = [
      { name: 'R1-R6 Ommatidia', color: '#38bdf8', weightA: metricsA?.phototaxisScore || 50, weightB: metricsB?.phototaxisScore || 50 },
      { name: 'Lamina L1/L2 Edge', color: '#818cf8', weightA: metricsA?.edgeContrast || 50, weightB: metricsB?.edgeContrast || 50 },
      { name: 'Medulla T4/T5 Motion', color: '#34d399', weightA: metricsA?.saccadeFixation || 50, weightB: metricsB?.saccadeFixation || 50 },
      { name: 'Mushroom Body (Dopamine)', color: '#ec4899', weightA: Math.max(10, 50 + (metricsA?.dopamineDelta || 0)), weightB: Math.max(10, 50 + (metricsB?.dopamineDelta || 0)) },
      { name: 'Giant Fiber Escape', color: '#f87171', weightA: metricsA?.giantFiberReflex || 15, weightB: metricsB?.giantFiberReflex || 15 },
    ];

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark oscilloscope background
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const channelHeight = (h - 20) / channels.length;

      // Draw each channel's action potentials
      channels.forEach((ch, idx) => {
        const yBase = 15 + idx * channelHeight;

        // Channel baseline
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(140, yBase + channelHeight / 2);
        ctx.lineTo(w, yBase + channelHeight / 2);
        ctx.stroke();

        // Channel label
        ctx.font = '10px monospace';
        ctx.fillStyle = ch.color;
        ctx.fillText(ch.name, 10, yBase + channelHeight / 2 + 3);

        // Render spike rasters (ticks)
        const density = isSimulating ? 0.35 : 0.12;
        const spikeRate = (ch.weightA + ch.weightB) / 100;
        const count = Math.floor((w - 150) / 8);

        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.5;

        for (let i = 0; i < count; i++) {
          const x = 150 + i * 8;
          // Deterministic pseudorandom pseudo-Poisson spike generation
          const pseudoRand = Math.sin((x + offset) * 12.9898 + idx * 78.233) * 43758.5453;
          const val = pseudoRand - Math.floor(pseudoRand);

          if (val < density * spikeRate) {
            const spikeH = 12 + Math.random() * 6;
            ctx.beginPath();
            ctx.moveTo(x, yBase + channelHeight / 2 - spikeH / 2);
            ctx.lineTo(x, yBase + channelHeight / 2 + spikeH / 2);
            ctx.stroke();
          }
        }
      });

      offset += isSimulating ? 3.5 : 0.8;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSimulating, metricsA, metricsB]);

  return (
    <div className="w-full flex flex-col gap-2 p-3 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2 font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>REAL-TIME SPIKE RASTER OSCILLOSCOPE</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          SAMPLING: 10,000 Hz • CLAMP: WHOLE-CELL VOLTAGE
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={720}
        height={180}
        className="w-full h-[140px] rounded-xl border border-slate-950 bg-[#05070d]"
      />
    </div>
  );
};
