'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  TrackData,
  FlyCarState,
  RacingTelemetry,
  TrackRecord,
  RaceStatus,
} from '@/types/racing';
import { getCircuitData } from '@/lib/trackData';
import {
  createInitialFlyState,
  stepAutonomousFly,
  getStoredWeights,
  getStoredRecords,
} from '@/lib/racingConnectome';
import confetti from 'canvas-confetti';
import { FastForward, Eye, Flag, RotateCcw } from 'lucide-react';

interface RaceTrackCanvasProps {
  raceStatus: RaceStatus;
  startingLightsCount: number;
  onTelemetryUpdate: (telemetry: RacingTelemetry) => void;
  onNewRecord: (record: TrackRecord) => void;
  onRaceFinished: (finalRecord: TrackRecord | null) => void;
  totalRaceLaps?: number;
}

export const RaceTrackCanvas: React.FC<RaceTrackCanvasProps> = ({
  raceStatus,
  startingLightsCount,
  onTelemetryUpdate,
  onNewRecord,
  onRaceFinished,
  totalRaceLaps = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showRays, setShowRays] = useState(true);

  const statusRef = useRef(raceStatus);
  statusRef.current = raceStatus;

  const simRef = useRef<{
    track: TrackData;
    fly: FlyCarState;
    weights: ReturnType<typeof getStoredWeights>;
    lastFrameTime: number;
    dopamineSurge: boolean;
    painShock: boolean;
    raceLapCount: number;
  }>({
    track: getCircuitData(),
    fly: createInitialFlyState(getCircuitData()),
    weights: getStoredWeights(),
    lastFrameTime: performance.now(),
    dopamineSurge: false,
    painShock: false,
    raceLapCount: 0,
  });

  // Reset fly to starting grid whenever waiting or starting
  useEffect(() => {
    if (raceStatus === 'WAITING' || raceStatus === 'STARTING_LIGHTS') {
      const track = simRef.current.track;
      simRef.current.fly = createInitialFlyState(track);
      simRef.current.raceLapCount = 0;
    }
  }, [raceStatus]);

  const handleResetPosition = () => {
    const track = simRef.current.track;
    simRef.current.fly = createInitialFlyState(track);
    simRef.current.raceLapCount = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const currentStatus = statusRef.current;
      const { track, fly, weights } = simRef.current;

      // -------------------------------------------------------------
      // 1. Physics update ONLY when in RACING state!
      // -------------------------------------------------------------
      let newRecordAchieved: TrackRecord | null = null;
      let crashedThisTick = false;
      let lapDoneThisTick = false;

      if (currentStatus === 'RACING') {
        const substeps = speedMultiplier;

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
            simRef.current.raceLapCount++;

            // Check if official race distance has completed
            if (simRef.current.raceLapCount >= totalRaceLaps) {
              onRaceFinished(newRecordAchieved || getStoredRecords().lapRecord);
            }
          }
        }
      } else {
        // Fly is parked at the start line
        fly.speed = 0;
        fly.steer = 0;
        fly.x = track.startPoint.x;
        fly.y = track.startPoint.y;
        fly.angle = track.startAngle;
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
        currentLapTime: currentStatus === 'RACING' ? fly.currentLapTime : 0,
        lastLapTime: records.recentRecords[0]?.lapTime || null,
        bestLapTime: records.lapRecord?.lapTime || null,
        lapRecord: records.lapRecord,
        recentRecords: records.recentRecords,
        generation: fly.lapsCompleted + fly.crashCount,
        totalLaps: fly.lapsCompleted,
        totalCrashes: fly.crashCount,
        speed: currentStatus === 'RACING' ? Math.round(fly.speed * 18 * 10) / 10 : 0,
        gForce: currentStatus === 'RACING' ? Math.round(Math.abs(fly.steer) * (fly.speed / 2.5) * 10) / 10 : 0,
        leftEyeOpticalFlow: currentStatus === 'RACING' ? leftFlow : 0.2,
        rightEyeOpticalFlow: currentStatus === 'RACING' ? rightFlow : 0.2,
        steeringAngle: fly.steer,
        dopamineSurge: simRef.current.dopamineSurge,
        painShock: simRef.current.painShock,
      });

      // -------------------------------------------------------------
      // 2. Render Canvas Track, Asphalt, Barriers, Grid & Lights
      // -------------------------------------------------------------
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
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

      // Asphalt Track Surface
      ctx.beginPath();
      ctx.moveTo(track.outerBoundary[0].x, track.outerBoundary[0].y);
      for (let i = 1; i < track.outerBoundary.length; i++) {
        ctx.lineTo(track.outerBoundary[i].x, track.outerBoundary[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = '#111827';
      ctx.fill();

      // Infield cut-out
      ctx.beginPath();
      ctx.moveTo(track.innerBoundary[0].x, track.innerBoundary[0].y);
      for (let i = 1; i < track.innerBoundary.length; i++) {
        ctx.lineTo(track.innerBoundary[i].x, track.innerBoundary[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = '#060a12';
      ctx.fill();

      // Centerline
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

      // Barriers with Neon Glow
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

      // Starting Grid Pole Markings
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sp.x - 14, sp.y - 12, 28, 24);

      // Vision Rays (only active when racing)
      if (showRays && currentStatus === 'RACING') {
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

          ctx.fillStyle = ray.distance < 0.35 ? '#f43f5e' : ctx.strokeStyle;
          ctx.beginPath();
          ctx.arc(ray.hitPoint.x, ray.hitPoint.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw Drosophila Fly
      ctx.save();
      ctx.translate(fly.x, fly.y);
      ctx.rotate(fly.angle);

      // Speed Wake when racing fast
      if (fly.speed > 2.5 && currentStatus === 'RACING') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-14, 0, 7 + Math.random() * 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fly Body
      ctx.fillStyle = '#b86819';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#542805';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Stripes
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

      // Translucent Wings (Flapping gently when waiting, fast when racing)
      const flapRate = currentStatus === 'RACING' ? 0.04 + fly.speed * 0.02 : 0.008;
      const wingFlutter = Math.sin(currentTime * flapRate) * (currentStatus === 'RACING' ? 6 : 2.5);
      ctx.fillStyle = 'rgba(203, 230, 247, 0.7)';
      ctx.strokeStyle = '#a1c9e8';
      ctx.lineWidth = 0.8;

      ctx.beginPath();
      ctx.ellipse(-2, -8 - wingFlutter * 0.3, 7, 4, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(-2, 8 + wingFlutter * 0.3, 7, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = '#8c470e';
      ctx.beginPath();
      ctx.arc(6, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Ruby-Red Eyes
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

      // -------------------------------------------------------------
      // 3. Status Overlays: F1 Starting Lights & Grid Waiting Banner
      // -------------------------------------------------------------
      if (currentStatus === 'STARTING_LIGHTS') {
        // Render F1-style 5 Starting Lights Gantry in the center
        const lx = w / 2 - 100;
        const ly = 70;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(lx - 15, ly - 15, 230, 50, 12);
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < 5; i++) {
          const cx = lx + i * 42 + 15;
          const cy = ly + 10;
          const isRed = i < startingLightsCount;

          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fillStyle = isRed ? '#ef4444' : '#1e293b';
          if (isRed) {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 15;
          }
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText('LIGHTS OUT AND AWAY WE GO!', w / 2, ly + 65);
      } else if (currentStatus === 'WAITING') {
        // Grid Waiting Overlay Banner
        const bw = 320;
        const bh = 50;
        const bx = w / 2 - bw / 2;
        const by = 40;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 14);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('🏁 GRID WAITING • FLY IDLING ON POLE', w / 2, by + 22);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Track opens automatically when scheduled race starts', w / 2, by + 38);
      } else if (currentStatus === 'FINISHED') {
        // Finish Flag Banner
        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(w / 2 - 160, 45, 320, 50, 14);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('🏁 CHECKERED FLAG • OFFICIAL HEAT COMPLETE', w / 2, 68);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Returning to paddock for next scheduled heat...', w / 2, 84);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [speedMultiplier, showRays, onTelemetryUpdate, onNewRecord, onRaceFinished, totalRaceLaps, startingLightsCount]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#060a12] border border-slate-800 shadow-[0_0_35px_rgba(0,0,0,0.8)]">
        <canvas
          ref={canvasRef}
          width={900}
          height={550}
          className="w-full h-auto object-contain block"
        />

        {/* Top Left Track Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 shadow">
            <span className={`w-1.5 h-1.5 rounded-full ${
              raceStatus === 'RACING' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span>CIRCUIT DE MONACO-DROSOPHILA</span>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800">
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
            onClick={handleResetPosition}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Grid Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
