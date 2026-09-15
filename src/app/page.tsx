'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PRESET_PAIRS } from '@/lib/presets';
import { VisionMode, ComparisonResult } from '@/types/fly';
import { computeImageMetrics, compareDrosophilaIcons } from '@/lib/visionEngine';
import { DrosophilaFly } from '@/components/DrosophilaFly';
import { CompoundEyeViewer } from '@/components/CompoundEyeViewer';
import { Brain3D } from '@/components/Brain3D';
import { SpikeRasterPlot } from '@/components/SpikeRasterPlot';
import { OfficialCertificate } from '@/components/OfficialCertificate';
import {
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  Share2,
  Check,
  ShieldCheck,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_PAIRS[0].id);
  const [nameA, setNameA] = useState<string>(PRESET_PAIRS[0].nameA);
  const [nameB, setNameB] = useState<string>(PRESET_PAIRS[0].nameB);
  const [iconAUrl, setIconAUrl] = useState<string>(PRESET_PAIRS[0].iconAUrl);
  const [iconBUrl, setIconBUrl] = useState<string>(PRESET_PAIRS[0].iconBUrl);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simPhase, setSimPhase] = useState<string>('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [hoveredSide, setHoveredSide] = useState<'A' | 'B' | null>(null);

  // Expandable nerdy inspector (optional so the UI remains super clean)
  const [showInspector, setShowInspector] = useState(false);
  const [visionMode, setVisionMode] = useState<VisionMode>('ommatidia');
  const [inspectorTab, setInspectorTab] = useState<'eye' | 'brain' | 'spikes'>('eye');

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (presetId: string) => {
    const p = PRESET_PAIRS.find((x) => x.id === presetId);
    if (!p) return;
    setSelectedPresetId(presetId);
    setNameA(p.nameA);
    setNameB(p.nameB);
    setIconAUrl(p.iconAUrl);
    setIconBUrl(p.iconBUrl);
    setResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (target === 'A') {
        setIconAUrl(url);
        setNameA(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        setIconBUrl(url);
        setNameB(file.name.replace(/\.[^/.]+$/, ''));
      }
      setSelectedPresetId('custom');
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimPhase('The fly is inspecting Candidate A & B...');

    const imgA = new Image();
    const imgB = new Image();
    imgA.crossOrigin = 'anonymous';
    imgB.crossOrigin = 'anonymous';

    let loaded = 0;
    const onBothLoaded = () => {
      setTimeout(() => {
        setSimPhase('Stimulating 800 ommatidia facets & optic lobes...');
      }, 600);

      setTimeout(() => {
        setSimPhase('Measuring mushroom body dopamine release...');
      }, 1200);

      setTimeout(() => {
        const cA = document.createElement('canvas');
        cA.width = 256;
        cA.height = 256;
        const ctxA = cA.getContext('2d')!;
        ctxA.drawImage(imgA, 0, 0, 256, 256);

        const cB = document.createElement('canvas');
        cB.width = 256;
        cB.height = 256;
        const ctxB = cB.getContext('2d')!;
        ctxB.drawImage(imgB, 0, 0, 256, 256);

        const metricsA = computeImageMetrics(cA);
        const metricsB = computeImageMetrics(cB);

        const comparison = compareDrosophilaIcons(metricsA, metricsB, nameA, nameB);
        setResult(comparison);
        setIsSimulating(false);

        // Fun celebration confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#a855f7', '#ec4899'],
        });
      }, 1800);
    };

    imgA.onload = () => {
      loaded++;
      if (loaded === 2) onBothLoaded();
    };
    imgB.onload = () => {
      loaded++;
      if (loaded === 2) onBothLoaded();
    };

    imgA.src = iconAUrl;
    imgB.src = iconBUrl;
  };

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex flex-col items-center py-8 px-4 sm:px-6 max-w-4xl mx-auto gap-8">
      {/* Clean Minimal Header */}
      <header className="text-center flex flex-col items-center gap-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Biological ASO • 165,122 Drosophila Neurons</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Let the Fly Pick Your App Icon
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-lg">
          Drop two icons. An adult fruit fly evaluates phototaxis, edge contrast, and visual gaze in real time.
        </p>
      </header>

      {/* Quick Presets Pills */}
      <div className="w-full flex items-center justify-center gap-2 flex-wrap">
        <span className="text-xs font-mono text-slate-500 mr-1 hidden sm:inline">Presets:</span>
        {PRESET_PAIRS.map((p) => {
          const isSelected = selectedPresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.title}
            </button>
          );
        })}
      </div>

      {/* The Central Arena: Icon A | The Fly | Icon B */}
      <div className="w-full relative p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6">
        
        {/* Arena Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          
          {/* Candidate A Card */}
          <div
            onMouseEnter={() => setHoveredSide('A')}
            onMouseLeave={() => setHoveredSide(null)}
            className={`relative flex flex-col items-center p-5 rounded-2xl border transition-all ${
              result?.winner === 'A'
                ? 'bg-cyan-950/30 border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            {result?.winner === 'A' && (
              <span className="absolute -top-3 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>FLY&apos;S CHOICE</span>
              </span>
            )}

            <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRefA.current?.click()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={iconAUrl}
                alt={nameA}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-contain bg-slate-900 shadow-xl border border-slate-700/80 transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                <Upload className="w-4 h-4" />
                <span>Change</span>
              </div>
            </div>

            <input
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              className="bg-transparent text-sm font-bold text-center text-white border-b border-transparent hover:border-slate-700 focus:border-cyan-500 outline-none w-full max-w-[180px] truncate"
              placeholder="Candidate A Name"
            />
            <span className="text-[10px] font-mono text-cyan-400 mt-1">CANDIDATE A</span>

            <input
              ref={fileInputRefA}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'A')}
            />
          </div>

          {/* Center: The Actual Drosophila Fruit Fly */}
          <div className="flex flex-col items-center justify-center py-2">
            <DrosophilaFly
              isDeciding={isSimulating}
              winner={result?.winner}
              hoveredSide={hoveredSide}
            />
            <span className="text-[10px] font-mono text-slate-500 mt-2 text-center">
              Drosophila melanogaster (Adult Male)
            </span>
          </div>

          {/* Candidate B Card */}
          <div
            onMouseEnter={() => setHoveredSide('B')}
            onMouseLeave={() => setHoveredSide(null)}
            className={`relative flex flex-col items-center p-5 rounded-2xl border transition-all ${
              result?.winner === 'B'
                ? 'bg-purple-950/30 border-purple-500/80 shadow-[0_0_25px_rgba(168,85,247,0.25)] ring-1 ring-purple-500'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            {result?.winner === 'B' && (
              <span className="absolute -top-3 px-3 py-0.5 rounded-full bg-purple-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>FLY&apos;S CHOICE</span>
              </span>
            )}

            <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRefB.current?.click()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={iconBUrl}
                alt={nameB}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-contain bg-slate-900 shadow-xl border border-slate-700/80 transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                <Upload className="w-4 h-4" />
                <span>Change</span>
              </div>
            </div>

            <input
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              className="bg-transparent text-sm font-bold text-center text-white border-b border-transparent hover:border-slate-700 focus:border-purple-500 outline-none w-full max-w-[180px] truncate"
              placeholder="Candidate B Name"
            />
            <span className="text-[10px] font-mono text-purple-400 mt-1">CANDIDATE B</span>

            <input
              ref={fileInputRefB}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'B')}
            />
          </div>
        </div>

        {/* Big Action CTA */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-black text-sm sm:text-base tracking-wide uppercase shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center gap-2.5"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>The Fly is Deciding...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Let the Fly Decide</span>
              </>
            )}
          </button>
          {isSimulating && (
            <span className="text-xs font-mono text-cyan-300 animate-pulse">
              {simPhase}
            </span>
          )}
        </div>
      </div>

      {/* Winner Summary Card (Only shown when not simulating and result exists) */}
      {result && !isSimulating && (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
          <OfficialCertificate
            result={result}
            nameA={nameA}
            nameB={nameB}
            iconAUrl={iconAUrl}
            iconBUrl={iconBUrl}
          />
        </div>
      )}

      {/* Optional Expandable Neuroscience Inspector */}
      <div className="w-full flex flex-col items-center gap-3 pt-2">
        <button
          onClick={() => setShowInspector(!showInspector)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-all"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showInspector ? 'Hide Neural Diagnostics' : 'Inspect Fly Vision (800 Facets & 3D Brain)'}</span>
          {showInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showInspector && (
          <div className="w-full p-5 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-inner flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
            {/* Mini Tabs */}
            <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setInspectorTab('eye')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  inspectorTab === 'eye'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Compound Eye View</span>
              </button>

              <button
                onClick={() => setInspectorTab('brain')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  inspectorTab === 'brain'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>3D Brain Connectome</span>
              </button>

              <button
                onClick={() => setInspectorTab('spikes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  inspectorTab === 'spikes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkle className="w-3.5 h-3.5" />
                <span>Spike Oscilloscope</span>
              </button>
            </div>

            {/* Inspector Content */}
            {inspectorTab === 'eye' && (
              <CompoundEyeViewer
                iconAUrl={iconAUrl}
                iconBUrl={iconBUrl}
                nameA={nameA}
                nameB={nameB}
                visionMode={visionMode}
                onModeChange={setVisionMode}
                winner={result?.winner}
              />
            )}

            {inspectorTab === 'brain' && (
              <div className="w-full h-[320px] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <Brain3D isSimulating={isSimulating} winner={result?.winner} />
              </div>
            )}

            {inspectorTab === 'spikes' && (
              <SpikeRasterPlot
                isSimulating={isSimulating}
                metricsA={result?.metricsA}
                metricsB={result?.metricsB}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
