'use client';

import React from 'react';
import { RacingTelemetry, TrackRecord, RaceStatus } from '@/types/racing';
import { Trophy, Trash2, Flame, Dna } from 'lucide-react';

interface TrackRecordHUDProps {
  raceStatus: RaceStatus;
  secondsUntilNextEvent: number;
  eventName: string;
  hasReplay: boolean;
  isReplaying: boolean;
  onToggleReplay: () => void;
  telemetry: RacingTelemetry | null;
  newRecordAlert: TrackRecord | null;
  focusedFlyId?: string;
  onSelectFly?: (id: string) => void;
  onInspectFly?: (id: string) => void;
  onClearHistory?: () => void;
}

export const TrackRecordHUD: React.FC<TrackRecordHUDProps> = ({
  telemetry,
  newRecordAlert,
  focusedFlyId = 'fly-1',
  onSelectFly,
  onInspectFly,
  onClearHistory,
}) => {
  const record = telemetry?.lapRecord;
  const competitors = telemetry?.competitors || [];
  const recentRecords = telemetry?.recentRecords || [];

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* New Lap Record Notification Pill */}
      {newRecordAlert && (
        <div className="w-full px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 truncate">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-black truncate">
              NEW LAP RECORD: {newRecordAlert.formattedTime} ({newRecordAlert.holderName || 'Janelia Red'})
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-white shrink-0">
            {newRecordAlert.topSpeed} cm/s
          </span>
        </div>
      )}

      {/* 4-Fly Timing Tower */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>TIMING TOWER • P1–P4</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-bold">Click fly to inspect DNA</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {competitors.map((comp) => {
            const isFocused = comp.id === focusedFlyId;
            const rankStyle =
              comp.rank === 1
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : comp.rank === 2
                  ? 'bg-slate-300/10 text-slate-200 border-slate-400/30'
                  : comp.rank === 3
                    ? 'bg-amber-700/20 text-amber-500 border-amber-600/30'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700';

            return (
              <div
                key={comp.id}
                onClick={() => {
                  onSelectFly?.(comp.id);
                  onInspectFly?.(comp.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${isFocused
                    ? 'bg-slate-800/90 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
              >
                {/* Left: Rank & Driver */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[10px] border ${rankStyle}`}>
                    P{comp.rank}
                  </span>
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: comp.color, boxShadow: `0 0 6px ${comp.color}` }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-[11px] truncate leading-tight">
                      {comp.name}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate leading-tight">
                      {comp.team}
                    </span>
                  </div>
                </div>

                {/* Right: Gap, Speed & Active Tag */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end text-[10px]">
                    <span className={comp.rank === 1 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {comp.gap}
                    </span>
                    <span className="text-slate-500 text-[9px]">{comp.bestLap}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFly?.(comp.id);
                      onInspectFly?.(comp.id);
                    }}
                    className="p-1 rounded bg-slate-900/80 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                    title="Inspect Genetics & Evolution"
                  >
                    <Dna className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Circuit Lap Records & History (Compact) */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>CIRCUIT RECORDS</span>
          </span>
          {recentRecords.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* All-time record banner */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-amber-500/20 font-mono">
          <div className="flex flex-col">
            <span className="text-[9px] text-amber-400 uppercase tracking-wide">ALL-TIME BEST</span>
            <span className="text-sm font-black text-white">
              {record ? record.formattedTime : '--:--.---'}
            </span>
          </div>
          <div className="flex flex-col items-end text-[10px] text-slate-400">
            <span>{record?.holderName || 'Pending'}</span>
            <span className="text-[9px] text-slate-500">{record ? `${record.topSpeed} cm/s` : '--'}</span>
          </div>
        </div>

        {/* Mini recent heats history */}
        {recentRecords.length > 0 ? (
          <div className="flex flex-col gap-1 font-mono text-[10px]">
            {recentRecords.slice(0, 2).map((r, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40 text-slate-400">
                <span className="text-slate-300 truncate">#{r.generation} {r.holderName}</span>
                <span className="font-bold text-cyan-300">{r.formattedTime}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2 px-2 text-center font-mono text-[10px] text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
            Record Clear
          </div>
        )}
      </div>
    </div>
  );
};
