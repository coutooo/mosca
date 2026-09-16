'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Brain3DProps {
  steeringAngle?: number; // -1 (hard left) to +1 (hard right)
  speed?: number;
  dopamineSurge?: boolean;
  painShock?: boolean;
  leftFlow?: number;
  rightFlow?: number;
  height?: number;
}

export const Brain3D: React.FC<Brain3DProps> = ({
  steeringAngle = 0,
  speed = 0,
  dopamineSurge = false,
  painShock = false,
  leftFlow = 0.5,
  rightFlow = 0.5,
  height = 140,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    steeringAngle,
    speed,
    dopamineSurge,
    painShock,
    leftFlow,
    rightFlow,
  });

  useEffect(() => {
    stateRef.current = {
      steeringAngle,
      speed,
      dopamineSurge,
      painShock,
      leftFlow,
      rightFlow,
    };
  }, [steeringAngle, speed, dopamineSurge, painShock, leftFlow, rightFlow]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 340;
    const h = height;

    const scene = new THREE.Scene();
    // Bring camera closer (z=14.5) to make the brain connectome fill the viewport dramatically
    const camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 1000);
    camera.position.set(0, 0, 14.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // 2,200 Anatomical Connectome Neurons (Janelia Drosophila connectome model)
    const neuronCount = 2200;
    const positions = new Float32Array(neuronCount * 3);
    const colors = new Float32Array(neuronCount * 3);
    const baseColors = new Float32Array(neuronCount * 3);
    const clusterTypes: ('opticL' | 'opticR' | 'central' | 'mushroom' | 'centralComplex' | 'giantFiber')[] = [];

    const colorOpticL = new THREE.Color('#38bdf8');         // Cyan - Left Optic Lobe
    const colorOpticR = new THREE.Color('#c084fc');         // Purple - Right Optic Lobe
    const colorCentral = new THREE.Color('#475569');        // Slate - Protocerebrum
    const colorMushroom = new THREE.Color('#f43f5e');       // Hot Pink - Mushroom Body
    const colorCentralComplex = new THREE.Color('#10b981'); // Emerald - Central Complex Steering
    const colorGiantFiber = new THREE.Color('#fbbf24');     // Gold/Amber - Giant Fiber

    let pIdx = 0;
    for (let i = 0; i < neuronCount; i++) {
      let x = 0, y = 0, z = 0;
      let cluster: 'opticL' | 'opticR' | 'central' | 'mushroom' | 'centralComplex' | 'giantFiber' = 'central';
      let c = colorCentral;

      const r = Math.random();
      if (r < 0.28) {
        cluster = 'opticL';
        c = colorOpticL;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.2 + Math.random() * 1.6;
        x = -6.2 + rad * Math.cos(v) * Math.cos(u) * 0.9;
        y = rad * Math.sin(v) * 1.35;
        z = rad * Math.cos(v) * Math.sin(u) * 0.9;
      } else if (r < 0.56) {
        cluster = 'opticR';
        c = colorOpticR;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.2 + Math.random() * 1.6;
        x = 6.2 + rad * Math.cos(v) * Math.cos(u) * 0.9;
        y = rad * Math.sin(v) * 1.35;
        z = rad * Math.cos(v) * Math.sin(u) * 0.9;
      } else if (r < 0.73) {
        cluster = 'central';
        c = colorCentral;
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;
        const rad = 3.8 + Math.random() * 1.2;
        x = rad * Math.cos(v) * Math.cos(u) * 1.05;
        y = rad * Math.sin(v) * 1.05;
        z = rad * Math.cos(v) * Math.sin(u) * 0.85;
      } else if (r < 0.87) {
        cluster = 'mushroom';
        c = colorMushroom;
        const side = Math.random() > 0.5 ? 1 : -1;
        const t = Math.random();
        x = side * (1.2 + t * 2.2 + (Math.random() - 0.5) * 0.7);
        y = 1.0 + Math.sin(t * Math.PI) * 2.4 + (Math.random() - 0.5) * 0.6;
        z = 1.0 + (Math.random() - 0.5) * 1.2;
      } else if (r < 0.95) {
        cluster = 'centralComplex';
        c = colorCentralComplex;
        const ang = Math.random() * Math.PI * 2;
        const rad = 1.4 + Math.random() * 0.7;
        x = rad * Math.cos(ang);
        y = -0.5 + Math.random() * 1.4;
        z = rad * Math.sin(ang) * 0.6;
      } else {
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

    // Particle sprite with high-intensity core for bioluminescent neuron firing
    const canvasDot = document.createElement('canvas');
    canvasDot.width = 64;
    canvasDot.height = 64;
    const ctxDot = canvasDot.getContext('2d')!;
    const grad = ctxDot.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(230, 245, 255, 0.95)');
    grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxDot.fillStyle = grad;
    ctxDot.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvasDot);

    const neuronMaterial = new THREE.PointsMaterial({
      size: 1.45,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const neuronParticles = new THREE.Points(neuronGeometry, neuronMaterial);
    brainGroup.add(neuronParticles);

    // Synaptic connections (nerve fibers)
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
      if (dist < 3.2 && dist > 0.4) {
        linePositions.push(ax, ay, az, bx, by, bz);
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
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

    // Animation Loop: Real-time action potentials & calcium imaging activity
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const { steeringAngle, speed, dopamineSurge, painShock, leftFlow, rightFlow } = stateRef.current;

      if (!isDragging) {
        // Subtle organic float + responsive tilt with steering
        const targetRotY = steeringAngle * 0.45 + Math.sin(elapsedTime * 0.8) * 0.08;
        const targetRotZ = -steeringAngle * 0.25;
        brainGroup.rotation.y = THREE.MathUtils.lerp(brainGroup.rotation.y, targetRotY, 0.08);
        brainGroup.rotation.z = THREE.MathUtils.lerp(brainGroup.rotation.z, targetRotZ, 0.08);
      }

      const colorAttr = neuronGeometry.attributes.color as THREE.BufferAttribute;
      const colorArray = colorAttr.array as Float32Array;

      // Detect turning activity
      const isSteeringLeft = steeringAngle < -0.06 || leftFlow > 0.35;
      const isSteeringRight = steeringAngle > 0.06 || rightFlow > 0.35;

      for (let i = 0; i < neuronCount; i++) {
        const cluster = clusterTypes[i];
        const baseR = baseColors[i * 3];
        const baseG = baseColors[i * 3 + 1];
        const baseB = baseColors[i * 3 + 2];

        let outR = baseR;
        let outG = baseG;
        let outB = baseB;

        if (painShock) {
          // Crash shock wave
          outR = 1.0;
          outG = cluster === 'giantFiber' ? 0.9 : 0.2;
          outB = 0.1;
        } else if (dopamineSurge) {
          // Mushroom Body dopamine burst (Kenyon cells fire bright pink & electric gold)
          if (cluster === 'mushroom') {
            const strobe = Math.sin(elapsedTime * 22 + i * 0.5);
            outR = 1.0;
            outG = 0.25 + (strobe > 0 ? 0.7 : 0);
            outB = 0.7;
          } else {
            outR = THREE.MathUtils.lerp(baseR, 1.0, 0.4);
            outG = THREE.MathUtils.lerp(baseG, 0.6, 0.3);
            outB = THREE.MathUtils.lerp(baseB, 1.0, 0.4);
          }
        } else {
          // Active Biological Firing & Action Potentials
          if (cluster === 'opticL') {
            if (isSteeringLeft) {
              // Rapid calcium imaging strobe in Left Lobula!
              const spike = Math.sin(elapsedTime * 24 + i * 0.85);
              const intensity = spike > 0 ? 1.0 : 0.3;
              outR = THREE.MathUtils.lerp(0.2, 1.0, intensity);
              outG = THREE.MathUtils.lerp(0.75, 1.0, intensity);
              outB = 1.0; // Glowing Electric Cyan
            } else {
              // Resting background firing
              const restPulse = Math.sin(elapsedTime * 3 + i * 0.1) * 0.15;
              outR = baseR * (0.8 + restPulse);
              outG = baseG * (0.8 + restPulse);
              outB = baseB * (0.8 + restPulse);
            }
          } else if (cluster === 'opticR') {
            if (isSteeringRight) {
              // Rapid calcium imaging strobe in Right Lobula!
              const spike = Math.sin(elapsedTime * 24 + i * 0.85);
              const intensity = spike > 0 ? 1.0 : 0.3;
              outR = THREE.MathUtils.lerp(0.75, 1.0, intensity);
              outG = THREE.MathUtils.lerp(0.4, 0.9, intensity);
              outB = 1.0; // Glowing Neon Violet
            } else {
              const restPulse = Math.sin(elapsedTime * 3 + i * 0.1) * 0.15;
              outR = baseR * (0.8 + restPulse);
              outG = baseG * (0.8 + restPulse);
              outB = baseB * (0.8 + restPulse);
            }
          } else if (cluster === 'centralComplex') {
            // Central Complex (steering motor engine) pulses faster with forward velocity
            const speedRate = Math.max(4, speed * 0.35);
            const pulse = Math.sin(elapsedTime * speedRate + i * 0.4);
            const act = pulse > 0.2 ? 0.8 : 0.2;
            outR = THREE.MathUtils.lerp(baseR, 0.8, act);
            outG = THREE.MathUtils.lerp(baseG, 1.0, act); // Emerald glow
            outB = THREE.MathUtils.lerp(baseB, 0.8, act);
          } else {
            // Resting protocerebrum breathing wave
            const wave = Math.sin(elapsedTime * 2.5 + i * 0.08) * 0.2;
            outR = baseR * (0.8 + wave);
            outG = baseG * (0.8 + wave);
            outB = baseB * (0.8 + wave);
          }
        }

        colorArray[i * 3] = outR;
        colorArray[i * 3 + 1] = outG;
        colorArray[i * 3 + 2] = outB;
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
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      <div
        ref={mountRef}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
