'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Brain3DProps {
  isSimulating: boolean;
  simPhase?: string;
  winner?: 'A' | 'B' | 'TIE' | null;
  hoveredSide?: 'A' | 'B' | null;
  feedbackEffect?: 'sugar' | 'shock' | null;
  height?: number;
}

export const Brain3D: React.FC<Brain3DProps> = ({
  isSimulating,
  simPhase,
  winner,
  hoveredSide,
  feedbackEffect,
  height = 260,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    isSimulating,
    winner,
    hoveredSide,
    feedbackEffect,
  });

  // Keep stateRef up to date without triggering Three.js rebuilds
  useEffect(() => {
    stateRef.current = {
      isSimulating,
      winner,
      hoveredSide,
      feedbackEffect,
    };
  }, [isSimulating, winner, hoveredSide, feedbackEffect]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 340;
    const h = height;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 1000);
    camera.position.set(0, 3, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // -------------------------------------------------------------
    // Anatomical Drosophila Connectome Clusters (165,122 modeled neurons)
    // -------------------------------------------------------------
    const neuronCount = 2200;
    const positions = new Float32Array(neuronCount * 3);
    const colors = new Float32Array(neuronCount * 3);
    const baseColors = new Float32Array(neuronCount * 3);
    const clusterTypes: ('opticL' | 'opticR' | 'central' | 'mushroom' | 'centralComplex' | 'giantFiber')[] = [];

    // Distinct anatomical color palette
    const colorOpticL = new THREE.Color('#38bdf8');       // Cyan - Left Optic Lobe (receives Candidate A)
    const colorOpticR = new THREE.Color('#c084fc');       // Purple - Right Optic Lobe (receives Candidate B)
    const colorCentral = new THREE.Color('#64748b');      // Slate blue - Central protocerebrum
    const colorMushroom = new THREE.Color('#f43f5e');     // Pink/Red - Mushroom Body (Dopamine & Learning)
    const colorCentralComplex = new THREE.Color('#10b981'); // Emerald - Central Complex (Navigation & Saccade)
    const colorGiantFiber = new THREE.Color('#fbbf24');   // Amber/Gold - Giant Fiber (Escape circuit)

    let pIdx = 0;
    for (let i = 0; i < neuronCount; i++) {
      let x = 0, y = 0, z = 0;
      let cluster: 'opticL' | 'opticR' | 'central' | 'mushroom' | 'centralComplex' | 'giantFiber' = 'central';
      let c = colorCentral;

      const r = Math.random();
      if (r < 0.28) {
        // 1. Left Optic Lobe (Medulla, Lobula, Photoreceptors) -> Pointing towards Candidate A (left)
        cluster = 'opticL';
        c = colorOpticL;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.2 + Math.random() * 1.6;
        x = -6.8 + rad * Math.cos(v) * Math.cos(u) * 0.9;
        y = rad * Math.sin(v) * 1.35;
        z = rad * Math.cos(v) * Math.sin(u) * 0.9;
      } else if (r < 0.56) {
        // 2. Right Optic Lobe -> Pointing towards Candidate B (right)
        cluster = 'opticR';
        c = colorOpticR;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.2 + Math.random() * 1.6;
        x = 6.8 + rad * Math.cos(v) * Math.cos(u) * 0.9;
        y = rad * Math.sin(v) * 1.35;
        z = rad * Math.cos(v) * Math.sin(u) * 0.9;
      } else if (r < 0.73) {
        // 3. Central Protocerebrum (Brain Core)
        cluster = 'central';
        c = colorCentral;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.8 + Math.random() * 1.2;
        x = rad * Math.cos(v) * Math.cos(u) * 1.05;
        y = rad * Math.sin(v) * 1.05;
        z = rad * Math.cos(v) * Math.sin(u) * 0.85;
      } else if (r < 0.87) {
        // 4. Mushroom Body (Kenyon cells & Dopaminergic neurons)
        cluster = 'mushroom';
        c = colorMushroom;
        const side = Math.random() > 0.5 ? 1 : -1;
        const t = Math.random();
        x = side * (1.2 + t * 2.2 + (Math.random() - 0.5) * 0.7);
        y = 1.0 + Math.sin(t * Math.PI) * 2.4 + (Math.random() - 0.5) * 0.6;
        z = 1.0 + (Math.random() - 0.5) * 1.2;
      } else if (r < 0.95) {
        // 5. Central Complex (Ellipsoid body / Gaze Direction)
        cluster = 'centralComplex';
        c = colorCentralComplex;
        const ang = Math.random() * Math.PI * 2;
        const rad = 1.4 + Math.random() * 0.7;
        x = rad * Math.cos(ang);
        y = -0.5 + Math.random() * 1.4;
        z = rad * Math.sin(ang) * 0.6;
      } else {
        // 6. Giant Fiber Neurons (Escape reflex descending pathway)
        cluster = 'giantFiber';
        c = colorGiantFiber;
        x = (Math.random() - 0.5) * 1.2;
        y = -1.0 - Math.random() * 4.5;
        z = -0.5 + (Math.random() - 0.5) * 1.0;
      }

      positions[pIdx] = x;
      positions[pIdx + 1] = y;
      positions[pIdx + 2] = z;

      colors[pIdx] = c.r;
      colors[pIdx + 1] = c.g;
      colors[pIdx + 2] = c.b;

      baseColors[pIdx] = c.r;
      baseColors[pIdx + 1] = c.g;
      baseColors[pIdx + 2] = c.b;

      clusterTypes.push(cluster);
      pIdx += 3;
    }

    const neuronGeometry = new THREE.BufferGeometry();
    neuronGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    neuronGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite
    const canvasDot = document.createElement('canvas');
    canvasDot.width = 32;
    canvasDot.height = 32;
    const ctxDot = canvasDot.getContext('2d')!;
    const grad = ctxDot.createRadialGradient(16, 16, 2, 16, 16, 15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(200, 240, 255, 0.95)');
    grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxDot.fillStyle = grad;
    ctxDot.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvasDot);

    const neuronMaterial = new THREE.PointsMaterial({
      size: 0.85,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const neuronParticles = new THREE.Points(neuronGeometry, neuronMaterial);
    brainGroup.add(neuronParticles);

    // Synaptic connections (Lines between adjacent neurons)
    const linePositions: number[] = [];
    for (let i = 0; i < 550; i++) {
      const idxA = Math.floor(Math.random() * neuronCount);
      const idxB = Math.floor(Math.random() * neuronCount);

      const ax = positions[idxA * 3];
      const ay = positions[idxA * 3 + 1];
      const az = positions[idxA * 3 + 2];

      const bx = positions[idxB * 3];
      const by = positions[idxB * 3 + 1];
      const bz = positions[idxB * 3 + 2];

      const dist = Math.hypot(ax - bx, ay - by, az - bz);
      if (dist < 2.9 && dist > 0.4) {
        linePositions.push(ax, ay, az, bx, by, bz);
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const synapticLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    brainGroup.add(synapticLines);

    // Interaction controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      brainGroup.rotation.y += deltaX * 0.008;
      brainGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const { isSimulating, winner, hoveredSide, feedbackEffect } = stateRef.current;

      // Gentle auto-rotation
      if (!isDragging) {
        brainGroup.rotation.y += 0.003;
      }

      const colorAttr = neuronGeometry.attributes.color as THREE.BufferAttribute;
      const colorArray = colorAttr.array as Float32Array;

      // Pulse neural areas based on active stimuli
      for (let i = 0; i < neuronCount; i++) {
        const cluster = clusterTypes[i];
        const baseR = baseColors[i * 3];
        const baseG = baseColors[i * 3 + 1];
        const baseB = baseColors[i * 3 + 2];

        let intensity = 1.0;

        if (isSimulating) {
          // Rapid firing of both Optic Lobes and Mushroom Body
          const wave = Math.sin(elapsedTime * 14 + positions[i * 3] * 0.8);
          if (wave > 0.4) {
            intensity = 2.8;
          }
          if (cluster === 'mushroom') {
            intensity = 2.2 + Math.sin(elapsedTime * 10 + i) * 0.8;
          }
        } else if (feedbackEffect === 'sugar') {
          // Sugar reward: Mushroom Body explodes with hot pink & gold dopamine
          if (cluster === 'mushroom') {
            intensity = 3.5 + Math.sin(elapsedTime * 16 + i) * 1.5;
          }
        } else if (feedbackEffect === 'shock') {
          // Electric shock: Giant fiber & central complex flash with high voltage
          if (cluster === 'giantFiber' || cluster === 'centralComplex') {
            intensity = 4.0 + (Math.random() > 0.5 ? 2.0 : 0.0);
          }
        } else if (winner === 'A' || hoveredSide === 'A') {
          // Left Optic Lobe (Candidate A) is actively stimulated
          if (cluster === 'opticL') {
            intensity = 2.4 + Math.sin(elapsedTime * 8 + i * 0.2) * 0.8;
          } else if (cluster === 'mushroom' && winner === 'A') {
            intensity = 1.8 + Math.sin(elapsedTime * 4 + i * 0.1) * 0.5;
          }
        } else if (winner === 'B' || hoveredSide === 'B') {
          // Right Optic Lobe (Candidate B) is actively stimulated
          if (cluster === 'opticR') {
            intensity = 2.4 + Math.sin(elapsedTime * 8 + i * 0.2) * 0.8;
          } else if (cluster === 'mushroom' && winner === 'B') {
            intensity = 1.8 + Math.sin(elapsedTime * 4 + i * 0.1) * 0.5;
          }
        } else {
          // Baseline resting potential oscillation (alpha waves)
          intensity = 0.85 + Math.sin(elapsedTime * 2.5 + i * 0.15) * 0.25;
        }

        colorArray[i * 3] = Math.min(1.0, baseR * intensity);
        colorArray[i * 3 + 1] = Math.min(1.0, baseG * intensity);
        colorArray[i * 3 + 2] = Math.min(1.0, baseB * intensity);
      }

      colorAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      camera.aspect = newW / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: `${height}px` }}
      />

      {/* Floating Anatomical Activity HUD */}
      <div className="w-full flex items-center justify-between px-2 pt-1 font-mono text-[10px]">
        {/* Left Optic Lobe Indicator */}
        <div className={`flex items-center gap-1.5 transition-all ${
          winner === 'A' || hoveredSide === 'A' || isSimulating ? 'text-cyan-400 font-bold scale-105' : 'text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            winner === 'A' || hoveredSide === 'A' || isSimulating ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
          }`} />
          <span>Left Optic Lobe (A)</span>
        </div>

        {/* Central Complex & Mushroom Body */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[9px] border transition-all ${
            feedbackEffect === 'sugar' || (winner && !isSimulating)
              ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_10px_rgba(244,63,94,0.4)] font-bold'
              : 'bg-slate-900/60 text-slate-400 border-slate-800'
          }`}>
            Mushroom Body {feedbackEffect === 'sugar' ? '🍬 +DANs' : feedbackEffect === 'shock' ? '⚡ Aversion' : ''}
          </span>
        </div>

        {/* Right Optic Lobe Indicator */}
        <div className={`flex items-center gap-1.5 transition-all ${
          winner === 'B' || hoveredSide === 'B' || isSimulating ? 'text-purple-400 font-bold scale-105' : 'text-slate-500'
        }`}>
          <span>Right Optic Lobe (B)</span>
          <span className={`w-1.5 h-1.5 rounded-full ${
            winner === 'B' || hoveredSide === 'B' || isSimulating ? 'bg-purple-400 animate-ping' : 'bg-slate-600'
          }`} />
        </div>
      </div>
    </div>
  );
};
