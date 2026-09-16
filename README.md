# 🪰 Drosophila Grand Prix — The Self-Driving Fruit Fly

> *"Watch an adult Drosophila melanogaster central nervous system pilot an F1 Grand Prix circuit completely on its own using optical flow, elementary motion detection, and synaptic plasticity."*

An open-source, **100% client-side** autonomous motorsport broadcast built with Next.js 16, TypeScript, Tailwind CSS, HTML5 Canvas, and Three.js. Grounded in the landmark **HHMI Janelia Male Drosophila CNS Connectome** dataset (165,122 neurons, 10M+ synapses).

---

## ✨ Features

- 🏎️ **60 FPS Circuit de Drosophila**: Top-down high-speed circuit with hairpins, chicanes, high-speed esses, and DRS straights.
- 🪰 **Autonomous Connectome Navigation**: The fly pilots using 7 compound eye vision raycasts (Elementary Motion Detectors - EMD). No human input required.
- 🧠 **Live 3D Connectome Telemetry (Three.js)**: Real-time 3D brain model firing left/right lobula plates during cornering, central complex steering, and mushroom body dopamine surges.
- ⏱️ **Permanent Track Record Tracking**: The all-time circuit lap record, top speed, and generation history are permanently pointed out and tracked across sessions.
- 🕒 **Scheduled Grand Prix Heats**: The fly rests on the starting grid between races. Official championship heats trigger automatically on schedule every 5 minutes.
- 🚀 **100% Client-Side Spectator Experience**: Infinitely scalable on Vercel's free tier with zero backend or GPU hosting costs.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Physics & Simulation**: HTML5 Canvas (60 FPS raycasting & autonomous physics)
- **3D Engine**: Three.js (2,200 anatomical soma clusters & synaptic action potential lines)

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

All physics, neural calculations, and 3D rendering are **100% client-side**, so it deploys anywhere instantly without serverless limits.

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: Drosophila Grand Prix release"
   git push origin main
   ```
2. Import the repository into [Vercel](https://vercel.com/new).
3. Click **Deploy**. Done!

---

## 📚 Scientific References

- **HHMI Janelia Research Campus, Cambridge University & Google Research**: *Sexual dimorphism in the complete connectome of the Drosophila male central nervous system* ([Janelia Male CNS](https://male-cns.janelia.org/download/)).
- **`fruitflydev/flycoinrh`**: Open-source biological LIF connectome inspiration.
