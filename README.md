# 🪰 FlyEye ASO — Biologically Proven App Icon A/B Testing

> *"Stop guessing what humans want. Optimize for the 165,122-neuron central nervous system of Drosophila melanogaster."*

An open-source, **100% client-side** biological App Icon A/B testing suite built with Next.js, TypeScript, Tailwind CSS, HTML5 Canvas, and Three.js. Grounded in the landmark **HHMI Janelia Male Drosophila CNS Connectome** dataset (~165k neurons, 10M+ synapses).

---

## ✨ Features

- 🔬 **800-Facet Ommatidia Compound Eye Vision Simulator**: Hexagonal optical facet downsampling modeling adult *Drosophila melanogaster* optics.
- ⚡ **Lamina L1/L2 High-Pass Saliency Heatmaps**: Calculates spatial edge gradients and Elementary Motion Detectors (EMD / Hassenstein-Reichardt correlators).
- 🌈 **UV & Rhodopsin Spectrum Channel**: Simulates R7 UV (~345nm) and R1-R6 rhodopsin (480nm) sensitivity with red channel suppression.
- 🧠 **Interactive 3D Drosophila Connectome Brain (Three.js)**: Real-time rotatable point cloud rendering of anatomical neural soma clusters (Optic lobes, Medulla, Lobula, Mushroom body, Central complex) with synaptic firing pulses.
- 📈 **Real-Time Spike Raster Oscilloscope**: Electrophysiological action potential tracing across sensory, optic, and motor neuron channels.
- 📜 **Biological ASO Audit Certificate**: Official exportable card with projected Apple Search Ads (ASA) CTR lift, saccade dominance, dopamine delta, and humorous neurobiological observations.
- 🐦 **1-Click Viral X / Twitter Sharing**: Pre-formatted tweet copy and 1-click high-res PNG download with confetti celebration.
- 🚀 **100% Client-Side**: Zero serverless overhead, zero GPU hosting costs. Infinitely scalable on Vercel's free tier.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Visual Computing**: HTML5 Canvas API (Hexagonal Ommatidia & Sobel Saliency Shaders)
- **3D Engine**: Three.js (Drosophila anatomical point cloud & synaptic pulse network)
- **Export & Effects**: `html-to-image`, `canvas-confetti`

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd mosca
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## ☁️ Deploy to Vercel in 1 Click

Since all computation and 3D rendering are **100% client-side**, this project has zero backend requirements and will never hit serverless timeout or memory limits.

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial FlyEye ASO release"
   git push origin main
   ```
2. Import the repository into [Vercel](https://vercel.com/new).
3. Click **Deploy**. Done!

---

## 📚 Scientific References

- **HHMI Janelia Research Campus, Cambridge University & Google Research**: *Sexual dimorphism in the complete connectome of the Drosophila male central nervous system* ([Janelia Male CNS](https://male-cns.janelia.org/download/)).
- **`fruitflydev/flycoinrh`**: Open-source biological LIF connectome inspiration.
