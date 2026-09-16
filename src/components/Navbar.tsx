'use client';

import React from 'react';
import { Sparkles, ExternalLink, Code2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            🪰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Drosophila <span className="text-cyan-400">Grand Prix</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                165k Connectome
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              The Self-Driving Fruit Fly • Autonomous Racing
            </p>
          </div>
        </div>

        {/* Badges and Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://male-cns.janelia.org/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Janelia Connectome Data</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          <a
            href="https://github.com/fruitflydev/flycoinrh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Connectome Reference</span>
          </a>
        </div>
      </div>
    </header>
  );
};
