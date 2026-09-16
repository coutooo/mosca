import {
  TrackData,
  FlyCarState,
  RaySensor,
  Point,
  TrackRecord,
  ConnectomeWeights,
  FlyCompetitor,
} from '@/types/racing';
import { formatLapTime } from './trackData';

const RECORDS_KEY = 'fly_racing_records_v3';

const RAY_ANGLES = [
  -Math.PI * 0.42, // Far Left (-75°)
  -Math.PI * 0.25, // Mid Left (-45°)
  -Math.PI * 0.1,  // Front Left (-18°)
  0,               // Center
  Math.PI * 0.1,   // Front Right (+18°)
  Math.PI * 0.25,  // Mid Right (+45°)
  Math.PI * 0.42,  // Far Right (+75°)
];

export function getStoredRecords(): { lapRecord: TrackRecord | null; recentRecords: TrackRecord[] } {
  if (typeof window === 'undefined') {
    return { lapRecord: null, recentRecords: [] };
  }
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return { lapRecord: null, recentRecords: [] };
    return JSON.parse(raw);
  } catch {
    return { lapRecord: null, recentRecords: [] };
  }
}

export function saveStoredRecords(data: { lapRecord: TrackRecord | null; recentRecords: TrackRecord[] }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save records', err);
  }
}

export function createCompetitors(track: TrackData): FlyCompetitor[] {
  const archetypes: Omit<FlyCompetitor, 'state'>[] = [
    {
      id: 'fly-1',
      name: 'Janelia Red',
      team: 'HHMI Bio-Racing',
      bodyColor: '#b86819',
      eyeColor: '#ff2a4b', // Ruby Red
      accentColor: '#38bdf8',
      rank: 1,
      gapToLeader: 'LEADER',
      bestLapTime: null,
      lastLapTime: null,
      weights: {
        sensorWeightsLeft: [-1.4, -1.8, -2.4],
        sensorWeightsRight: [2.4, 1.8, 1.4],
        speedWeight: 1.12,
        biasSteer: 0.01,
        learningRate: 0.08,
      },
    },
    {
      id: 'fly-2',
      name: 'Fly-Zero',
      team: 'Cambridge Connectomics',
      bodyColor: '#0f766e',
      eyeColor: '#22d3ee', // Neon Cyan
      accentColor: '#a855f7',
      rank: 2,
      gapToLeader: '+0.42s',
      bestLapTime: null,
      lastLapTime: null,
      weights: {
        sensorWeightsLeft: [-1.3, -1.9, -2.6],
        sensorWeightsRight: [2.6, 1.9, 1.3],
        speedWeight: 1.18, // faster straight speed
        biasSteer: -0.02,
        learningRate: 0.09,
      },
    },
    {
      id: 'fly-3',
      name: 'Apex Drosophila',
      team: 'LMB Aerodynamics',
      bodyColor: '#065f46',
      eyeColor: '#34d399', // Emerald
      accentColor: '#fbbf24',
      rank: 3,
      gapToLeader: '+0.88s',
      bestLapTime: null,
      lastLapTime: null,
      weights: {
        sensorWeightsLeft: [-1.5, -2.0, -2.3],
        sensorWeightsRight: [2.3, 2.0, 1.5],
        speedWeight: 1.10, // smooth cornering
        biasSteer: 0.02,
        learningRate: 0.07,
      },
    },
    {
      id: 'fly-4',
      name: 'Quantum Fly',
      team: 'Fruitfly Research',
      bodyColor: '#581c87',
      eyeColor: '#ec4899', // Hot Pink
      accentColor: '#f43f5e',
      rank: 4,
      gapToLeader: '+1.35s',
      bestLapTime: null,
      lastLapTime: null,
      weights: {
        sensorWeightsLeft: [-1.2, -1.7, -2.8],
        sensorWeightsRight: [2.8, 1.7, 1.2],
        speedWeight: 1.22, // aggressive acceleration
        biasSteer: -0.01,
        learningRate: 0.10,
      },
    },
  ];

  return archetypes.map((arch, idx) => {
    const slot = track.gridSlots[idx] || {
      x: track.startPoint.x,
      y: track.startPoint.y,
      angle: track.startAngle,
    };

    const state: FlyCarState = {
      x: slot.x,
      y: slot.y,
      angle: slot.angle,
      speed: 0,
      steer: 0,
      throttle: 0,
      brake: 0,
      currentCheckpoint: 0,
      lapsCompleted: 0,
      lapStartTime: performance.now(),
      currentLapTime: 0,
      isCrashed: false,
      crashCount: 0,
      distanceTraveled: 0,
      totalDistance: 0,
      raySensors: RAY_ANGLES.map((a) => ({
        angle: a,
        distance: 1,
        hitPoint: { x: slot.x, y: slot.y },
      })),
    };

    return {
      ...arch,
      state,
    };
  });
}

/**
 * Step Physics and Biological Neural Steering for an individual fly
 */
export function stepCompetitor(
  comp: FlyCompetitor,
  track: TrackData,
  otherFlies: FlyCompetitor[],
  dt = 0.016
): {
  newRecord: TrackRecord | null;
  lapCompleted: boolean;
  crashed: boolean;
} {
  const fly = comp.state;
  const weights = comp.weights;
  const maxRayDist = 140;

  // 1. Raycast Compound Eye Vision
  const rays: RaySensor[] = [];
  let leftFlowSum = 0;
  let rightFlowSum = 0;

  for (let i = 0; i < RAY_ANGLES.length; i++) {
    const relAngle = RAY_ANGLES[i];
    const absAngle = fly.angle + relAngle;

    const rayEnd: Point = {
      x: fly.x + Math.cos(absAngle) * maxRayDist,
      y: fly.y + Math.sin(absAngle) * maxRayDist,
    };

    let minDist = maxRayDist;
    let hitP: Point = rayEnd;

    // Check intersection with outer boundary
    for (let j = 0; j < track.outerBoundary.length; j++) {
      const p1 = track.outerBoundary[j];
      const p2 = track.outerBoundary[(j + 1) % track.outerBoundary.length];
      const hit = lineIntersection(fly, rayEnd, p1, p2);
      if (hit) {
        const d = Math.hypot(hit.x - fly.x, hit.y - fly.y);
        if (d < minDist) {
          minDist = d;
          hitP = hit;
        }
      }
    }

    // Check intersection with inner boundary
    for (let j = 0; j < track.innerBoundary.length; j++) {
      const p1 = track.innerBoundary[j];
      const p2 = track.innerBoundary[(j + 1) % track.innerBoundary.length];
      const hit = lineIntersection(fly, rayEnd, p1, p2);
      if (hit) {
        const d = Math.hypot(hit.x - fly.x, hit.y - fly.y);
        if (d < minDist) {
          minDist = d;
          hitP = hit;
        }
      }
    }

    // Also avoid nearby other flies (inter-fly collision avoidance!)
    otherFlies.forEach((other) => {
      if (other.id === comp.id) return;
      const distToOther = Math.hypot(other.state.x - fly.x, other.state.y - fly.y);
      if (distToOther < 35) {
        const angleToOther = Math.atan2(other.state.y - fly.y, other.state.x - fly.x);
        const diff = Math.abs(normalizeAngle(angleToOther - absAngle));
        if (diff < 0.35 && distToOther < minDist) {
          minDist = distToOther;
          hitP = { x: other.state.x, y: other.state.y };
        }
      }
    });

    const normDist = minDist / maxRayDist;
    rays.push({
      angle: relAngle,
      distance: normDist,
      hitPoint: hitP,
    });

    if (i < 3) {
      leftFlowSum += (1 - normDist);
    } else if (i > 3) {
      rightFlowSum += (1 - normDist);
    }
  }

  fly.raySensors = rays;

  // 2. Neural Steering Decision
  const leftSensors = [1 - rays[0].distance, 1 - rays[1].distance, 1 - rays[2].distance];
  const rightSensors = [1 - rays[4].distance, 1 - rays[5].distance, 1 - rays[6].distance];
  const centerDist = rays[3].distance;

  let steerSignal = 0;
  for (let i = 0; i < 3; i++) {
    steerSignal += leftSensors[i] * weights.sensorWeightsLeft[i];
    steerSignal += rightSensors[i] * weights.sensorWeightsRight[i];
  }
  steerSignal += weights.biasSteer;

  fly.steer = Math.max(-1, Math.min(1, steerSignal));

  const targetSpeed = Math.max(1.8, centerDist * 5.8 * weights.speedWeight);
  if (fly.speed < targetSpeed) {
    fly.speed = Math.min(targetSpeed, fly.speed + 0.15);
    fly.throttle = 1;
    fly.brake = 0;
  } else {
    fly.speed = Math.max(targetSpeed, fly.speed - 0.25);
    fly.throttle = 0.2;
    fly.brake = 0.8;
  }

  fly.angle += fly.steer * (0.065 * (fly.speed / 3.2));
  fly.x += Math.cos(fly.angle) * fly.speed;
  fly.y += Math.sin(fly.angle) * fly.speed;
  fly.distanceTraveled += fly.speed;
  fly.totalDistance += fly.speed;

  const now = performance.now();
  fly.currentLapTime = (now - fly.lapStartTime) / 1000;

  // 3. Collision Detection with barriers
  const flyRadius = 8.5;
  let isCollided = false;

  for (let j = 0; j < track.outerBoundary.length; j++) {
    const p1 = track.outerBoundary[j];
    const p2 = track.outerBoundary[(j + 1) % track.outerBoundary.length];
    if (distToSegment(fly, p1, p2) < flyRadius) {
      isCollided = true;
      break;
    }
  }

  if (!isCollided) {
    for (let j = 0; j < track.innerBoundary.length; j++) {
      const p1 = track.innerBoundary[j];
      const p2 = track.innerBoundary[(j + 1) % track.innerBoundary.length];
      if (distToSegment(fly, p1, p2) < flyRadius) {
        isCollided = true;
        break;
      }
    }
  }

  if (isCollided) {
    fly.isCrashed = true;
    fly.crashCount++;

    if (leftFlowSum > rightFlowSum) {
      weights.sensorWeightsLeft[1] -= weights.learningRate * 0.4;
      weights.sensorWeightsLeft[2] -= weights.learningRate * 0.6;
    } else {
      weights.sensorWeightsRight[1] += weights.learningRate * 0.4;
      weights.sensorWeightsRight[2] += weights.learningRate * 0.6;
    }

    const closestIdx = findClosestWaypointIndex(fly, track.waypoints);
    const safeWp = track.waypoints[closestIdx];
    const nextWp = track.waypoints[(closestIdx + 1) % track.waypoints.length];

    fly.x = safeWp.x;
    fly.y = safeWp.y;
    fly.angle = Math.atan2(nextWp.y - safeWp.y, nextWp.x - safeWp.x);
    fly.speed = 1.2;
    fly.isCrashed = false;

    return { newRecord: null, lapCompleted: false, crashed: true };
  }

  // 4. Checkpoints & Lap Finish
  let lapCompleted = false;
  let newRecord: TrackRecord | null = null;

  const nextCpIdx = (fly.currentCheckpoint + 1) % track.checkpoints.length;
  const cp = track.checkpoints[nextCpIdx];
  const distToCp = Math.hypot(fly.x - cp.x, fly.y - cp.y);

  if (distToCp < 35) {
    fly.currentCheckpoint = nextCpIdx;

    if (nextCpIdx === 0 && fly.distanceTraveled > 300) {
      lapCompleted = true;
      fly.lapsCompleted++;

      const finalLapTime = fly.currentLapTime;
      fly.lapStartTime = now;
      fly.currentLapTime = 0;
      fly.distanceTraveled = 0;

      comp.lastLapTime = finalLapTime;
      if (!comp.bestLapTime || finalLapTime < comp.bestLapTime) {
        comp.bestLapTime = finalLapTime;
      }

      const records = getStoredRecords();
      const isNewRecord = !records.lapRecord || finalLapTime < records.lapRecord.lapTime;

      const recordEntry: TrackRecord = {
        lapTime: Math.round(finalLapTime * 1000) / 1000,
        formattedTime: formatLapTime(finalLapTime),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        topSpeed: Math.round(fly.speed * 18 * 10) / 10,
        generation: fly.lapsCompleted + fly.crashCount,
        holderName: comp.name,
        sectorTimes: [finalLapTime * 0.32, finalLapTime * 0.36, finalLapTime * 0.32],
      };

      if (isNewRecord) {
        records.lapRecord = recordEntry;
        newRecord = recordEntry;
      }

      records.recentRecords = [recordEntry, ...records.recentRecords.slice(0, 7)];
      saveStoredRecords(records);

      return { newRecord, lapCompleted: true, crashed: false };
    }
  }

  return { newRecord: null, lapCompleted: false, crashed: false };
}

/**
 * Sort 4 competitors by race position (distance traveled)
 */
export function updateCompetitorRanks(competitors: FlyCompetitor[]): FlyCompetitor[] {
  const sorted = [...competitors].sort((a, b) => {
    if (a.state.lapsCompleted !== b.state.lapsCompleted) {
      return b.state.lapsCompleted - a.state.lapsCompleted;
    }
    return b.state.totalDistance - a.state.totalDistance;
  });

  const leaderDist = sorted[0]?.state.totalDistance || 1;

  sorted.forEach((comp, idx) => {
    comp.rank = idx + 1;
    if (idx === 0) {
      comp.gapToLeader = 'LEADER';
    } else {
      const gapPx = leaderDist - comp.state.totalDistance;
      const gapSec = (gapPx / 45).toFixed(2);
      comp.gapToLeader = `+${gapSec}s`;
    }
  });

  return sorted;
}

// Helpers
function lineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denom === 0) return null;

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y),
    };
  }
  return null;
}

function distToSegment(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function findClosestWaypointIndex(p: Point, waypoints: Point[]): number {
  let minD = Infinity;
  let idx = 0;
  for (let i = 0; i < waypoints.length; i++) {
    const d = Math.hypot(p.x - waypoints[i].x, p.y - waypoints[i].y);
    if (d < minD) {
      minD = d;
      idx = i;
    }
  }
  return idx;
}

function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
