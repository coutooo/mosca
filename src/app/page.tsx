'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PRESET_PAIRS } from '@/lib/presets';
import { VisionMode, ComparisonResult } from '@/types/fly';
import { computeImageMetrics, compareDrosophilaIcons } from '@/lib/visionEngine';
import { CompoundEyeViewer } from '@/components/CompoundEyeViewer';
import { Brain3D } from '@/components/Brain3D';
import { SpikeRasterPlot } from '@/components/SpikeRasterPlot';
import { OfficialCertificate } from '@/components/OfficialCertificate';
import {
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  Cpu,
  Eye,
  Activity,
  Zap,
} from 'lucide-react';

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_PAIRS[0].id);
  const [nameA, setNameA] = useState<string>(PRESET_PAIRS[0].nameA);
  const [nameB, setNameB] = useState<string>(PRESET_PAIRS[0].nameB);
  const [iconAUrl, setIconAUrl] = useState<string>(PRESET_PAIRS[0].iconAUrl);
  const [iconBUrl, setIconBUrl] = useState<string>(PRESET_PAIRS[0].iconBUrl);

  const [visionMode, setVisionMode] = useState<VisionMode>('ommatidia');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPhase, setSimPhase] = useState<string>('');
  const [simProgress, setSimProgress] = useState<number>(0);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const [activeTab, setActiveTab] = useState<'eye' | 'brain' | 'raster'>('eye');

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  // Switch preset
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

  // Upload handler for custom icons
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

  // Run the multi-stage biological simulation
  const runSimulation = () => {
    setIsSimulating(true);
    setSimProgress(5);
    setSimPhase('Projecting onto 800 ommatidia hexagonal facets...');

    const imgA = new Image();
    const imgB = new Image();
    imgA.crossOrigin = 'anonymous';
    imgB.crossOrigin = 'anonymous';

    let loaded = 0;
    const onBothLoaded = () => {
      // Step 1: Canvas processing
      setTimeout(() => {
        setSimProgress(30);
        setSimPhase('Firing Lamina L1/L2 high-pass edge contrast detectors...');
      }, 500);

      // Step 2: Medulla motion & phototaxis
      setTimeout(() => {
        setSimProgress(60);
        setSimPhase('Calculating Medulla T4/T5 optical flow & UV/blue phototaxis...');
      }, 1100);

      // Step 3: Mushroom body dopamine release
      setTimeout(() => {
        setSimProgress(85);
        setSimPhase('Modulating Mushroom Body Kenyon cells with dopamine reward...');
      }, 1700);

      // Final evaluation
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
        setSimProgress(100);
        setSimPhase('Biological audit complete.');
        setIsSimulating(false);
      }, 2300);
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

  // Run automatically on initial load with the default preset
  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex flex-col items-center py-8 px-4 sm:px-6 max-w-6xl mx-auto gap-10">
      {/* Hero Headline */}
      <section className="text-center flex flex-col items-center gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>POWERED BY THE JANELIA DROSOPHILA CONNECTOME (165K NEURONS)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Stop Guessing What Humans Want.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
            Optimize For The Fruit Fly.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          Human A/B testing is slow and noisy. We simulate the complete visual circuit of an adult male <em>Drosophila melanogaster</em> to evaluate app icon phototaxis, edge contrast, and saccadic gaze capture in milliseconds.
        </p>
      </section>

      {/* Preset Selector Carousel */}
      <section className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>POPULAR ICON BATTLES</span>
          <span>OR UPLOAD YOUR OWN ICONS BELOW</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PRESET_PAIRS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex -space-x-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.iconAUrl} alt="" className="w-7 h-7 rounded-lg border border-slate-700 bg-slate-950" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.iconBUrl} alt="" className="w-7 h-7 rounded-lg border border-slate-700 bg-slate-950" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">{p.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Icon Dropzones / Inputs */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Box A */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconAUrl}
              alt="Icon A"
              className="w-14 h-14 rounded-2xl border border-slate-700 shadow-md object-contain bg-slate-950"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Candidate A</span>
              <input
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white border-b border-transparent focus:border-cyan-500 outline-none w-44"
                placeholder="App Icon A name"
              />
            </div>
          </div>
          <button
            onClick={() => fileInputRefA.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload A</span>
          </button>
          <input
            ref={fileInputRefA}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'A')}
          />
        </div>

        {/* Upload Box B */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconBUrl}
              alt="Icon B"
              className="w-14 h-14 rounded-2xl border border-slate-700 shadow-md object-contain bg-slate-950"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Candidate B</span>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white border-b border-transparent focus:border-purple-500 outline-none w-44"
                placeholder="App Icon B name"
              />
            </div>
          </div>
          <button
            onClick={() => fileInputRefB.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload B</span>
          </button>
          <input
            ref={fileInputRefB}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'B')}
          />
        </div>
      </section>

      {/* Main Execution CTA */}
      <section className="w-full flex flex-col items-center gap-3">
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-base tracking-wide uppercase shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center gap-3"
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>Simulating 165k Neurons...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Run Drosophila Connectome A/B Test</span>
            </>
          )}
        </button>

        {/* Live Simulation Progress HUD */}
        {isSimulating && (
          <div className="w-full max-w-md flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{simPhase}</span>
              </span>
              <span>{simProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                style={{ width: `${simProgress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Interactive Tabs: Compound Eye, 3D Brain, Spike Oscilloscope */}
      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('eye')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'eye'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Compound Eye Vision</span>
          </button>

          <button
            onClick={() => setActiveTab('brain')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'brain'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3D Drosophila Brain</span>
          </button>

          <button
            onClick={() => setActiveTab('raster')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'raster'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Spike Raster Oscilloscope</span>
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="w-full">
          {activeTab === 'eye' && (
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

          {activeTab === 'brain' && (
            <div className="w-full h-[400px] rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-2xl">
              <Brain3D
                isSimulating={isSimulating}
                winner={result?.winner}
              />
            </div>
          )}

          {activeTab === 'raster' && (
            <SpikeRasterPlot
              isSimulating={isSimulating}
              metricsA={result?.metricsA}
              metricsB={result?.metricsB}
            />
          )}
        </div>
      </section>

      {/* Official Biological Certificate & Export */}
      {result && (
        <section className="w-full pt-4">
          <OfficialCertificate
            result={result}
            nameA={nameA}
            nameB={nameB}
            iconAUrl={iconAUrl}
            iconBUrl={iconBUrl}
          />
        </section>
      )}

      {/* Educational & Scientific Explainers */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-slate-800">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">800 Ommatidia Facets</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drosophila compound eyes do not see high-resolution text. They rely on hexagonal refractive units optimized for edge transitions, high contrast, and rapid movement detection.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Lamina L1/L2 Edge Detectors</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monopolar cells in the Lamina act as biological spatial high-pass filters. Icons with crisp silhouette separation trigger strong action potentials, dominating App Store scroll attention.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Mushroom Body Dopamine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Associative valence is encoded in the fly&apos;s Kenyon cells. Dopaminergic neurons reinforce stimuli that simulate ripe nutrient sources, while avoidance circuits steer clear of muddy predators.
          </p>
        </div>
      </section>
    </div>
  );
}
