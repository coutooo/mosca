'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrackData, FlyCarState, RacingTelemetry, TrackRecord } from '@/types/racing';
import { getCircuitData, formatLapTime } from '@/lib/trackData';
import {
  createInitialFlyState,
  stepAutonomousFly,
  getStoredWeights,
  getStoredRecords,
} from '@/lib/racingConnectome';
import confetti from 'canvas-confetti';
import { Play, Pause, FastForward, Eye, RotateCcw } from 'lucide-react';

interface RaceTrackCanvasProps {
  onTelemetryUpdate: (telemetry: RacingTelemetry) => void;
  onNewRecord: (record: TrackRecord) => void;
}

export const RaceTrackCanvas: React.FC<RaceTrackCanvasProps> = ({
  onTelemetryUpdate,
  onNewRecord,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showRays, setShowRays] = useState(true);

  // References for mutable simulation loop state
  const simRef = useRef<{
    track: TrackData;
    fly: FlyCarState;
    weights: ReturnType<typeof getStoredWeights>;
    lastFrameTime: number;
    dopamineSurge: boolean;
    painShock: boolean;
  }>({
    track: getCircuitData(),
    fly: createInitialFlyState(getCircuitData()),
    weights: getStoredWeights(),
    lastFrameTime: performance.now(),
    dopamineSurge: false,
    painShock: false,
  });

  const handleResetFly = () => {
    const track = simRef.current.track;
    simRef.current.fly = createInitialFlyState(track);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      if (!isRunning) {
        simRef.current.lastFrameTime = currentTime;
        return;
      }

      // Physics substeps for precision
      const substeps = speedMultiplier;
      const { track, fly, weights } = simRef.current;

      let newRecordAchieved: TrackRecord | null = null;
      let crashedThisTick = false;
      let lapDoneThisTick = false;

      for (let s = 0; s < substeps; s++) {
        const stepRes = stepAutonomousFly(fly, track, weights, 0.016);
        simRef.current.fly = stepRes.fly;
        simRef.current.weights = stepRes.weights;

        if (stepRes.newRecord) {
          newRecordAchieved = stepRes.newRecord;
        }
        if (stepRes.crashed) {
          crashedThisTick = true;
        }
        if (stepRes.lapCompleted) {
          lapDoneThisTick = true;
        }
      }

      if (newRecordAchieved) {
        onNewRecord(newRecordAchieved);
        simRef.current.dopamineSurge = true;
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#f43f5e', '#fbbf24', '#34d399'],
        });
        setTimeout(() => {
          simRef.current.dopamineSurge = false;
        }, 3000);
      } else if (lapDoneThisTick) {
        simRef.current.dopamineSurge = true;
        setTimeout(() => {
          simRef.current.dopamineSurge = false;
        }, 1500);
      }

      if (crashedThisTick) {
        simRef.current.painShock = true;
        setTimeout(() => {
          simRef.current.painShock = false;
        }, 400);
      }

      // Update Telemetry
      const records = getStoredRecords();
      const leftSensors = fly.raySensors.slice(0, 3);
      const rightSensors = fly.raySensors.slice(4, 7);
      const leftFlow = leftSensors.reduce((acc, r) => acc + (1 - r.distance), 0) / 3;
      const rightFlow = rightSensors.reduce((acc, r) => acc + (1 - r.distance), 0) / 3;

      onTelemetryUpdate({
        currentLapTime: fly.currentLapTime,
        lastLapTime: records.recentRecords[0]?.lapTime || null,
        bestLapTime: records.lapRecord?.lapTime || null,
        lapRecord: records.lapRecord,
        recentRecords: records.recentRecords,
        generation: fly.lapsCompleted + fly.crashCount,
        totalLaps: fly.lapsCompleted,
        totalCrashes: fly.crashCount,
        speed: Math.round(fly.speed * 18 * 10) / 10,
        gForce: Math.round(Math.abs(fly.steer) * (fly.speed / 2.5) * 10) / 10,
        leftEyeOpticalFlow: leftFlow,
        rightEyeOpticalFlow: rightFlow,
        steeringAngle: fly.steer,
        dopamineSurge: simRef.current.dopamineSurge,
        painShock: simRef.current.painShock,
      });

      // -----------------------------------------------------------
      // Canvas Rendering (Track, Curbs, Car, Rays, Finish Line)
      // -----------------------------------------------------------
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic paddock background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Subtle paddock grid
      ctx.strokeStyle = '#0e1626';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Tarmac Surface
      ctx.beginPath();
      // Outer border
      ctx.moveTo(track.outerBoundary[0].x, track.outerBoundary[0].y);
      for (let i = 1; i < track.outerBoundary.length; i++) {
        ctx.lineTo(track.outerBoundary[i].x, track.outerBoundary[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = '#111827';
      ctx.fill();

      // Inner infield cut out
      ctx.beginPath();
      ctx.moveTo(track.innerBoundary[0].x, track.innerBoundary[0].y);
      for (let i = 1; i < track.innerBoundary.length; i++) {
        ctx.lineTo(track.innerBoundary[i].x, track.innerBoundary[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = '#060a12';
      ctx.fill();

      // Draw Racing Line (Centerline Dashes)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(track.waypoints[0].x, track.waypoints[0].y);
      for (let i = 1; i < track.waypoints.length; i++) {
        ctx.lineTo(track.waypoints[i].x, track.waypoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Curbs & Neon Barrier Lines
      // Outer Barrier
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(track.outerBoundary[0].x, track.outerBoundary[0].y);
      for (let i = 1; i < track.outerBoundary.length; i++) {
        ctx.lineTo(track.outerBoundary[i].x, track.outerBoundary[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner Barrier
      ctx.strokeStyle = '#7c3aed';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(track.innerBoundary[0].x, track.innerBoundary[0].y);
      for (let i = 1; i < track.innerBoundary.length; i++) {
        ctx.lineTo(track.innerBoundary[i].x, track.innerBoundary[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Start / Finish Line
      const sp = track.startPoint;
      const cpNext = track.waypoints[11];
      const sAngle = Math.atan2(cpNext.y - sp.y, cpNext.x - sp.x) + Math.PI / 2;
      const slen = 22;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sp.x - Math.cos(sAngle) * slen, sp.y - Math.sin(sAngle) * slen);
      ctx.lineTo(sp.x + Math.cos(sAngle) * slen, sp.y + Math.sin(sAngle) * slen);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Compound Eye Optical Flow Rays
      if (showRays) {
        fly.raySensors.forEach((ray, rIdx) => {
          const isLeft = rIdx < 3;
          const isCenter = rIdx === 3;
          ctx.strokeStyle = isCenter
            ? 'rgba(52, 211, 153, 0.45)'
            : isLeft
            ? 'rgba(56, 189, 248, 0.45)'
            : 'rgba(192, 132, 252, 0.45)';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(fly.x, fly.y);
          ctx.lineTo(ray.hitPoint.x, ray.hitPoint.y);
          ctx.stroke();

          // Hit dot on barrier
          ctx.fillStyle = ray.distance < 0.35 ? '#f43f5e' : ctx.strokeStyle;
          ctx.beginPath();
          ctx.arc(ray.hitPoint.x, ray.hitPoint.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw Drosophila Fly / Racing Kart
      ctx.save();
      ctx.translate(fly.x, fly.y);
      ctx.rotate(fly.angle);

      // Speed Exhaust Wake
      if (fly.speed > 2.5) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-14, 0, 7 + Math.random() * 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fly Body (Abdomen & Thorax)
      ctx.fillStyle = '#b86819';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#542805';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Abdomen Stripes
      ctx.strokeStyle = '#2b1504';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-9, -4);
      ctx.lineTo(-9, 4);
      ctx.moveTo(-6, -5);
      ctx.lineTo(-6, 5);
      ctx.moveTo(-3, -5);
      ctx.lineTo(-3, 5);
      ctx.stroke();

      // Translucent Wings (Flapping based on throttle)
      const wingFlutter = Math.sin(currentTime * (0.04 + fly.speed * 0.02)) * 6;
      ctx.fillStyle = 'rgba(203, 230, 247, 0.7)';
      ctx.strokeStyle = '#a1c9e8';
      ctx.lineWidth = 0.8;

      // Left Wing
      ctx.beginPath();
      ctx.ellipse(-2, -8 - wingFlutter * 0.3, 7, 4, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right Wing
      ctx.beginPath();
      ctx.ellipse(-2, 8 + wingFlutter * 0.3, 7, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = '#8c470e';
      ctx.beginPath();
      ctx.arc(6, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Huge Ruby-Red Compound Eyes (Left & Right)
      ctx.fillStyle = '#ff2a4b';
      ctx.shadowColor = '#ff2a4b';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(7, -3.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(7, 3.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRunning, speedMultiplier, showRays, onTelemetryUpdate, onNewRecord]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Canvas Container with sleek HUD frame */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#060a12] border border-slate-800 shadow-[0_0_35px_rgba(0,0,0,0.8)]">
        <canvas
          ref={canvasRef}
          width={900}
          height={550}
          className="w-full h-auto object-contain block"
        />

        {/* Live Overlay Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>CIRCUIT DE MONACO-DROSOPHILA</span>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />}
          </button>

          <button
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
            className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold text-cyan-300 hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Simulation Speed"
          >
            <FastForward className="w-3 h-3" />
            <span>{speedMultiplier}x</span>
          </button>

          <button
            onClick={() => setShowRays(!showRays)}
            className={`p-1.5 rounded-lg transition-colors ${
              showRays ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Vision Rays"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetFly}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
