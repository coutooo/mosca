'use client';

import React, { useState } from 'react';
import { FlyCompetitor, FlyLapHistoryItem } from '@/types/racing';
import {
  X,
  Dna,
  Zap,
  Clock,
  TrendingDown,
  Trophy,
  Activity,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Flame,
  Check,
} from 'lucide-react';

interface FlyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fly: FlyCompetitor | null;
  allFlies: FlyCompetitor[];
  onSelectFly: (id: string) => void;
  isLiveFocused?: boolean;
  onFocusLiveFly?: (id: string) => void;
}

export const FlyProfileModal: React.FC<FlyProfileModalProps> = ({
  isOpen,
  onClose,
  fly,
  allFlies,
  onSelectFly,
  isLiveFocused = false,
  onFocusLiveFly,
}) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'genetics' | 'style'>('evolution');
  const [focusedNotice, setFocusedNotice] = useState(false);

  if (!isOpen || !fly) return null;

  const handleLinkConnectome = () => {
    onFocusLiveFly?.(fly.id);
    setFocusedNotice(true);
    setTimeout(() => setFocusedNotice(false), 2200);
  };

  const history = fly.lapHistory || [];
  const bestLapItem = history.find((h) => h.isBest) || history[0];
  const oldestLapItem = history[history.length - 1];
  const evolutionDelta =
    bestLapItem && oldestLapItem && oldestLapItem.lapTime > bestLapItem.lapTime
      ? (oldestLapItem.lapTime - bestLapItem.lapTime).toFixed(3)
      : null;

  const avgLap =
    history.length > 0
      ? (history.reduce((acc, h) => acc + h.lapTime, 0) / history.length).toFixed(3)
      : null;

  // Calculate relative bar heights for the evolution chart (min-max normalization)
  const minTime = history.length > 0 ? Math.min(...history.map((h) => h.lapTime)) : 14;
  const maxTime = history.length > 0 ? Math.max(...history.map((h) => h.lapTime)) : 17;
  const timeSpread = Math.max(0.8, maxTime - minTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090d16] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* 1. Modal Top Bar with Fly Switcher Tabs */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-950/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow"
                style={{
                  backgroundColor: `${fly.eyeColor}22`,
                  border: `1px solid ${fly.eyeColor}66`,
                  boxShadow: `0 0 15px ${fly.eyeColor}33`,
                }}
              >
                <Dna className="w-4 h-4" style={{ color: fly.eyeColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black font-mono text-white tracking-wide">
                    {fly.name}
                  </h2>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border"
                    style={{
                      backgroundColor: `${fly.eyeColor}18`,
                      borderColor: `${fly.eyeColor}55`,
                      color: fly.eyeColor,
                    }}
                  >
                    P{fly.rank} • {fly.team}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Drosophila Connectome Genome & Dynamic Lap Evolution
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLinkConnectome}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                  isLiveFocused
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
                title="Focus this fly in 3D Connectome HUD"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">
                  {focusedNotice ? 'Brain Linked!' : isLiveFocused ? 'Active Brain' : 'Link Brain'}
                </span>
              </button>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fly Switcher Pills (Switch between all 4 flies) */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] font-mono font-bold">
            {allFlies.map((f) => {
              const isSelected = f.id === fly.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectFly(f.id)}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all truncate ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: f.eyeColor, boxShadow: `0 0 6px ${f.eyeColor}` }}
                  />
                  <span className="truncate">{f.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Secondary Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-3 sm:px-4 font-mono text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('evolution')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'evolution'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Lap Evolution ({history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('genetics')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'genetics'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Genetics & Weights</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'style'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Driving Style & Traits</span>
          </button>
        </div>

        {/* 3. Modal Body (Scrollable) */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[64vh] flex flex-col gap-4 font-mono text-xs">
          
          {/* TAB 1: LAP EVOLUTION */}
          {activeTab === 'evolution' && (
            <div className="flex flex-col gap-3.5">
              {/* Quick Evolution KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/20 flex flex-col">
                  <span className="text-[10px] text-amber-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>ALL-TIME BEST</span>
                  </span>
                  <span className="text-base font-black text-white mt-1">
                    {bestLapItem ? `${bestLapItem.lapTime.toFixed(3)}s` : '--'}
                  </span>
                  <span className="text-[9px] text-slate-500">Lap #{bestLapItem?.lapNumber || 1}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex flex-col">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    <span>LEARNING GAIN</span>
                  </span>
                  <span className="text-base font-black text-emerald-400 mt-1">
                    {evolutionDelta ? `-${evolutionDelta}s` : '0.000s'}
                  </span>
                  <span className="text-[9px] text-slate-500">Evolution vs 1st lap</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col">
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>AVG LAP TIME</span>
                  </span>
                  <span className="text-base font-black text-white mt-1">
                    {avgLap ? `${avgLap}s` : '--'}
                  </span>
                  <span className="text-[9px] text-slate-500">Over {history.length} laps</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-purple-500/20 flex flex-col">
                  <span className="text-[10px] text-purple-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>PLASTICITY RATE</span>
                  </span>
                  <span className="text-base font-black text-purple-300 mt-1">
                    η = {fly.weights.learningRate}
                  </span>
                  <span className="text-[9px] text-slate-500">Hebbian weight delta</span>
                </div>
              </div>

              {/* Visual Evolution Trend Progression Chart */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>EVOLUTION LAP PROGRESSION (CHRONOLOGICAL)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    Faster ➔ Lower Bar
                  </span>
                </div>

                <div className="h-28 w-full pt-4 pb-2 px-2 flex items-end justify-between gap-1.5 border-b border-slate-800/80">
                  {[...history].reverse().map((item, idx) => {
                    // Normalize: lower lap time = taller 'improvement' bar or shorter elapsed bar
                    const normHeight = Math.max(
                      20,
                      Math.min(95, 100 - ((item.lapTime - minTime) / timeSpread) * 75)
                    );
                    const isBest = item.isBest;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] text-white whitespace-nowrap shadow pointer-events-none z-10">
                          Lap {item.lapNumber}: {item.formattedTime} ({item.topSpeed} cm/s)
                        </div>

                        <div
                          className={`w-full rounded-t transition-all ${
                            isBest
                              ? 'bg-gradient-to-t from-amber-600 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-gradient-to-t from-cyan-900/80 to-cyan-400/90 hover:brightness-125'
                          }`}
                          style={{ height: `${normHeight}%` }}
                        />
                        <span className="text-[8px] text-slate-500">L{item.lapNumber}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 px-1">
                  <span>Earliest Runs (Training Line)</span>
                  <span>Latest Evolution (Refined Line)</span>
                </div>
              </div>

              {/* Detailed Lap Times Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <div className="w-14">LAP #</div>
                  <div className="flex-1">TIME</div>
                  <div className="w-24 text-right">DELTA TO BEST</div>
                  <div className="w-20 text-right">TOP SPEED</div>
                  <div className="w-20 text-right">TIMESTAMP</div>
                </div>

                <div className="divide-y divide-slate-900 max-h-48 overflow-y-auto">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 flex items-center justify-between hover:bg-slate-900/40 text-[11px]"
                    >
                      <div className="w-14 flex items-center gap-1 font-bold text-slate-300">
                        <span>L{item.lapNumber}</span>
                        {item.isBest && (
                          <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex-1 font-black text-white">
                        {item.formattedTime}
                      </div>

                      <div className="w-24 text-right font-mono">
                        {item.deltaToBest === 0 ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            BEST
                          </span>
                        ) : item.deltaToPrev && item.deltaToPrev < 0 ? (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {item.deltaToPrev.toFixed(3)}s
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            +{item.deltaToBest?.toFixed(3)}s
                          </span>
                        )}
                      </div>

                      <div className="w-20 text-right text-slate-400 text-[10px]">
                        {item.topSpeed} cm/s
                      </div>

                      <div className="w-20 text-right text-slate-500 text-[9px]">
                        {item.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GENETICS & CONNECTOME WEIGHTS */}
          {activeTab === 'genetics' && (
            <div className="flex flex-col gap-3.5">
              {/* Biological Profile Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Dna className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-xs">
                    BIOLOGICAL GENOME & STRAIN IDENTIFICATION
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Biological Strain</span>
                    <span className="font-bold text-slate-200">{fly.genetics.strain}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Genotype Spec</span>
                    <span className="font-bold text-slate-200">{fly.genetics.genotype}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Eye Phenotype</span>
                    <span className="font-bold text-slate-200">{fly.genetics.eyePhenotype}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Photoreceptors</span>
                    <span className="font-bold text-slate-200">{fly.genetics.photoreceptors}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Connectome Scale</span>
                    <span className="font-bold text-cyan-300">{fly.genetics.synapticComplexity}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Synaptic Plasticity</span>
                    <span className="font-bold text-purple-300">{fly.genetics.synapticPlasticity}</span>
                  </div>
                </div>
              </div>

              {/* Neural Steering Weights */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>SYNAPTIC STEERING PARAMETERS</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Live Active Model</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Speed Multiplier</span>
                    <span className="font-black text-amber-400 text-sm">
                      {fly.weights.speedWeight}x
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Steer Bias</span>
                    <span className="font-black text-cyan-300 text-sm">
                      {fly.weights.biasSteer > 0 ? `+${fly.weights.biasSteer}` : fly.weights.biasSteer}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Learning Rate (η)</span>
                    <span className="font-black text-purple-300 text-sm">
                      {fly.weights.learningRate}
                    </span>
                  </div>
                </div>

                {/* Left vs Right Lobula Sensors */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>LEFT COMPOUND EYE WEIGHTS</span>
                    <span>RIGHT COMPOUND EYE WEIGHTS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-cyan-300">
                      [{fly.weights.sensorWeightsLeft.map((w) => w.toFixed(2)).join(', ')}]
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-purple-500/20 text-purple-300 text-right">
                      [{fly.weights.sensorWeightsRight.map((w) => w.toFixed(2)).join(', ')}]
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio-Adaptive Explanation */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 text-[11px] leading-relaxed">
                <span className="font-bold text-cyan-400 block mb-1">
                  🧠 How Drosophila Connectome Learns in Real-Time:
                </span>
                Each fly casts 7 optic flow rays simulating compound eye ommatidia. When proximity to circuit walls drops below safety margins or impacts occur, an optical flow imbalance activates synaptic plasticity. Using learning rate η = {fly.weights.learningRate}, the neural network adjusts its sensor weights, turning earlier away from barriers on subsequent laps to achieve faster and cleaner lap times.
              </div>
            </div>
          )}

          {/* TAB 3: DRIVING STYLE & TRAITS */}
          {activeTab === 'style' && (
            <div className="flex flex-col gap-3.5">
              {/* Style Hero Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-bold border"
                    style={{
                      backgroundColor: `${fly.eyeColor}18`,
                      borderColor: `${fly.eyeColor}55`,
                      color: fly.eyeColor,
                    }}
                  >
                    STYLE: {fly.drivingStyle.title.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400">{fly.team}</span>
                </div>

                <p className="text-sm font-bold text-white leading-snug">
                  &ldquo;{fly.drivingStyle.tagline}&rdquo;
                </p>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {fly.drivingStyle.description}
                </p>

                {/* Trait badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fly.drivingStyle.traits.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-cyan-400" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Radar Style Gauge Bars */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
                <span className="font-bold text-white text-xs pb-1 border-b border-slate-800">
                  DRIVING ATTRIBUTES & TACTICAL METRICS
                </span>

                <div className="flex flex-col gap-2 text-xs">
                  {/* Aggression */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Aggression & Overtaking</span>
                      <span className="font-bold text-rose-400">{fly.drivingStyle.aggressionScore} / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
                        style={{ width: `${fly.drivingStyle.aggressionScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Cornering Precision */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Cornering Precision</span>
                      <span className="font-bold text-emerald-400">{fly.drivingStyle.corneringScore} / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                        style={{ width: `${fly.drivingStyle.corneringScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Top Speed */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Straightline Velocity</span>
                      <span className="font-bold text-amber-400">{fly.drivingStyle.speedScore} / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                        style={{ width: `${fly.drivingStyle.speedScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Plasticity */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Synaptic Plasticity (Adaptation)</span>
                      <span className="font-bold text-purple-400">{fly.drivingStyle.plasticityScore} / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
                        style={{ width: `${fly.drivingStyle.plasticityScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Status */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Safety Margin & Barrier Recovery</span>
                    <span className="text-[9px] text-slate-400">
                      Total Laps: {fly.state.lapsCompleted} • Crashes / Adaptations: {fly.state.crashCount}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                  {fly.state.crashCount === 0 ? '100% CLEAN' : `${fly.state.crashCount} ADAPTATIONS`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: fly.eyeColor }} />
            <span>Click any fly on the track or timing tower to inspect</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLinkConnectome}
              className="px-3 py-1.5 rounded-lg font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Link 3D Brain</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
