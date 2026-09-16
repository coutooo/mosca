'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RacingTelemetry, TrackRecord, RaceStatus, FlyCompetitor, SavedRaceReplay, MultiFlyFrame } from '@/types/racing';
import { RaceTrackCanvas } from '@/components/RaceTrackCanvas';
import { TrackRecordHUD } from '@/components/TrackRecordHUD';
import { Brain3D } from '@/components/Brain3D';
import { ReplayArchiveModal } from '@/components/ReplayArchiveModal';
import { calculateNextRaceCountdown, formatCountdown } from '@/lib/raceSchedule';
import { clearStoredRecords } from '@/lib/racingConnectome';
import { getSavedReplays, saveRaceReplay } from '@/lib/replayStorage';
import { formatLapTime } from '@/lib/trackData';
import {
  Trophy,
  Share2,
  Check,
  Sparkles,
  Clock,
  Video,
  Square,
  History,
} from 'lucide-react';

export default function Home() {
  const [telemetry, setTelemetry] = useState<RacingTelemetry | null>(null);
  const [newRecordAlert, setNewRecordAlert] = useState<TrackRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [focusedFlyId, setFocusedFlyId] = useState<string>('fly-1');

  // Daily scheduled race lifecycle states (13:00 and 21:00)
  const [raceStatus, setRaceStatus] = useState<RaceStatus>('WAITING');
  const [startingLightsCount, setStartingLightsCount] = useState<number>(0);
  const [secondsUntilNext, setSecondsUntilNext] = useState<number>(3600);
  const [eventName, setEventName] = useState<string>('Grand Prix do Meio-Dia (13:00)');
  const [targetTimeFormatted, setTargetTimeFormatted] = useState<string>('13:00');

  // Replay archive states
  const [hasReplay, setHasReplay] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [savedReplays, setSavedReplays] = useState<SavedRaceReplay[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<SavedRaceReplay | null>(null);

  // Load archived replays on mount
  useEffect(() => {
    setSavedReplays(getSavedReplays());
  }, []);

  // Master countdown timer (runs every second)
  useEffect(() => {
    const timer = setInterval(() => {
      const { secondsUntil, eventName: name, targetTimeFormatted: targetTime } = calculateNextRaceCountdown();
      setSecondsUntilNext(secondsUntil);
      setEventName(name);
      setTargetTimeFormatted(targetTime);

      // Trigger scheduled race when time arrives
      if (secondsUntil <= 1 && raceStatus === 'WAITING' && !isReplaying) {
        startRaceSequence();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [raceStatus, isReplaying]);

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

  const handleRaceFinished = useCallback((winner: FlyCompetitor, finalRecord: TrackRecord | null) => {
    setRaceStatus('FINISHED');
    setTimeout(() => {
      setRaceStatus('WAITING');
    }, 6000);
  }, []);

  const handleSaveRunReplay = useCallback((frames: MultiFlyFrame[], winner: FlyCompetitor, record: TrackRecord | null) => {
    const newReplay: SavedRaceReplay = {
      id: `replay-${Date.now()}`,
      title: `${eventName} • Vencedor: ${winner.name}`,
      date: `Hoje, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      winnerName: winner.name,
      winnerTeam: winner.team,
      winnerColor: winner.eyeColor,
      bestLap: winner.bestLapTime ? formatLapTime(winner.bestLapTime) : '14.82s',
      totalLaps: 2,
      frames,
    };
    saveRaceReplay(newReplay);
    setSavedReplays(getSavedReplays());
  }, [eventName]);

  const handleSelectReplay = useCallback((rep: SavedRaceReplay) => {
    setSelectedReplay(rep);
    setIsReplaying(true);
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

  const handleClearHistory = useCallback(() => {
    clearStoredRecords();
    setTelemetry((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        lapRecord: null,
        recentRecords: [],
      };
    });
    setNewRecordAlert(null);
  }, []);

  const tweetText = telemetry?.lapRecord
    ? `The 165,122-neuron Drosophila melanogaster (fruit fly) brain connectome just set an official circuit lap record: ${telemetry.lapRecord.formattedTime} at ${telemetry.lapRecord.topSpeed} cm/s! 🪰🏁

Runs only 2 official heats per day (13:00 & 21:00) with autonomous multi-fly overtaking:

#DrosophilaGrandPrix #Neuroscience #AutonomousAI #TechTwitter`
    : `Watching 4 autonomous 165,122-neuron fruit flies race on a wide Grand Prix circuit! 🪰🏁`;

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFly = telemetry?.competitors?.find((c) => c.id === focusedFlyId);
  const currentLapTime = telemetry?.currentLapTime || 0;
  const isRacing = raceStatus === 'RACING';

  return (
    <main className="h-screen w-screen max-h-screen overflow-hidden bg-[#050811] text-slate-100 flex flex-col p-2.5 sm:p-3 select-none">
      {/* 1. Sleek Minimalist Top Header */}
      <header className="h-11 shrink-0 flex items-center justify-between border-b border-slate-800/80 px-1 pb-2">
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/20 border border-cyan-500/40 flex items-center justify-center text-sm shadow">
            🪰
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white font-mono">
              DROSOPHILA GRAND PRIX
            </h1>
            <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
              165,122 Neurons • 2 Corridas Diárias (13:00 & 21:00)
            </span>
          </div>
        </div>

        {/* Center: Live Schedule / Race Status */}
        <div className="flex items-center gap-2">
          {isReplaying ? (
            <div className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>REPLAY: {selectedReplay?.title || 'CORRIDA GRAVADA'}</span>
            </div>
          ) : isRacing ? (
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-black flex items-center gap-1.5 shadow animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>OFFICIAL RACE IN PROGRESS</span>
            </div>
          ) : raceStatus === 'STARTING_LIGHTS' ? (
            <div className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-black flex items-center gap-1.5 shadow animate-bounce">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>STARTING LIGHTS...</span>
            </div>
          ) : (
            <div className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400">PRÓXIMA CORRIDA ({targetTimeFormatted}):</span>
              <span className="font-bold text-amber-400">{formatCountdown(secondsUntilNext)}</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Replays Archives Button */}
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Replays Antigos ({savedReplays.length})</span>
          </button>

          {isReplaying && (
            <button
              onClick={() => {
                setIsReplaying(false);
                setSelectedReplay(null);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1 shadow-sm"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Sair do Replay</span>
            </button>
          )}

          <button
            onClick={handleCopyText}
            className="px-2 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Copiar Telemetria"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleShareTwitter}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="hidden sm:inline">Post</span>
          </button>
        </div>
      </header>

      {/* 2. Main Cockpit Arena: Track on Left, Live Telemetry Stack on Right */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 pt-2">
        
        {/* Left Column: Track Canvas + Bottom Telemetry Strip */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0 gap-2">
          {/* Canvas Wrapper */}
          <div className="flex-1 min-h-0 relative">
            <RaceTrackCanvas
              raceStatus={raceStatus}
              startingLightsCount={startingLightsCount}
              isReplaying={isReplaying}
              selectedReplay={selectedReplay}
              onReplayFinished={() => {
                setIsReplaying(false);
                setSelectedReplay(null);
              }}
              onHasReplayChange={setHasReplay}
              onTelemetryUpdate={handleTelemetryUpdate}
              onNewRecord={handleNewRecord}
              onRaceFinished={handleRaceFinished}
              onSaveRunReplay={handleSaveRunReplay}
              focusedFlyId={focusedFlyId}
              totalRaceLaps={2}
            />
          </div>

          {/* Minimalist Bottom Telemetry Strip */}
          <div className="h-9 shrink-0 flex items-center justify-between px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            {/* Record */}
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 text-[11px]">RECORDE:</span>
              <span className="font-bold text-white">
                {telemetry?.lapRecord ? telemetry.lapRecord.formattedTime : '--:--.---'}
              </span>
              {telemetry?.lapRecord?.holderName && (
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  ({telemetry.lapRecord.holderName})
                </span>
              )}
            </div>

            {/* Live Lap & Speed */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="font-bold text-cyan-300">
                  {isRacing || isReplaying ? formatLapTime(currentLapTime) : '00:00.000'}
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-500">SPD</span>
                <span className="font-bold text-white">{telemetry?.speed || 0}</span>
                <span className="text-[9px] text-slate-500">cm/s</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-500">G</span>
                <span className="font-bold text-white">{telemetry?.gForce || 0}</span>
              </div>
            </div>

            {/* Optic Flow Meter */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="hidden sm:inline">ESTRADA LARGA (78px)</span>
              <div className="w-14 h-1.5 bg-slate-950 rounded-full flex overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-75"
                  style={{ width: `${(telemetry?.leftEyeOpticalFlow || 0.5) * 50}%` }}
                />
                <div className="w-0.5 h-full bg-slate-800" />
                <div
                  className="h-full bg-purple-500 transition-all duration-75 ml-auto"
                  style={{ width: `${(telemetry?.rightEyeOpticalFlow || 0.5) * 50}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Connectome + Timing Tower + Session Records */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 gap-2 overflow-hidden justify-between">
          
          {/* Card 1: 3D Connectome (Compact) */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 shrink-0 flex flex-col gap-1.5 shadow">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="text-[11px] font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>3D CONNECTOME</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {activeFly?.name || 'Janelia Red'} (P{activeFly?.rank || 1})
              </span>
            </div>

            {/* 4 Competitor Selector Buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 rounded-lg border border-slate-800">
              {[
                { id: 'fly-1', label: 'Janelia', color: '#ff2a4b' },
                { id: 'fly-2', label: 'Fly-Zero', color: '#22d3ee' },
                { id: 'fly-3', label: 'Apex', color: '#34d399' },
                { id: 'fly-4', label: 'Quantum', color: '#c084fc' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFocusedFlyId(f.id)}
                  className={`flex-1 py-0.5 px-1 rounded text-[9px] font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                    focusedFlyId === f.id
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="truncate">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Brain Canvas */}
            <div className="w-full h-[110px] rounded-lg bg-slate-950/80 border border-slate-800/60 overflow-hidden">
              <Brain3D
                steeringAngle={isRacing || isReplaying ? (telemetry?.steeringAngle || 0) : 0}
                speed={isRacing || isReplaying ? (telemetry?.speed || 0) : 0}
                dopamineSurge={telemetry?.dopamineSurge || false}
                painShock={telemetry?.painShock || false}
                leftFlow={isRacing || isReplaying ? (telemetry?.leftEyeOpticalFlow || 0.5) : 0.2}
                rightFlow={isRacing || isReplaying ? (telemetry?.rightEyeOpticalFlow || 0.5) : 0.2}
                height={110}
              />
            </div>

            {/* Neural Cluster Live Status Strip */}
            <div className="flex items-center justify-between text-[9px] font-mono px-1 text-slate-400">
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  (isRacing || isReplaying) && (telemetry?.steeringAngle || 0) < -0.2 ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                }`} />
                <span>L. Lobula</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  (isRacing || isReplaying) && (telemetry?.steeringAngle || 0) > 0.2 ? 'bg-purple-400 animate-ping' : 'bg-slate-700'
                }`} />
                <span>R. Lobula</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  telemetry?.dopamineSurge ? 'bg-pink-400 animate-ping' : 'bg-slate-700'
                }`} />
                <span className={telemetry?.dopamineSurge ? 'text-pink-400 font-bold' : ''}>
                  {telemetry?.dopamineSurge ? '+Dopamine' : 'Mushroom Body'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 & 3: Timing Tower + Session Records */}
          <div className="flex-1 min-h-0 flex flex-col justify-between">
            <TrackRecordHUD
              raceStatus={raceStatus}
              secondsUntilNextEvent={secondsUntilNext}
              eventName={eventName}
              hasReplay={hasReplay}
              isReplaying={isReplaying}
              onToggleReplay={() => setIsReplaying(!isReplaying)}
              telemetry={telemetry}
              newRecordAlert={newRecordAlert}
              focusedFlyId={focusedFlyId}
              onSelectFly={setFocusedFlyId}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </div>

      {/* Replay Archive Modal */}
      <ReplayArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        replays={savedReplays}
        onSelectReplay={handleSelectReplay}
      />
    </main>
  );
}
