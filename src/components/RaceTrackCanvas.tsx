'use client';

import React, { useEffect, useRef } from 'react';
import {
  TrackData,
  RacingTelemetry,
  TrackRecord,
  RaceStatus,
  FlyCompetitor,
  SavedRaceReplay,
  MultiFlyFrame,
} from '@/types/racing';
import { getCircuitData, formatLapTime } from '@/lib/trackData';
import {
  createCompetitors,
  stepCompetitor,
  updateCompetitorRanks,
  getStoredRecords,
} from '@/lib/racingConnectome';
import confetti from 'canvas-confetti';

interface RaceTrackCanvasProps {
  raceStatus: RaceStatus;
  startingLightsCount: number;
  isReplaying: boolean;
  selectedReplay?: SavedRaceReplay | null;
  onReplayFinished: () => void;
  onHasReplayChange: (hasReplay: boolean) => void;
  onTelemetryUpdate: (telemetry: RacingTelemetry) => void;
  onNewRecord: (record: TrackRecord) => void;
  onRaceFinished: (winner: FlyCompetitor, finalRecord: TrackRecord | null) => void;
  onSaveRunReplay?: (frames: MultiFlyFrame[], winner: FlyCompetitor, record: TrackRecord | null) => void;
  focusedFlyId?: string;
  totalRaceLaps?: number;
}

export const RaceTrackCanvas: React.FC<RaceTrackCanvasProps> = ({
  raceStatus,
  startingLightsCount,
  isReplaying,
  selectedReplay,
  onReplayFinished,
  onHasReplayChange,
  onTelemetryUpdate,
  onNewRecord,
  onRaceFinished,
  onSaveRunReplay,
  focusedFlyId = 'fly-1',
  totalRaceLaps = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const statusRef = useRef(raceStatus);
  statusRef.current = raceStatus;

  const isReplayingRef = useRef(isReplaying);
  isReplayingRef.current = isReplaying;

  const focusedFlyIdRef = useRef(focusedFlyId);
  focusedFlyIdRef.current = focusedFlyId;

  const recordedRunFrames = useRef<MultiFlyFrame[]>([]);
  const lastRunReplayFrames = useRef<MultiFlyFrame[]>([]);
  const replayIndexRef = useRef<number>(0);

  const simRef = useRef<{
    track: TrackData;
    competitors: FlyCompetitor[];
    lastFrameTime: number;
    dopamineSurge: boolean;
    painShock: boolean;
    raceLapsDone: number;
  }>({
    track: getCircuitData(),
    competitors: createCompetitors(getCircuitData()),
    lastFrameTime: performance.now(),
    dopamineSurge: false,
    painShock: false,
    raceLapsDone: 0,
  });

  // Reset competitors to starting grid slots whenever waiting or starting
  useEffect(() => {
    if (!isReplaying && (raceStatus === 'WAITING' || raceStatus === 'STARTING_LIGHTS')) {
      const track = simRef.current.track;
      simRef.current.competitors = createCompetitors(track);
      simRef.current.raceLapsDone = 0;
    }
  }, [raceStatus, isReplaying]);

  useEffect(() => {
    if (selectedReplay && selectedReplay.frames && selectedReplay.frames.length > 0) {
      lastRunReplayFrames.current = selectedReplay.frames;
      replayIndexRef.current = 0;
      onHasReplayChange(true);
    }
  }, [selectedReplay, onHasReplayChange]);

  useEffect(() => {
    if (isReplaying) {
      replayIndexRef.current = 0;
    }
  }, [isReplaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const currentStatus = statusRef.current;
      const replaying = isReplayingRef.current;
      const { track, competitors } = simRef.current;

      let newRecordAchieved: TrackRecord | null = null;
      let anyCrashed = false;
      let leaderLapCompleted = false;

      // -------------------------------------------------------------
      // 1. REPLAY MODE vs LIVE 4-FLY RACING
      // -------------------------------------------------------------
      if (replaying && lastRunReplayFrames.current.length > 0) {
        const frame = lastRunReplayFrames.current[replayIndexRef.current];
        if (frame) {
          frame.flies.forEach((saved) => {
            const comp = competitors.find((c) => c.id === saved.id);
            if (comp) {
              comp.state.x = saved.x;
              comp.state.y = saved.y;
              comp.state.angle = saved.angle;
              comp.state.speed = saved.speed;
              comp.state.steer = saved.steer;
              comp.rank = saved.rank;
            }
          });

          replayIndexRef.current++;
          if (replayIndexRef.current >= lastRunReplayFrames.current.length) {
            replayIndexRef.current = 0;
            onReplayFinished();
          }
        }
      } else if (currentStatus === 'RACING') {
        // Step all 4 flies
        competitors.forEach((comp) => {
          const res = stepCompetitor(comp, track, competitors, 0.016);
          if (res.newRecord) {
            newRecordAchieved = res.newRecord;
          }
          if (res.crashed) {
            anyCrashed = true;
          }
          if (res.lapCompleted && comp.rank === 1) {
            leaderLapCompleted = true;
            simRef.current.raceLapsDone++;

            if (simRef.current.raceLapsDone >= totalRaceLaps) {
              if (recordedRunFrames.current.length > 20) {
                const finishedFrames = [...recordedRunFrames.current];
                lastRunReplayFrames.current = finishedFrames;
                onHasReplayChange(true);
                onSaveRunReplay?.(finishedFrames, comp, newRecordAchieved || getStoredRecords().lapRecord);
              }
              recordedRunFrames.current = [];
              onRaceFinished(comp, newRecordAchieved || getStoredRecords().lapRecord);
            }
          }
        });

        // Update live ranks (1st, 2nd, 3rd, 4th)
        simRef.current.competitors = updateCompetitorRanks(competitors);

        // Record multi-fly frame for replay
        recordedRunFrames.current.push({
          flies: competitors.map((c) => ({
            id: c.id,
            x: c.state.x,
            y: c.state.y,
            angle: c.state.angle,
            speed: c.state.speed,
            steer: c.state.steer,
            rank: c.rank,
          })),
        });
      } else {
        // Reset to grid slots
        competitors.forEach((comp, idx) => {
          const slot = track.gridSlots[idx] || track.gridSlots[0];
          comp.state.x = slot.x;
          comp.state.y = slot.y;
          comp.state.angle = slot.angle;
          comp.state.speed = 0;
          comp.state.steer = 0;
        });
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
      } else if (leaderLapCompleted) {
        simRef.current.dopamineSurge = true;
        setTimeout(() => {
          simRef.current.dopamineSurge = false;
        }, 1500);
      }

      if (anyCrashed) {
        simRef.current.painShock = true;
        setTimeout(() => {
          simRef.current.painShock = false;
        }, 350);
      }

      // Telemetry based on focused fly or leader
      const focusedId = focusedFlyIdRef.current;
      const leader = competitors.find((c) => c.rank === 1) || competitors[0];
      const focusedComp = competitors.find((c) => c.id === focusedId) || leader;
      const fly = focusedComp.state;

      const records = getStoredRecords();

      // Compute accurate optical flow from ray sensors or steering dynamics
      let leftFlow = 0.2;
      let rightFlow = 0.2;

      if (fly.raySensors && fly.raySensors.length >= 7) {
        const leftSensors = fly.raySensors.slice(0, 3);
        const rightSensors = fly.raySensors.slice(4, 7);
        const sensorLeft = leftSensors.reduce((acc, r) => acc + (1 - (r?.distance ?? 1)), 0) / 3;
        const sensorRight = rightSensors.reduce((acc, r) => acc + (1 - (r?.distance ?? 1)), 0) / 3;
        leftFlow = Math.max(sensorLeft, fly.steer < -0.05 ? Math.min(1, Math.abs(fly.steer) * 2.2 + 0.2) : 0.15);
        rightFlow = Math.max(sensorRight, fly.steer > 0.05 ? Math.min(1, Math.abs(fly.steer) * 2.2 + 0.2) : 0.15);
      } else {
        // Replay mode or grid fallback
        leftFlow = fly.steer < -0.05 ? Math.min(1, Math.abs(fly.steer) * 2.5 + 0.3) : 0.2;
        rightFlow = fly.steer > 0.05 ? Math.min(1, Math.abs(fly.steer) * 2.5 + 0.3) : 0.2;
      }

      onTelemetryUpdate({
        currentLapTime: currentStatus === 'RACING' ? fly.currentLapTime : 0,
        lastLapTime: focusedComp.lastLapTime || records.recentRecords[0]?.lapTime || null,
        bestLapTime: focusedComp.bestLapTime || records.lapRecord?.lapTime || null,
        lapRecord: records.lapRecord,
        recentRecords: records.recentRecords,
        generation: fly.lapsCompleted + fly.crashCount,
        totalLaps: fly.lapsCompleted,
        totalCrashes: fly.crashCount,
        speed: currentStatus === 'RACING' || replaying ? Math.round(fly.speed * 18 * 10) / 10 : 0,
        gForce: currentStatus === 'RACING' || replaying ? Math.round(Math.abs(fly.steer) * (fly.speed / 2.5) * 10) / 10 : 0,
        leftEyeOpticalFlow: currentStatus === 'RACING' || replaying ? leftFlow : 0.2,
        rightEyeOpticalFlow: currentStatus === 'RACING' || replaying ? rightFlow : 0.2,
        steeringAngle: fly.steer,
        dopamineSurge: simRef.current.dopamineSurge,
        painShock: simRef.current.painShock,
        competitors: competitors.map((c) => ({
          id: c.id,
          name: c.name,
          team: c.team,
          rank: c.rank,
          color: c.eyeColor,
          speed: Math.round(c.state.speed * 18 * 10) / 10,
          lapsCompleted: c.state.lapsCompleted,
          gap: c.gapToLeader,
          bestLap: c.bestLapTime ? formatLapTime(c.bestLapTime) : '--',
        })),
        focusedFlyId: focusedComp.id,
      });

      // -------------------------------------------------------------
      // 2. Render Track, Barriers, Starting Grid, and All 4 Flies
      // -------------------------------------------------------------
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Grid pattern
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

      // Infield
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
      ctx.strokeStyle = replaying ? '#06b6d4' : '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = replaying ? '#22d3ee' : '#38bdf8';
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
      const slen = 38;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sp.x - Math.cos(sAngle) * slen, sp.y - Math.sin(sAngle) * slen);
      ctx.lineTo(sp.x + Math.cos(sAngle) * slen, sp.y + Math.sin(sAngle) * slen);
      ctx.stroke();
      ctx.setLineDash([]);

      // Staggered Starting Grid Boxes
      track.gridSlots.forEach((slot, idx) => {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(slot.x - 10, slot.y - 8, 20, 16);

        ctx.font = '8px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, slot.x, slot.y + 3);
      });

      // Render All 4 Flies
      competitors.forEach((comp) => {
        const cfly = comp.state;

        // Render vision rays only for focused fly
        if ((currentStatus === 'RACING' || replaying) && comp.id === focusedId) {
          cfly.raySensors.forEach((ray, rIdx) => {
            const isCenter = rIdx === 3;
            ctx.strokeStyle = isCenter
              ? 'rgba(52, 211, 153, 0.45)'
              : comp.accentColor === '#38bdf8'
              ? 'rgba(56, 189, 248, 0.45)'
              : 'rgba(192, 132, 252, 0.45)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(cfly.x, cfly.y);
            ctx.lineTo(ray.hitPoint.x, ray.hitPoint.y);
            ctx.stroke();
          });
        }

        ctx.save();
        ctx.translate(cfly.x, cfly.y);
        ctx.rotate(cfly.angle);

        // Speed Wake
        if (cfly.speed > 2.2 && (currentStatus === 'RACING' || replaying)) {
          ctx.fillStyle = `${comp.accentColor}44`;
          ctx.beginPath();
          ctx.ellipse(-13, 0, 6 + Math.random() * 3, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fly Body
        ctx.fillStyle = comp.bodyColor;
        ctx.beginPath();
        ctx.ellipse(-4, 0, 9, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Stripes
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -3.5);
        ctx.lineTo(-8, 3.5);
        ctx.moveTo(-5, -4.5);
        ctx.lineTo(-5, 4.5);
        ctx.moveTo(-2, -4.5);
        ctx.lineTo(-2, 4.5);
        ctx.stroke();

        // Wings
        const flapRate = (currentStatus === 'RACING' || replaying) ? 0.04 + cfly.speed * 0.02 : 0.008;
        const wingFlutter = Math.sin(currentTime * flapRate + comp.rank) * ((currentStatus === 'RACING' || replaying) ? 5.5 : 2);
        ctx.fillStyle = 'rgba(203, 230, 247, 0.7)';
        ctx.strokeStyle = '#a1c9e8';
        ctx.lineWidth = 0.8;

        ctx.beginPath();
        ctx.ellipse(-2, -7 - wingFlutter * 0.3, 6.5, 3.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(-2, 7 + wingFlutter * 0.3, 6.5, 3.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(5.5, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Distinct Eyes
        ctx.fillStyle = comp.eyeColor;
        ctx.shadowColor = comp.eyeColor;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(6.5, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6.5, 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Live Position Pill Badge above each fly (P1, P2, P3, P4)
        ctx.save();
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        const badgeColor = comp.rank === 1 ? '#fbbf24' : comp.rank === 2 ? '#cbd5e1' : comp.rank === 3 ? '#cd7f32' : '#64748b';
        ctx.fillStyle = badgeColor;
        ctx.fillText(`P${comp.rank}`, cfly.x, cfly.y - 12);
        ctx.restore();
      });

      // -------------------------------------------------------------
      // 3. Status Overlays
      // -------------------------------------------------------------
      if (replaying) {
        const progress = Math.min(100, Math.round((replayIndexRef.current / (lastRunReplayFrames.current.length || 1)) * 100));

        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(w / 2 - 180, 35, 360, 52, 14);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'center';
        ctx.fillText(`📹 4-FLY GRAND PRIX REPLAY • ${progress}%`, w / 2, 58);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Replaying multi-fly trajectory and overtaking maneuvers', w / 2, 74);
      } else if (currentStatus === 'STARTING_LIGHTS') {
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
        const bw = 340;
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
        ctx.fillText('🏁 4 FLIES ON THE STARTING GRID', w / 2, by + 22);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Official Grand Prix heat starts automatically on schedule', w / 2, by + 38);
      } else if (currentStatus === 'FINISHED') {
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
        ctx.fillText('🏁 CHECKERED FLAG • RACE FINISHED', w / 2, 68);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Winner: ${leader.name} (${leader.team})`, w / 2, 84);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [onTelemetryUpdate, onNewRecord, onRaceFinished, totalRaceLaps, startingLightsCount, onReplayFinished, onHasReplayChange]);

  return (
    <div className="w-full h-full min-h-0 flex flex-col items-center justify-center">
      <div className="relative w-full h-full min-h-0 rounded-2xl overflow-hidden bg-[#060a12] border border-slate-800/80 shadow-[0_0_35px_rgba(0,0,0,0.8)] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={900}
          height={550}
          className="max-w-full max-h-full w-auto h-auto object-contain block aspect-[900/550]"
        />

        {/* Top Left Track Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 shadow">
            <span className={`w-1.5 h-1.5 rounded-full ${
              isReplaying ? 'bg-cyan-400 animate-pulse' : raceStatus === 'RACING' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span>MONACO GRAND PRIX • 4-FLY GRID</span>
          </div>
        </div>

        {/* Top Right Status */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          <span className={`w-1.5 h-1.5 rounded-full ${isReplaying ? 'bg-cyan-400 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
          <span>{isReplaying ? '4-FLY REPLAY' : 'LIVE BROADCAST'}</span>
        </div>
      </div>
    </div>
  );
};
