'use client';

import React, { useRef, useState } from 'react';
import { ComparisonResult } from '@/types/fly';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Download, Share2, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface OfficialCertificateProps {
  result: ComparisonResult;
  nameA: string;
  nameB: string;
  iconAUrl: string;
  iconBUrl: string;
}

export const OfficialCertificate: React.FC<OfficialCertificateProps> = ({
  result,
  nameA,
  nameB,
  iconAUrl,
  iconBUrl,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const winnerName = result.winner === 'A' ? nameA : result.winner === 'B' ? nameB : 'Neither (Equilibrium)';
  const winnerLetter = result.winner;
  const winnerMetrics = result.winner === 'A' ? result.metricsA : result.metricsB;

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);

    try {
      // Fire confetti celebration
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#818cf8', '#ec4899', '#34d399'],
      });

      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#030712',
      });

      const link = document.createElement('a');
      link.download = `FlyEye-ASO-${nameA}-vs-${nameB}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export certificate image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const tweetText = `Our app icon A/B test was just biologically evaluated by a simulated 165,122-neuron Drosophila melanogaster (fruit fly) brain! 🪰📱

Winner: ${winnerName} (${result.projectedCtrLift} projected Apple Search Ads CTR lift).

Verdict: "${result.quip}"

Tested with FlyEye ASO (Janelia connectome simulation):`;

  const handleShareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&hashtags=FlyEyeASO,iOSDev,IndieDev,ASO,Neuroscience`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 px-3 text-xs font-mono text-cyan-400">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>BIOLOGICAL ASO VERIFICATION COMPLETE</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Text!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handleShareTwitter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share on X</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PNG...' : 'Download Card (PNG)'}</span>
          </button>
        </div>
      </div>

      {/* The Printable / Exportable High-Res Card */}
      <div
        ref={certificateRef}
        className="w-full relative p-8 rounded-3xl bg-[#030712] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-slate-100 flex flex-col gap-6"
      >
        {/* Background bio-cyberpunk accent glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🪰
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>DROSOPHILA CONNECTOME ASO AUDIT</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HHMI JANELIA CNS v1.0
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                165,122 Biological Neurons • 10M+ Synaptic Connections
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right font-mono">
            <span className="text-[10px] text-slate-500">AUDIT REF</span>
            <span className="text-xs text-cyan-400 font-semibold">
              FLY-ASO-{Math.random().toString(36).substring(2, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Winner Hero Banner */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>BIOLOGICALLY CERTIFIED WINNER</span>
            </div>
            <div className="text-2xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              <span>{winnerName}</span>
              {winnerLetter !== 'TIE' && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-extrabold">
                  ICON {winnerLetter}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              {result.scientificVerdict}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-center min-w-[150px] shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Projected ASA CTR Lift
            </span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              {result.projectedCtrLift}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 mt-0.5">
              Saccade Dominance: {winnerMetrics.saccadeFixation}%
            </span>
          </div>
        </div>

        {/* Side-by-side Visual Comparison Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Icon A */}
          <div
            className={`p-4 rounded-xl flex flex-col items-center gap-3 border ${
              winnerLetter === 'A'
                ? 'bg-cyan-950/20 border-cyan-500/50'
                : 'bg-slate-950/40 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full text-xs font-mono">
              <span className="text-cyan-400 font-bold">ICON A</span>
              <span className="text-slate-400 truncate max-w-[120px]">{nameA}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconAUrl}
              alt={nameA}
              className="w-24 h-24 rounded-2xl object-contain shadow-lg border border-slate-700/60"
            />
            <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-mono pt-2 border-t border-slate-800">
              <div className="p-1.5 rounded bg-slate-900/60">
                <span className="text-slate-400 block">Phototaxis</span>
                <span className="font-bold text-cyan-300">{result.metricsA.phototaxisScore}/100</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60">
                <span className="text-slate-400 block">Dopamine</span>
                <span className="font-bold text-pink-400">{result.metricsA.dopamineDelta > 0 ? `+${result.metricsA.dopamineDelta}%` : `${result.metricsA.dopamineDelta}%`}</span>
              </div>
            </div>
          </div>

          {/* Icon B */}
          <div
            className={`p-4 rounded-xl flex flex-col items-center gap-3 border ${
              winnerLetter === 'B'
                ? 'bg-purple-950/20 border-purple-500/50'
                : 'bg-slate-950/40 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full text-xs font-mono">
              <span className="text-purple-400 font-bold">ICON B</span>
              <span className="text-slate-400 truncate max-w-[120px]">{nameB}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconBUrl}
              alt={nameB}
              className="w-24 h-24 rounded-2xl object-contain shadow-lg border border-slate-700/60"
            />
            <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-mono pt-2 border-t border-slate-800">
              <div className="p-1.5 rounded bg-slate-900/60">
                <span className="text-slate-400 block">Phototaxis</span>
                <span className="font-bold text-purple-300">{result.metricsB.phototaxisScore}/100</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60">
                <span className="text-slate-400 block">Dopamine</span>
                <span className="font-bold text-pink-400">{result.metricsB.dopamineDelta > 0 ? `+${result.metricsB.dopamineDelta}%` : `${result.metricsB.dopamineDelta}%`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Biological Roast & Recommendations */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2">
          <div className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span>🔬 NEUROBIOLOGICAL OBSERVATIONS:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            &ldquo;{result.roast}&rdquo;
          </p>
          <div className="pt-2 mt-1 border-t border-slate-900 flex flex-col gap-1 text-[11px] font-mono text-slate-400">
            <span className="text-slate-200 font-semibold">Apple Search Ads (ASA) Strategy:</span>
            <span>{result.asaRecommendation}</span>
          </div>
        </div>

        {/* Footer Seal & Verification Stamp */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-900 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>FlyEye ASO • Client-Side Drosophila Connectome Engine</span>
          </div>
          <span>flyeye-aso.vercel.app</span>
        </div>
      </div>
    </div>
  );
};
