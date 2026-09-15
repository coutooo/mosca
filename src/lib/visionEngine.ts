import { AnalysisMetrics, ComparisonResult, VisionMode } from '@/types/fly';

/**
 * Biological Drosophila Vision & Connectome Simulation Engine
 * Models:
 * - 800 hexagonal ommatidia optical facets per compound eye
 * - Photoreceptor spectral sensitivity (Rh1 480nm, Rh3/Rh4 UV 345nm, Rh5 blue 437nm, red attenuation)
 * - Lamina L1/L2 high-pass edge contrast detectors
 * - Medulla elementary motion & luminance gradient (phototaxis)
 * - Mushroom body (Kenyon cells) dopamine reward response
 * - Giant fiber neuron (predator looming escape reflex)
 */

export function renderVisionMode(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  mode: VisionMode
) {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const width = targetCanvas.width;
  const height = targetCanvas.height;

  if (mode === 'normal') {
    ctx.drawImage(sourceCanvas, 0, 0, width, height);
    return;
  }

  // Get source pixel data
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  tempCtx.drawImage(sourceCanvas, 0, 0, width, height);
  const srcImgData = tempCtx.getImageData(0, 0, width, height);
  const srcData = srcImgData.data;

  if (mode === 'spectral') {
    // Drosophila Insect Spectrum:
    // UV/Blue sensitivity boosted, green retained, red drastically suppressed
    const output = ctx.createImageData(width, height);
    const outData = output.data;

    for (let i = 0; i < srcData.length; i += 4) {
      const r = srcData[i];
      const g = srcData[i + 1];
      const b = srcData[i + 2];
      const a = srcData[i + 3];

      // UV proxy: high brightness + blue saturation
      const uvSim = Math.min(255, (b * 1.3 + (255 - r) * 0.4));
      // Fly perceives red as near black/dark grey
      const insectR = Math.min(255, r * 0.15 + b * 0.3);
      // Green is bright & prominent
      const insectG = Math.min(255, g * 1.1 + uvSim * 0.2);
      // Blue/UV is highly intense
      const insectB = Math.min(255, b * 1.4 + 20);

      outData[i] = insectR;
      outData[i + 1] = insectG;
      outData[i + 2] = insectB;
      outData[i + 3] = a;
    }

    ctx.putImageData(output, 0, 0);

    // Add faint corneal sheen
    const grad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width * 0.7);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    grad.addColorStop(1, 'rgba(150, 0, 255, 0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (mode === 'saliency') {
    // Optic Lobe Lamina L1/L2 Sobel Edge & Contrast Saliency Map
    const output = ctx.createImageData(width, height);
    const outData = output.data;

    // Convert to grayscale luminance
    const gray = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Insect luminance equation (UV/Blue weighted)
        gray[y * width + x] = 0.1 * srcData[idx] + 0.45 * srcData[idx + 1] + 0.45 * srcData[idx + 2];
      }
    }

    // Sobel edge filter for Lamina L1/L2 response
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const gx =
          -1 * gray[(y - 1) * width + (x - 1)] + 1 * gray[(y - 1) * width + (x + 1)] +
          -2 * gray[y * width + (x - 1)]       + 2 * gray[y * width + (x + 1)] +
          -1 * gray[(y + 1) * width + (x - 1)] + 1 * gray[(y + 1) * width + (x + 1)];

        const gy =
          -1 * gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - 1 * gray[(y - 1) * width + (x + 1)] +
           1 * gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + 1 * gray[(y + 1) * width + (x + 1)];

        const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.8);
        const pIdx = (y * width + x) * 4;

        // Biological heatmap palette: deep violet -> cyan -> neon green -> hot yellow
        if (magnitude < 40) {
          outData[pIdx] = 10;
          outData[pIdx + 1] = 8;
          outData[pIdx + 2] = 25;
        } else if (magnitude < 110) {
          outData[pIdx] = 0;
          outData[pIdx + 1] = Math.floor(magnitude * 1.5);
          outData[pIdx + 2] = 220;
        } else if (magnitude < 180) {
          outData[pIdx] = 0;
          outData[pIdx + 1] = 240;
          outData[pIdx + 2] = Math.floor(255 - magnitude);
        } else {
          outData[pIdx] = 255;
          outData[pIdx + 1] = 230;
          outData[pIdx + 2] = 50;
        }
        outData[pIdx + 3] = srcData[pIdx + 3];
      }
    }

    ctx.putImageData(output, 0, 0);
    return;
  }

  if (mode === 'ommatidia') {
    // Hexagonal Ommatidia compound eye grid (~800 facets)
    ctx.fillStyle = '#06080d';
    ctx.fillRect(0, 0, width, height);

    const facetRadius = Math.max(5, Math.floor(width / 34)); // produces ~800 facets in a circular/rounded rect aperture
    const horizDist = facetRadius * Math.sqrt(3);
    const vertDist = facetRadius * 1.5;

    let row = 0;
    for (let y = facetRadius; y < height + facetRadius; y += vertDist) {
      const xOffset = (row % 2 === 1) ? horizDist / 2 : 0;
      for (let x = facetRadius; x < width + horizDist; x += horizDist) {
        const sampleX = Math.min(width - 1, Math.max(0, Math.floor(x + xOffset)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.floor(y)));

        // Sample circular region inside the facet
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        const step = Math.max(1, Math.floor(facetRadius / 2));
        for (let dy = -facetRadius; dy <= facetRadius; dy += step) {
          for (let dx = -facetRadius; dx <= facetRadius; dx += step) {
            const px = sampleX + dx;
            const py = sampleY + dy;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              sumR += srcData[idx];
              sumG += srcData[idx + 1];
              sumB += srcData[idx + 2];
              count++;
            }
          }
        }

        const avgR = count > 0 ? sumR / count : 0;
        const avgG = count > 0 ? sumG / count : 0;
        const avgB = count > 0 ? sumB / count : 0;

        // Apply insect lens modulation (enhance blue/green contrast, mute red)
        const adjR = Math.min(255, Math.floor(avgR * 0.35 + avgB * 0.2));
        const adjG = Math.min(255, Math.floor(avgG * 1.15));
        const adjB = Math.min(255, Math.floor(avgB * 1.35));

        // Draw hexagon
        drawHexagon(ctx, sampleX, sampleY, facetRadius - 0.7, `rgb(${adjR},${adjG},${adjB})`);
      }
      row++;
    }

    // Vignette / Eye Curvature overlay
    const vignette = ctx.createRadialGradient(width/2, height/2, width*0.35, width/2, height/2, width*0.65);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(3, 7, 18, 0.65)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fillStyle: string) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const hx = x + radius * Math.cos(angle);
    const hy = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/**
 * Compute true quantitative biological visual metrics for an icon
 */
export function computeImageMetrics(canvas: HTMLCanvasElement): AnalysisMetrics {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return getFallbackMetrics();
  }

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let totalLuminance = 0;
  let uvBlueEnergy = 0;
  let redEnergy = 0;
  let edgeSum = 0;
  let activePixels = 0;

  // Luminance map for spatial frequency / edge analysis
  const luma = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a > 20) {
        activePixels++;
        // Insect eye spectral weighting
        const l = 0.1 * r + 0.45 * g + 0.45 * b;
        luma[y * width + x] = l;
        totalLuminance += l;
        uvBlueEnergy += (b * 1.2 + g * 0.8);
        redEnergy += r;
      }
    }
  }

  // Calculate Lamina L1/L2 edge contrast
  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      const center = luma[y * width + x];
      const dx = Math.abs(center - luma[y * width + (x + 2)]);
      const dy = Math.abs(center - luma[(y + 2) * width + x]);
      edgeSum += (dx + dy);
    }
  }

  const sampleCount = activePixels || (width * height);
  const avgLuminance = totalLuminance / sampleCount; // 0 to 255
  const avgEdge = edgeSum / (sampleCount * 0.25); // typical 0 to 80
  const blueVsRedRatio = redEnergy > 0 ? (uvBlueEnergy / redEnergy) : 2.0;

  // 1. Ommatidia activation (out of 800)
  // High contrast & luminance activates more ommatidia facets above noise threshold
  const ommatidiaFraction = Math.min(1, Math.max(0.35, (avgLuminance / 210) * 0.6 + (avgEdge / 50) * 0.4));
  const ommatidiaCount = Math.round(ommatidiaFraction * 780 + Math.random() * 15);

  // 2. Phototaxis Score (positive phototaxis favors bright, high-contrast, blue/UV saturated stimuli)
  const phototaxisScore = Math.min(99, Math.max(15, Math.round(
    (avgLuminance / 255) * 45 +
    Math.min(35, blueVsRedRatio * 15) +
    Math.min(20, (avgEdge / 40) * 20)
  )));

  // 3. Edge Contrast (Lamina L1/L2 excitation)
  const edgeContrast = Math.min(98, Math.max(18, Math.round(Math.min(100, (avgEdge / 45) * 100))));

  // 4. Spectral UV/Blue excitation
  const spectralUVBlue = Math.min(99, Math.max(10, Math.round(
    Math.min(100, (uvBlueEnergy / (sampleCount * 255 * 1.5)) * 100)
  )));

  // 5. Giant fiber escape reflex probability
  // Triggered when an icon has sudden looming, harsh black/red blotches or chaotic dark patterns
  const isHarshDark = avgLuminance < 60 && avgEdge > 35;
  const isExtremeRed = blueVsRedRatio < 0.6;
  let giantFiberReflex = Math.round(Math.min(85, Math.max(4,
    (isHarshDark ? 45 : 10) +
    (isExtremeRed ? 30 : 0) +
    (avgEdge > 60 ? 15 : 0)
  )));

  // 6. Mushroom body dopamine delta
  // High phototaxis + clean edges + high UV/blue - predator escape = dopamine release
  const rawAttractiveness = (phototaxisScore * 0.35) + (edgeContrast * 0.35) + (spectralUVBlue * 0.3) - (giantFiberReflex * 0.25);
  const overallAttractiveness = Math.min(99, Math.max(12, Math.round(Math.max(10, rawAttractiveness))));
  const dopamineDelta = Math.round((overallAttractiveness - 50) * 1.6);

  return {
    ommatidiaCount,
    phototaxisScore,
    edgeContrast,
    saccadeFixation: 50, // will be balanced comparatively
    dopamineDelta,
    giantFiberReflex,
    overallAttractiveness,
    spectralUVBlue,
  };
}

export function compareDrosophilaIcons(
  metricsA: AnalysisMetrics,
  metricsB: AnalysisMetrics,
  nameA: string,
  nameB: string
): ComparisonResult {
  const totalScoreA = metricsA.overallAttractiveness;
  const totalScoreB = metricsB.overallAttractiveness;
  const sum = totalScoreA + totalScoreB || 1;

  // Relative saccadic gaze fixation (%)
  metricsA.saccadeFixation = Math.round((totalScoreA / sum) * 100);
  metricsB.saccadeFixation = 100 - metricsA.saccadeFixation;

  const diff = Math.abs(metricsA.saccadeFixation - metricsB.saccadeFixation);
  const winnerMargin = diff;

  let winner: 'A' | 'B' | 'TIE' = 'TIE';
  if (metricsA.saccadeFixation > metricsB.saccadeFixation + 1) {
    winner = 'A';
  } else if (metricsB.saccadeFixation > metricsA.saccadeFixation + 1) {
    winner = 'B';
  }

  const winnerName = winner === 'A' ? nameA : nameB;
  const loserName = winner === 'A' ? nameB : nameA;
  const winnerMetrics = winner === 'A' ? metricsA : metricsB;
  const loserMetrics = winner === 'A' ? metricsB : metricsA;

  // Projected Apple Search Ads Tap-Through Rate lift
  const projectedLiftNum = Math.max(4.2, Math.round((winnerMargin * 0.48 + 5.2) * 10) / 10);
  const projectedCtrLift = `+${projectedLiftNum}%`;

  // Hilarious scientific verbiages
  const roasts = [
    `The fly's Lobula Plate Tangential Cells completely ignored "${loserName}", mistaking it for an inanimate speck of dust. Meanwhile, "${winnerName}" induced strong proboscis extension reflex.`,
    `"${loserName}" triggered the Giant Fiber escape circuit (firing at 162Hz) — the fly perceived its color palette as an incoming rolled-up newspaper. Switch to "${winnerName}" immediately.`,
    `Lamina L1/L2 edge contrast in "${loserName}" flatlined at baseline noise. The fly groomed its hind legs in apathy. "${winnerName}" flooded the Kenyon cells with +${winnerMetrics.dopamineDelta}% dopamine.`,
    `Compound eye ommatidia saturated heavily on "${winnerName}". Optic lobe elementary motion detectors registered an irresistible visual gradient. "${loserName}" smells like day-old vinegar.`,
  ];

  const quips = [
    `"If Drosophila melanogaster can't find your app on the App Store, human thumbs don't stand a chance."`,
    `"Biologically superior design: tested across 165,122 neurons and 10 million synapses."`,
    `"Forget A/B testing on 5,000 users. One digital fruit fly just made your product roadmap."`,
    `"Certified 100% free of human subjective bias. Pure unadulterated insect phototaxis."`,
  ];

  const roast = roasts[Math.floor(Math.random() * roasts.length)];
  const quip = quips[Math.floor(Math.random() * quips.length)];

  const scientificVerdict = winner === 'TIE'
    ? `Inconclusive neural equilibrium. The fly's bilateral optic lobes fired synchronously at 49.8Hz for both icons. The fly is currently pacing in circles.`
    : `Drosophila CNS exhibits overwhelming positive phototaxis toward "${winnerName}" (${winnerMetrics.saccadeFixation}% saccadic dominance). The central complex verified a +${projectedLiftNum}% increase in visual saliency over "${loserName}".`;

  const asaRecommendation = winner === 'TIE'
    ? `Both icons possess identical spatial frequency. Add more UV/cyan contrast to break the tie.`
    : `Deploy "${winnerName}" on Apple Search Ads Brand & Category campaigns. Expect ~${projectedLiftNum}% higher Tap-Through Rate and an estimated -${Math.round(projectedLiftNum * 0.7)}% lower Cost Per Acquisition based on optical gaze capture.`;

  return {
    winner,
    winnerMargin,
    metricsA,
    metricsB,
    projectedCtrLift,
    scientificVerdict,
    quip,
    roast,
    asaRecommendation,
    timestamp: new Date().toISOString(),
  };
}

function getFallbackMetrics(): AnalysisMetrics {
  return {
    ommatidiaCount: 520,
    phototaxisScore: 50,
    edgeContrast: 50,
    saccadeFixation: 50,
    dopamineDelta: 0,
    giantFiberReflex: 15,
    overallAttractiveness: 50,
    spectralUVBlue: 50,
  };
}
