'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Brain3DProps {
  isSimulating: boolean;
  winner?: 'A' | 'B' | 'TIE' | null;
  activeSide?: 'A' | 'B' | 'BOTH';
}

export const Brain3D: React.FC<Brain3DProps> = ({ isSimulating, winner, activeSide = 'BOTH' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group to hold the whole Drosophila brain
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Generate anatomical clusters:
    // Left Optic Lobe (medulla/lobula), Right Optic Lobe, Central Brain, Mushroom Body, Central Complex
    const neuronCount = 1800;
    const positions = new Float32Array(neuronCount * 3);
    const colors = new Float32Array(neuronCount * 3);
    const originalColors = new Float32Array(neuronCount * 3);
    const neuronClusters: string[] = [];

    const colorCentral = new THREE.Color('#38bdf8'); // cyan
    const colorOpticL = new THREE.Color('#818cf8');  // indigo
    const colorOpticR = new THREE.Color('#a855f7');  // purple
    const colorMushroom = new THREE.Color('#ec4899'); // hot pink / dopamine
    const colorCentralComplex = new THREE.Color('#10b981'); // emerald green

    let pIdx = 0;
    for (let i = 0; i < neuronCount; i++) {
      let x = 0, y = 0, z = 0;
      let cluster = 'central';
      let c = colorCentral;

      const r = Math.random();
      if (r < 0.28) {
        // Left Optic Lobe (compound eye & medulla)
        cluster = 'opticL';
        c = colorOpticL;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.5 + Math.random() * 1.5;
        x = -7.5 + rad * Math.cos(v) * Math.cos(u) * 0.8;
        y = rad * Math.sin(v) * 1.4;
        z = rad * Math.cos(v) * Math.sin(u) * 0.9;
      } else if (r < 0.56) {
        // Right Optic Lobe
        cluster = 'opticR';
        c = colorOpticR;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.5 + Math.random() * 1.5;
        x = 7.5 + rad * Math.cos(v) * Math.cos(u) * 0.8;
        y = rad * Math.sin(v) * 1.4;
        z = rad * Math.cos(v) * Math.sin(u) * 0.9;
      } else if (r < 0.76) {
        // Central Brain Protocerebrum
        cluster = 'central';
        c = colorCentral;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 4.5 + Math.random() * 1.2;
        x = rad * Math.cos(v) * Math.cos(u) * 1.1;
        y = rad * Math.sin(v) * 1.1;
        z = rad * Math.cos(v) * Math.sin(u) * 0.9;
      } else if (r < 0.9) {
        // Mushroom Body (Caleyx, Peduncle & Lobes) - bilateral lobes
        cluster = 'mushroom';
        c = colorMushroom;
        const side = Math.random() > 0.5 ? 1 : -1;
        const t = Math.random();
        x = side * (1.5 + t * 2.8 + (Math.random() - 0.5) * 0.8);
        y = 1.0 + Math.sin(t * Math.PI) * 2.8 + (Math.random() - 0.5) * 0.8;
        z = 1.2 + (Math.random() - 0.5) * 1.5;
      } else {
        // Central Complex (Ellipsoid body & Fan-shaped body)
        cluster = 'centralComplex';
        c = colorCentralComplex;
        const ang = Math.random() * Math.PI * 2;
        const rad = 1.5 + Math.random() * 0.8;
        x = rad * Math.cos(ang);
        y = -0.8 + Math.random() * 1.5;
        z = rad * Math.sin(ang) * 0.6;
      }

      positions[pIdx] = x;
      positions[pIdx + 1] = y;
      positions[pIdx + 2] = z;

      colors[pIdx] = c.r;
      colors[pIdx + 1] = c.g;
      colors[pIdx + 2] = c.b;

      originalColors[pIdx] = c.r;
      originalColors[pIdx + 1] = c.g;
      originalColors[pIdx + 2] = c.b;

      neuronClusters.push(cluster);
      pIdx += 3;
    }

    const neuronGeometry = new THREE.BufferGeometry();
    neuronGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    neuronGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite texture
    const canvasDot = document.createElement('canvas');
    canvasDot.width = 32;
    canvasDot.height = 32;
    const ctxDot = canvasDot.getContext('2d')!;
    const grad = ctxDot.createRadialGradient(16, 16, 2, 16, 16, 15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(200, 240, 255, 0.9)');
    grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxDot.fillStyle = grad;
    ctxDot.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvasDot);

    const neuronMaterial = new THREE.PointsMaterial({
      size: 0.75,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const neuronParticles = new THREE.Points(neuronGeometry, neuronMaterial);
    brainGroup.add(neuronParticles);

    // Synaptic connections (Lines between nearby neurons)
    const linePositions: number[] = [];
    for (let i = 0; i < 400; i++) {
      const idxA = Math.floor(Math.random() * neuronCount);
      const idxB = Math.floor(Math.random() * neuronCount);

      const ax = positions[idxA * 3];
      const ay = positions[idxA * 3 + 1];
      const az = positions[idxA * 3 + 2];

      const bx = positions[idxB * 3];
      const by = positions[idxB * 3 + 1];
      const bz = positions[idxB * 3 + 2];

      const dist = Math.hypot(ax - bx, ay - by, az - bz);
      if (dist < 3.2 && dist > 0.4) {
        linePositions.push(ax, ay, az, bx, by, bz);
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const synapticLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    brainGroup.add(synapticLines);

    // Mouse drag interaction
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

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation if not dragging
      if (!isDragging) {
        brainGroup.rotation.y += 0.004;
      }

      // Live synaptic pulsing when simulating or displaying winner
      const colorAttr = neuronGeometry.attributes.color as THREE.BufferAttribute;
      const colorArray = colorAttr.array as Float32Array;

      for (let i = 0; i < neuronCount; i++) {
        const cluster = neuronClusters[i];
        const baseR = originalColors[i * 3];
        const baseG = originalColors[i * 3 + 1];
        const baseB = originalColors[i * 3 + 2];

        let pulse = 1.0;

        if (isSimulating) {
          // Rapid wave of firing across optic lobes and central complex
          const wave = Math.sin(elapsedTime * 9 + positions[i * 3] * 0.5 + positions[i * 3 + 1]);
          if (wave > 0.6) {
            pulse = 2.4;
          }
        } else if (winner) {
          // Highlight winning hemisphere or dopamine mushroom body
          if (winner === 'A' && (cluster === 'opticL' || cluster === 'mushroom')) {
            pulse = 1.6 + Math.sin(elapsedTime * 5 + i) * 0.5;
          } else if (winner === 'B' && (cluster === 'opticR' || cluster === 'mushroom')) {
            pulse = 1.6 + Math.sin(elapsedTime * 5 + i) * 0.5;
          }
        } else {
          // Subtle resting membrane potential oscillation (alpha rhythm)
          pulse = 0.85 + Math.sin(elapsedTime * 2 + i * 0.1) * 0.25;
        }

        colorArray[i * 3] = Math.min(1.0, baseR * pulse);
        colorArray[i * 3 + 1] = Math.min(1.0, baseG * pulse);
        colorArray[i * 3 + 2] = Math.min(1.0, baseB * pulse);
      }

      colorAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
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
  }, [isSimulating, winner, activeSide]);

  return (
    <div className="relative w-full h-full min-h-[280px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1 text-[10px] font-mono text-cyan-400/80 bg-slate-950/70 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-cyan-500/20">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>DROSOPHILA CNS 3D MAP</span>
        </div>
        <div className="text-slate-400">165,122 NEURONS • 10M+ SYNAPSES</div>
      </div>

      <div className="absolute bottom-2 right-2 pointer-events-none text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
        Click & drag to rotate
      </div>
    </div>
  );
};
