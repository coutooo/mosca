'use client';

import React from 'react';
import { FlyMemory } from '@/types/fly';
import { Sparkles, Zap, Brain, RotateCcw, Award } from 'lucide-react';

interface FlyMemoryHUDProps {
  memory: FlyMemory;
  onFeedback: (type: 'sugar' | 'shock') => void;
  onReset: () => void;
  canGiveFeedback: boolean;
  lastFeedbackMsg: string | null;
}

export const FlyMemoryHUD: React.FC<FlyMemoryHUDProps> = ({
  memory,
  onFeedback,
  onReset,
  canGiveFeedback,
  lastFeedbackMsg,
}) => {
  // Calculate fly level based on total tests and synaptic plasticity
  const level = Math.max(1, Math.floor(memory.totalSynapticUpdates / 400) + 1);

  return (
    <div className="w-full p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Top Header: Experience & Level */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                DROSOPHILA MUSHROOM BODY PLASTICITY
              </span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>LEVEL {level}</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              {memory.testsCount} Tests Evaluated • {memory.totalSynapticUpdates.toLocaleString()} Synapses Adapted
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          title="Reset fly memory back to naive connectome"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Memory</span>
        </button>
      </div>

      {/* Interactive Dopamine Feedback Arena (Active when a test has completed) */}
      {canGiveFeedback && (
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-xs font-bold text-slate-200">
              Teach the Fly: Did it make the right choice?
            </span>
            <span className="text-[11px] text-slate-400">
              Reward with sugar or shock with electricity to train its future preferences.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onFeedback('sugar')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🍬 Reward with Sugar (+Dopamine)</span>
            </button>

            <button
              onClick={() => onFeedback('shock')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Shock (-Dopamine)</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Message Toast */}
      {lastFeedbackMsg && (
        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3 py-2 rounded-lg animate-in fade-in">
          {lastFeedbackMsg}
        </div>
      )}

      {/* Learned Synaptic Weights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-1">
          <span className="text-slate-400">Contrast Bias</span>
          <span className={`font-bold ${memory.learnedWeights.contrastPreference >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {memory.learnedWeights.contrastPreference > 0 ? `+${(memory.learnedWeights.contrastPreference * 100).toFixed(0)}%` : `${(memory.learnedWeights.contrastPreference * 100).toFixed(0)}%`}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-1">
          <span className="text-slate-400">Phototaxis Bias</span>
          <span className={`font-bold ${memory.learnedWeights.phototaxisPreference >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {memory.learnedWeights.phototaxisPreference > 0 ? `+${(memory.learnedWeights.phototaxisPreference * 100).toFixed(0)}%` : `${(memory.learnedWeights.phototaxisPreference * 100).toFixed(0)}%`}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-1">
          <span className="text-slate-400">UV/Blue Affinity</span>
          <span className={`font-bold ${memory.learnedWeights.uvBluePreference >= 0 ? 'text-pink-400' : 'text-amber-400'}`}>
            {memory.learnedWeights.uvBluePreference > 0 ? `+${(memory.learnedWeights.uvBluePreference * 100).toFixed(0)}%` : `${(memory.learnedWeights.uvBluePreference * 100).toFixed(0)}%`}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-1">
          <span className="text-slate-400">Escape Reflex Bias</span>
          <span className={`font-bold ${memory.learnedWeights.giantFiberSensitivity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {memory.learnedWeights.giantFiberSensitivity > 0 ? `+${(memory.learnedWeights.giantFiberSensitivity * 100).toFixed(0)}%` : `${(memory.learnedWeights.giantFiberSensitivity * 100).toFixed(0)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
