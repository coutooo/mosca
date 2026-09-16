'use client';

import React, { useEffect, useState } from 'react';
import { RacingTelemetry, TrackRecord } from '@/types/racing';
import { getRaceEventSchedule, formatCountdown } from '@/lib/raceSchedule';
import { formatLapTime } from '@/lib/trackData';
import { Trophy, Clock, Zap, Flame, Flag, Activity } from 'lucide-react';

interface TrackRecordHUDProps {
  telemetry: RacingTelemetry | null;
  newRecordAlert: TrackRecord | null;
}

export const TrackRecordHUD: React.FC<TrackRecordHUDProps> = ({
  telemetry,
  newRecordAlert,
}) => {
  const [schedule, setSchedule] = useState(() => getRaceEventSchedule());

  // Update race event countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSchedule(getRaceEventSchedule());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const record = telemetry?.lapRecord;
  const currentLap = telemetry?.currentLapTime || 0;
  const lastLap = telemetry?.lastLapTime;

  // Calculate real-time delta against the record
  const delta = record ? currentLap - record.lapTime : 0;
  const isAhead = record ? delta < 0 : false;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Banner: Scheduled Race Event Countdown & Live Status */}
      <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow ${
            schedule.isEventActive
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            <Flag className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                {schedule.eventName}
              </span>
              {schedule.isEventActive ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-black animate-pulse">
                  LIVE GRAND PRIX HEAT
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-[10px] font-mono border border-slate-700">
                  FREE PRACTICE / QUALIFYING
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Official championship races trigger every 15 minutes (:00, :15, :30, :45)
            </p>
          </div>
        </div>

        {/* Countdown Ticker */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center sm:items-end font-mono">
            <span className="text-[10px] text-slate-500 uppercase">
              {schedule.isEventActive ? 'RACE ENDS IN' : 'NEXT OFFICIAL RACE'}
            </span>
            <span className="text-xl font-black text-cyan-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>{formatCountdown(schedule.secondsUntilNextEvent)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Track Record Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. All-Time Lap Record Card */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-950/20 to-slate-950/80 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>CIRCUIT LAP RECORD</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ALL-TIME BEST
            </span>
          </div>

          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {record ? record.formattedTime : '--:--.---'}
            </span>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
              <span>Top Speed: <b className="text-slate-200">{record ? `${record.topSpeed} cm/s` : '--'}</b></span>
              <span>•</span>
              <span>Gen: <b className="text-slate-200">#{record?.generation || 0}</b></span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Set at: {record?.date || 'Waiting for first lap'}</span>
            <span className="text-amber-400 font-semibold">165k Neurons</span>
          </div>
        </div>

        {/* 2. Current Live Lap & Delta Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>CURRENT LAP TIME</span>
            </span>
            {record && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isAhead ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {isAhead ? `DELTA: ${delta.toFixed(2)}s` : `+${delta.toFixed(2)}s`}
              </span>
            )}
          </div>

          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-cyan-300 font-mono">
              {formatLapTime(currentLap)}
            </span>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
              <span>Last Lap: <b className="text-slate-200">{lastLap ? formatLapTime(lastLap) : '--'}</b></span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Laps: {telemetry?.totalLaps || 0}</span>
            <span>Crashes & Resets: {telemetry?.totalCrashes || 0}</span>
          </div>
        </div>

        {/* 3. Live Flight Telemetry & G-Force */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>FLIGHT TELEMETRY</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">60 FPS REAL-TIME</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2 font-mono">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Speed</span>
              <span className="text-xl font-bold text-white flex items-baseline gap-1">
                {telemetry?.speed || 0}
                <span className="text-[10px] font-normal text-slate-500">cm/s</span>
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">G-Force</span>
              <span className="text-xl font-bold text-white flex items-baseline gap-1">
                {telemetry?.gForce || 0}
                <span className="text-[10px] font-normal text-slate-500">G</span>
              </span>
            </div>
          </div>

          {/* Left vs Right Optic Lobe Flow */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[10px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>L. Optic Flow (A)</span>
              <span>R. Optic Flow (B)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full flex overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${(telemetry?.leftEyeOpticalFlow || 0.5) * 50}%` }}
              />
              <div className="w-1 h-full bg-slate-800" />
              <div
                className="h-full bg-purple-500 transition-all duration-75 ml-auto"
                style={{ width: `${(telemetry?.rightEyeOpticalFlow || 0.5) * 50}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Lap Record Notification */}
      {newRecordAlert && (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-400 text-slate-950 font-bold shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-between animate-in bounce-in">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 fill-current animate-bounce" />
            <div>
              <div className="text-sm uppercase tracking-wide font-black">
                🔥 NEW CIRCUIT RECORD BROKEN BY THE FLY!
              </div>
              <div className="text-xs font-mono font-semibold">
                Lap Time: {newRecordAlert.formattedTime} (Top Speed: {newRecordAlert.topSpeed} cm/s)
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-slate-950 text-white font-mono text-xs font-black shadow">
            GEN #{newRecordAlert.generation}
          </span>
        </div>
      )}

      {/* Recent Lap Records History Table */}
      {telemetry?.recentRecords && telemetry.recentRecords.length > 0 && (
        <div className="w-full p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="font-bold text-slate-200">RECENT LAPS & LEARNING PROGRESSION</span>
            <span>AUTONOMOUS CONECTOME TELEMETRY</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 text-[10px]">
                  <th className="py-2 px-3">LAP</th>
                  <th className="py-2 px-3">LAP TIME</th>
                  <th className="py-2 px-3">TOP SPEED</th>
                  <th className="py-2 px-3">TIME RECORDED</th>
                  <th className="py-2 px-3">MUSHROOM BODY STATUS</th>
                </tr>
              </thead>
              <tbody>
                {telemetry.recentRecords.map((r, idx) => (
                  <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                    <td className="py-2 px-3 text-slate-400">#{r.generation}</td>
                    <td className={`py-2 px-3 font-bold ${idx === 0 ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {r.formattedTime}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{r.topSpeed} cm/s</td>
                    <td className="py-2 px-3 text-slate-500">{r.date}</td>
                    <td className="py-2 px-3 text-pink-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-pink-400" />
                      <span>+Dopamine Synaptic Reinforcement</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
