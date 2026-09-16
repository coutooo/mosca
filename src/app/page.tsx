'use client';

import React, { useState, useCallback } from 'react';
import { RacingTelemetry, TrackRecord } from '@/types/racing';
import { RaceTrackCanvas } from '@/components/RaceTrackCanvas';
import { TrackRecordHUD } from '@/components/TrackRecordHUD';
import { Brain3D } from '@/components/Brain3D';
import { formatLapTime } from '@/lib/trackData';
import {
  Trophy,
  Share2,
  Check,
  Sparkles,
  Zap,
  Eye,
  Flag,
} from 'lucide-react';

export default function Home() {
  const [telemetry, setTelemetry] = useState<RacingTelemetry | null>(null);
  const [newRecordAlert, setNewRecordAlert] = useState<TrackRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTelemetryUpdate = useCallback((t: RacingTelemetry) => {
    setTelemetry(t);
  }, []);

  const handleNewRecord = useCallback((r: TrackRecord) => {
    setNewRecordAlert(r);
    setTimeout(() => {
      setNewRecordAlert(null);
    }, 6000);
  }, []);

  const tweetText = telemetry?.lapRecord
    ? `The 165,122-neuron Drosophila melanogaster (fruit fly) brain connectome just broke the circuit lap record: ${telemetry.lapRecord.formattedTime} at ${telemetry.lapRecord.topSpeed} cm/s! 🪰🏁

Autonomous racing with zero human inputs. Powered by Janelia biological connectome:

#DrosophilaGrandPrix #Neuroscience #AutonomousAI #TechTwitter`
    : `Watching a 165,122-neuron fruit fly learn to race an F1 circuit completely on its own! 🪰🏁`;

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4 sm:px-6 max-w-6xl mx-auto gap-6">
      {/* Sleek Racing Header */}
      <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            🪰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>DROSOPHILA GRAND PRIX</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AUTONOMOUS CONNECTOME
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              The Self-Driving Fruit Fly • 165,122 Neurons • Learning 100% Autonomously
            </p>
          </div>
        </div>

        {/* Share & Social Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Telemetry'}</span>
          </button>
          <button
            onClick={handleShareTwitter}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share Record on X</span>
          </button>
        </div>
      </header>

      {/* Main Arena: The Circuit (Left) + The Live 3D Connectome (Right) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Track Canvas Column (2 Columns wide on desktop) */}
        <div className="w-full lg:col-span-2 flex flex-col gap-3">
          <RaceTrackCanvas
            onTelemetryUpdate={handleTelemetryUpdate}
            onNewRecord={handleNewRecord}
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
            <span>Circuit Length: 420m • 12 Sector Checkpoints</span>
            <span className="text-cyan-400">Zero Human Inputs • Real-Time Hebbian Adaptation</span>
          </div>
        </div>

        {/* 3D Brain Telemetry Column (1 Column wide on desktop) */}
        <div className="w-full flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D CONNECTOME IN ACTION</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {telemetry?.speed || 0} cm/s
              </span>
            </div>

            <div className="w-full h-[220px] rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden">
              <Brain3D
                steeringAngle={telemetry?.steeringAngle || 0}
                speed={telemetry?.speed || 0}
                dopamineSurge={telemetry?.dopamineSurge || false}
                painShock={telemetry?.painShock || false}
                leftFlow={telemetry?.leftEyeOpticalFlow || 0.5}
                rightFlow={telemetry?.rightEyeOpticalFlow || 0.5}
                height={220}
              />
            </div>

            {/* Neural Cluster Live Status */}
            <div className="flex flex-col gap-2 font-mono text-[11px] pt-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    (telemetry?.steeringAngle || 0) < -0.2 ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                  }`} />
                  <span>Left Lobula (A. Turn)</span>
                </span>
                <span className="font-bold text-cyan-400">
                  {Math.round((telemetry?.leftEyeOpticalFlow || 0.5) * 100)}% Excitatory
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    (telemetry?.steeringAngle || 0) > 0.2 ? 'bg-purple-400 animate-ping' : 'bg-slate-700'
                  }`} />
                  <span>Right Lobula (B. Turn)</span>
                </span>
                <span className="font-bold text-purple-400">
                  {Math.round((telemetry?.rightEyeOpticalFlow || 0.5) * 100)}% Excitatory
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    telemetry?.dopamineSurge ? 'bg-pink-400 animate-ping' : 'bg-slate-700'
                  }`} />
                  <span>Mushroom Body</span>
                </span>
                <span className={`font-bold ${telemetry?.dopamineSurge ? 'text-pink-400 font-black' : 'text-slate-500'}`}>
                  {telemetry?.dopamineSurge ? '🍬 +DOPAMINE SURGE' : 'Normal Resting'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track Records, Live Delas, and Scheduled Races Board */}
      <div className="w-full">
        <TrackRecordHUD
          telemetry={telemetry}
          newRecordAlert={newRecordAlert}
        />
      </div>

      {/* Explainer / Science Behind The Self-Driving Fly */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
            <Eye className="w-4 h-4" />
            <span>Elementary Motion Detectors (EMD)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The fly’s ommatidia compound eyes continuously measure optical flow. When a barrier approaches on the left, high-frequency spikes in the left lobula plate trigger rightward counter-steering.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-pink-400 text-xs font-mono font-bold">
            <Zap className="w-4 h-4" />
            <span>Mushroom Body Plasticity</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every clean sector and completed lap triggers natural dopamine release in Kenyon cell alpha-lobes. Crashing activates the Giant Fiber nociception circuit, pruning bad trajectory weights.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
            <Trophy className="w-4 h-4" />
            <span>Scheduled Grand Prix Heats</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Between races, the fly undergoes continuous autonomous qualifying. Every 15 minutes, official championship lights turn green for a 3-lap Grand Prix heat to shatter the all-time track record.
          </p>
        </div>
      </div>
    </div>
  );
}
