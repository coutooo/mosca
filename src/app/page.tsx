'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RacingTelemetry, TrackRecord, RaceStatus } from '@/types/racing';
import { RaceTrackCanvas } from '@/components/RaceTrackCanvas';
import { TrackRecordHUD } from '@/components/TrackRecordHUD';
import { Brain3D } from '@/components/Brain3D';
import { calculateNextRaceCountdown } from '@/lib/raceSchedule';
import {
  Trophy,
  Share2,
  Check,
  Sparkles,
  Zap,
  Eye,
  Flag,
  Play,
} from 'lucide-react';

export default function Home() {
  const [telemetry, setTelemetry] = useState<RacingTelemetry | null>(null);
  const [newRecordAlert, setNewRecordAlert] = useState<TrackRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Scheduled race lifecycle states
  const [raceStatus, setRaceStatus] = useState<RaceStatus>('WAITING');
  const [startingLightsCount, setStartingLightsCount] = useState<number>(0);
  const [secondsUntilNext, setSecondsUntilNext] = useState<number>(180);
  const [eventName, setEventName] = useState<string>('Monaco Drosophila Grand Prix');

  // Master countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const { secondsUntil, eventName: name } = calculateNextRaceCountdown();
      setSecondsUntilNext(secondsUntil);
      setEventName(name);

      // If scheduled time arrives and we are currently waiting -> trigger race!
      if (secondsUntil <= 1 && raceStatus === 'WAITING') {
        startRaceSequence();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [raceStatus]);

  // Start Race Sequence (Starting lights 1 -> 2 -> 3 -> 4 -> 5 -> GO!)
  const startRaceSequence = useCallback(() => {
    setRaceStatus('STARTING_LIGHTS');
    setStartingLightsCount(1);

    const intv = setInterval(() => {
      setStartingLightsCount((prev) => {
        if (prev >= 5) {
          clearInterval(intv);
          setTimeout(() => {
            setRaceStatus('RACING');
            setStartingLightsCount(0);
          }, 600);
          return 5;
        }
        return prev + 1;
      });
    }, 550);
  }, []);

  const handleRaceFinished = useCallback((finalRecord: TrackRecord | null) => {
    setRaceStatus('FINISHED');
    setTimeout(() => {
      setRaceStatus('WAITING');
    }, 6000);
  }, []);

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
    ? `The 165,122-neuron Drosophila melanogaster (fruit fly) brain connectome just set an official circuit lap record: ${telemetry.lapRecord.formattedTime} at ${telemetry.lapRecord.topSpeed} cm/s! 🪰🏁

Runs only during scheduled Grand Prix heats. Powered by Janelia biological connectome:

#DrosophilaGrandPrix #Neuroscience #AutonomousAI #TechTwitter`
    : `Watching a 165,122-neuron fruit fly compete in scheduled Grand Prix races! 🪰🏁`;

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
                  SCHEDULED RACES
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              The Self-Driving Fruit Fly • 165,122 Neurons • Races on Scheduled Heats
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
        
        {/* Track Canvas Column */}
        <div className="w-full lg:col-span-2 flex flex-col gap-3">
          <RaceTrackCanvas
            raceStatus={raceStatus}
            startingLightsCount={startingLightsCount}
            onTelemetryUpdate={handleTelemetryUpdate}
            onNewRecord={handleNewRecord}
            onRaceFinished={handleRaceFinished}
            totalRaceLaps={2}
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
            <span>Circuit Length: 420m • 12 Sector Checkpoints</span>
            <span className="text-cyan-400">
              {raceStatus === 'RACING' ? '● Official Heat In Progress' : 'Grid Idling • Next Heat Scheduled'}
            </span>
          </div>
        </div>

        {/* 3D Brain Telemetry Column */}
        <div className="w-full flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D CONNECTOME IN ACTION</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {raceStatus === 'RACING' ? `${telemetry?.speed || 0} cm/s` : 'IDLE MEMBRANE'}
              </span>
            </div>

            <div className="w-full h-[220px] rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden">
              <Brain3D
                steeringAngle={raceStatus === 'RACING' ? (telemetry?.steeringAngle || 0) : 0}
                speed={raceStatus === 'RACING' ? (telemetry?.speed || 0) : 0}
                dopamineSurge={telemetry?.dopamineSurge || false}
                painShock={telemetry?.painShock || false}
                leftFlow={raceStatus === 'RACING' ? (telemetry?.leftEyeOpticalFlow || 0.5) : 0.2}
                rightFlow={raceStatus === 'RACING' ? (telemetry?.rightEyeOpticalFlow || 0.5) : 0.2}
                height={220}
              />
            </div>

            {/* Neural Cluster Live Status */}
            <div className="flex flex-col gap-2 font-mono text-[11px] pt-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    raceStatus === 'RACING' && (telemetry?.steeringAngle || 0) < -0.2 ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                  }`} />
                  <span>Left Lobula (L. Turn)</span>
                </span>
                <span className="font-bold text-cyan-400">
                  {raceStatus === 'RACING' ? `${Math.round((telemetry?.leftEyeOpticalFlow || 0.5) * 100)}% Excitatory` : 'Resting'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    raceStatus === 'RACING' && (telemetry?.steeringAngle || 0) > 0.2 ? 'bg-purple-400 animate-ping' : 'bg-slate-700'
                  }`} />
                  <span>Right Lobula (R. Turn)</span>
                </span>
                <span className="font-bold text-purple-400">
                  {raceStatus === 'RACING' ? `${Math.round((telemetry?.rightEyeOpticalFlow || 0.5) * 100)}% Excitatory` : 'Resting'}
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
                  {telemetry?.dopamineSurge ? '🍬 +DOPAMINE SURGE' : 'Baseline Plasticity'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track Records, Live Deltas, and Scheduled Races Board */}
      <div className="w-full">
        <TrackRecordHUD
          raceStatus={raceStatus}
          secondsUntilNextEvent={secondsUntilNext}
          eventName={eventName}
          onStartRaceNow={startRaceSequence}
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
            The fly’s ommatidia compound eyes measure optical flow. When a barrier approaches on the left, high-frequency spikes in the left lobula plate trigger rightward counter-steering.
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
            The fly remains parked on the starting line between heats. When the scheduled time arrives (or when triggered manually), the starting lights extinguish and the official 2-lap race begins!
          </p>
        </div>
      </div>
    </div>
  );
}
