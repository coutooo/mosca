'use client';

import React from 'react';
import { SavedRaceReplay } from '@/types/racing';
import { Video, X, Trophy, Play } from 'lucide-react';

interface ReplayArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  replays: SavedRaceReplay[];
  onSelectReplay: (replay: SavedRaceReplay) => void;
}

export const ReplayArchiveModal: React.FC<ReplayArchiveModalProps> = ({
  isOpen,
  onClose,
  replays,
  onSelectReplay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono text-white">
                HISTORIC REPLAY ARCHIVES
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Recorded official heats (13:00 & 21:00)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Replay List */}
        <div className="p-3 max-h-[380px] overflow-y-auto flex flex-col gap-2 font-mono">
          {replays.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No recorded races in archive.
            </div>
          ) : (
            replays.map((rep) => (
              <div
                key={rep.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {rep.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span className="text-slate-200 font-semibold">{rep.winnerName}</span>
                    </span>
                    <span>•</span>
                    <span className="text-cyan-300 font-bold">Lap: {rep.bestLap}</span>
                    <span>•</span>
                    <span className="text-slate-500 text-[10px]">{rep.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectReplay(rep);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30 transition-all shrink-0 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>{replays.length} races available</span>
          <span>100% Autonomous Drosophila Physics</span>
        </div>
      </div>
    </div>
  );
};
