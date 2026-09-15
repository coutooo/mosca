import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 py-10 px-4 sm:px-6 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪰</span>
            <span className="font-bold text-white text-sm">FlyEye ASO</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Open Source
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The world&apos;s first App Icon A/B testing suite powered by a real-time client-side simulation of the adult male <em>Drosophila melanogaster</em> central nervous system.
          </p>
          <p className="text-[11px] text-slate-500 italic">
            *Disclaimer: While our ommatidia optics and elementary motion detectors are grounded in published insect neurobiology, fruit flies are notoriously susceptible to glowing blue screens and will occasionally fly into windows.
          </p>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs text-slate-400">
          <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">Scientific Foundation</span>
          <a
            href="https://male-cns.janelia.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            • HHMI Janelia Male CNS Connectome
          </a>
          <a
            href="https://www.cam.ac.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            • University of Cambridge Connectomics
          </a>
          <a
            href="https://research.google/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            • Google Research Connectomics
          </a>
          <a
            href="https://github.com/fruitflydev/flycoinrh"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            • In honor of @fruitflydev LIF Connectome
          </a>
        </div>
      </div>
    </footer>
  );
};
