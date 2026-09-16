import { TrackData, Point } from '@/types/racing';

/**
 * Procedural Grand Prix Circuit for Autonomous Drosophila Testing
 * Includes sharp hairpins, high-speed esses, and DRS main straight
 */
export function getCircuitData(width = 900, height = 550): TrackData {
  const cx = width / 2;
  const cy = height / 2;

  // Normalized anchor points for the circuit shape
  const anchors: [number, number][] = [
    [0.15, 0.22], // Turn 1 entry
    [0.35, 0.16], // High speed curve
    [0.65, 0.16], // Fast back straight
    [0.85, 0.25], // Turn 4 Hairpin entry
    [0.88, 0.45], // Hairpin apex
    [0.72, 0.58], // Chicane entry
    [0.78, 0.72], // Chicane mid
    [0.68, 0.84], // South hairpin
    [0.45, 0.84], // Carousel entry
    [0.25, 0.75], // Carousel mid
    [0.12, 0.55], // Final S-bend
    [0.12, 0.35], // Main straight entry
  ];

  // Catmull-Rom interpolation for butter-smooth asphalt curves
  const numPoints = anchors.length;
  const waypoints: Point[] = [];
  const samplesPerSegment = 18;

  for (let i = 0; i < numPoints; i++) {
    const p0 = anchors[(i - 1 + numPoints) % numPoints];
    const p1 = anchors[i];
    const p2 = anchors[(i + 1) % numPoints];
    const p3 = anchors[(i + 2) % numPoints];

    for (let t = 0; t < samplesPerSegment; t++) {
      const u = t / samplesPerSegment;
      const x = catmullRom(p0[0], p1[0], p2[0], p3[0], u) * width;
      const y = catmullRom(p0[1], p1[1], p2[1], p3[1], u) * height;
      waypoints.push({ x, y });
    }
  }

  const trackWidth = 44; // width of tarmac
  const innerBoundary: Point[] = [];
  const outerBoundary: Point[] = [];
  const checkpoints: Point[] = [];

  for (let i = 0; i < waypoints.length; i++) {
    const curr = waypoints[i];
    const next = waypoints[(i + 1) % waypoints.length];

    // Perpendicular normal vector
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    outerBoundary.push({
      x: curr.x + nx * (trackWidth / 2),
      y: curr.y + ny * (trackWidth / 2),
    });

    innerBoundary.push({
      x: curr.x - nx * (trackWidth / 2),
      y: curr.y - ny * (trackWidth / 2),
    });

    // Checkpoint every 18 samples (~12 checkpoints around the track)
    if (i % 18 === 0) {
      checkpoints.push(curr);
    }
  }

  // Start on the main straight
  const startIdx = 10;
  const pStart = waypoints[startIdx];
  const pNext = waypoints[startIdx + 1];
  const startAngle = Math.atan2(pNext.y - pStart.y, pNext.x - pStart.x);

  // Staggered grid slots for 4 flies
  const perpX = -Math.sin(startAngle);
  const perpY = Math.cos(startAngle);
  const dirX = Math.cos(startAngle);
  const dirY = Math.sin(startAngle);

  const gridSlots = [
    // Pole (Fly #1)
    { x: pStart.x + perpX * 7, y: pStart.y + perpY * 7, angle: startAngle },
    // Slot 2 (Fly #2)
    { x: pStart.x - perpX * 7 - dirX * 18, y: pStart.y - perpY * 7 - dirY * 18, angle: startAngle },
    // Slot 3 (Fly #3)
    { x: pStart.x + perpX * 7 - dirX * 36, y: pStart.y + perpY * 7 - dirY * 36, angle: startAngle },
    // Slot 4 (Fly #4)
    { x: pStart.x - perpX * 7 - dirX * 54, y: pStart.y - perpY * 7 - dirY * 54, angle: startAngle },
  ];

  return {
    id: 'monaco-drosophila',
    name: 'Circuit de Drosophila Grand Prix',
    location: 'Janelia Bio-Ring, VA',
    lengthMeters: 420,
    waypoints,
    innerBoundary,
    outerBoundary,
    checkpoints,
    startPoint: pStart,
    startAngle,
    gridSlots,
  };
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

export function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds * 1000) % 1000);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }
  return `${secs}.${millis.toString().padStart(3, '0')}s`;
}
