import {
  TrackData,
  FlyCarState,
  RaySensor,
  Point,
  TrackRecord,
  ConnectomeWeights,
} from '@/types/racing';
import { formatLapTime } from './trackData';

const WEIGHTS_KEY = 'fly_racing_connectome_weights_v2';
const RECORDS_KEY = 'fly_racing_records_v2';

const RAY_ANGLES = [
  -Math.PI * 0.42, // Far Left (-75°)
  -Math.PI * 0.25, // Mid Left (-45°)
  -Math.PI * 0.1,  // Front Left (-18°)
  0,               // Center
  Math.PI * 0.1,   // Front Right (+18°)
  Math.PI * 0.25,  // Mid Right (+45°)
  Math.PI * 0.42,  // Far Right (+75°)
];

export const DEFAULT_WEIGHTS: ConnectomeWeights = {
  sensorWeightsLeft: [-1.4, -1.8, -2.4], // steer right when left sensors detect wall
  sensorWeightsRight: [2.4, 1.8, 1.4],   // steer left when right sensors detect wall
  speedWeight: 1.1,
  biasSteer: 0.02,
  learningRate: 0.08,
};

export function getStoredWeights(): ConnectomeWeights {
  if (typeof window === 'undefined') return DEFAULT_WEIGHTS;
  try {
    const raw = localStorage.getItem(WEIGHTS_KEY);
    if (!raw) return DEFAULT_WEIGHTS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WEIGHTS;
  }
}

export function saveStoredWeights(w: ConnectomeWeights) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(w));
  } catch (err) {
    console.error('Failed to save weights', err);
  }
}

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

/**
 * Initialize Fly on the Starting Grid
 */
export function createInitialFlyState(track: TrackData): FlyCarState {
  return {
    x: track.startPoint.x,
    y: track.startPoint.y,
    angle: track.startAngle,
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
    raySensors: RAY_ANGLES.map((a) => ({
      angle: a,
      distance: 1,
      hitPoint: { x: track.startPoint.x, y: track.startPoint.y },
    })),
  };
}

/**
 * Step Physics and Biological Neural Steering Controller
 */
export function stepAutonomousFly(
  fly: FlyCarState,
  track: TrackData,
  weights: ConnectomeWeights,
  dt = 0.016
): {
  fly: FlyCarState;
  weights: ConnectomeWeights;
  newRecord: TrackRecord | null;
  lapCompleted: boolean;
  crashed: boolean;
} {
  const maxRayDist = 140;

  // 1. Raycast Compound Eye Vision against boundaries
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

    const normDist = minDist / maxRayDist; // 0 (imminent wall) to 1 (clear open asphalt)
    rays.push({
      angle: relAngle,
      distance: normDist,
      hitPoint: hitP,
    });

    if (i < 3) {
      leftFlowSum += (1 - normDist); // higher if wall close on left
    } else if (i > 3) {
      rightFlowSum += (1 - normDist); // higher if wall close on right
    }
  }

  fly.raySensors = rays;

  // 2. Biological Connectome Decision (Optic Lobes -> Central Complex -> Motor)
  // Inverse proximity triggers avoidance saccade
  const leftSensors = [1 - rays[0].distance, 1 - rays[1].distance, 1 - rays[2].distance];
  const rightSensors = [1 - rays[4].distance, 1 - rays[5].distance, 1 - rays[6].distance];
  const centerDist = rays[3].distance;

  let steerSignal = 0;
  for (let i = 0; i < 3; i++) {
    steerSignal += leftSensors[i] * weights.sensorWeightsLeft[i];
    steerSignal += rightSensors[i] * weights.sensorWeightsRight[i];
  }
  steerSignal += weights.biasSteer;

  // Smoothing motor inertia
  fly.steer = Math.max(-1, Math.min(1, steerSignal));

  // Forward throttle: faster when center is clear, brake when approaching hairpin
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

  // 3. Update Position & Orientation
  fly.angle += fly.steer * (0.065 * (fly.speed / 3.2));
  fly.x += Math.cos(fly.angle) * fly.speed;
  fly.y += Math.sin(fly.angle) * fly.speed;
  fly.distanceTraveled += fly.speed;

  // Update Lap Time
  const now = performance.now();
  fly.currentLapTime = (now - fly.lapStartTime) / 1000;

  // 4. Collision Detection (Did the fly body hit any wall boundary?)
  const flyRadius = 9;
  let isCollided = false;

  // Check collision with outer boundaries
  for (let j = 0; j < track.outerBoundary.length; j++) {
    const p1 = track.outerBoundary[j];
    const p2 = track.outerBoundary[(j + 1) % track.outerBoundary.length];
    if (distToSegment(fly, p1, p2) < flyRadius) {
      isCollided = true;
      break;
    }
  }

  // Check collision with inner boundaries
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

  // Handle Crash & Autonomous Weight Adaptation
  if (isCollided) {
    fly.isCrashed = true;
    fly.crashCount++;

    // Plasticity penalty: adjust weights to turn harder away from the side hit
    const updatedWeights = { ...weights };
    if (leftFlowSum > rightFlowSum) {
      // Hit left wall -> increase rightward steering weights
      updatedWeights.sensorWeightsLeft[1] -= weights.learningRate * 0.4;
      updatedWeights.sensorWeightsLeft[2] -= weights.learningRate * 0.6;
    } else {
      // Hit right wall -> increase leftward steering weights
      updatedWeights.sensorWeightsRight[1] += weights.learningRate * 0.4;
      updatedWeights.sensorWeightsRight[2] += weights.learningRate * 0.6;
    }
    saveStoredWeights(updatedWeights);

    // Respawn smoothly along the track at the last valid waypoint
    const closestIdx = findClosestWaypointIndex(fly, track.waypoints);
    const safeWp = track.waypoints[closestIdx];
    const nextWp = track.waypoints[(closestIdx + 1) % track.waypoints.length];

    fly.x = safeWp.x;
    fly.y = safeWp.y;
    fly.angle = Math.atan2(nextWp.y - safeWp.y, nextWp.x - safeWp.x);
    fly.speed = 1.2;
    fly.isCrashed = false;

    return {
      fly,
      weights: updatedWeights,
      newRecord: null,
      lapCompleted: false,
      crashed: true,
    };
  }

  // 5. Checkpoint & Lap Completion Detection
  let lapCompleted = false;
  let newRecord: TrackRecord | null = null;

  const nextCpIdx = (fly.currentCheckpoint + 1) % track.checkpoints.length;
  const cp = track.checkpoints[nextCpIdx];
  const distToCp = Math.hypot(fly.x - cp.x, fly.y - cp.y);

  if (distToCp < 35) {
    fly.currentCheckpoint = nextCpIdx;

    // Completed full lap!
    if (nextCpIdx === 0 && fly.distanceTraveled > 300) {
      lapCompleted = true;
      fly.lapsCompleted++;

      const finalLapTime = fly.currentLapTime;
      fly.lapStartTime = now;
      fly.currentLapTime = 0;
      fly.distanceTraveled = 0;

      // Positive reinforcement reward: reinforce current weights
      const updatedWeights = { ...weights };
      updatedWeights.speedWeight = Math.min(1.8, updatedWeights.speedWeight + 0.02);
      saveStoredWeights(updatedWeights);

      // Check for Lap Record
      const records = getStoredRecords();
      const isNewRecord = !records.lapRecord || finalLapTime < records.lapRecord.lapTime;

      const recordEntry: TrackRecord = {
        lapTime: Math.round(finalLapTime * 1000) / 1000,
        formattedTime: formatLapTime(finalLapTime),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        topSpeed: Math.round(fly.speed * 18 * 10) / 10,
        generation: fly.lapsCompleted + fly.crashCount,
        sectorTimes: [finalLapTime * 0.32, finalLapTime * 0.36, finalLapTime * 0.32],
      };

      if (isNewRecord) {
        records.lapRecord = recordEntry;
        newRecord = recordEntry;
      }

      records.recentRecords = [recordEntry, ...records.recentRecords.slice(0, 7)];
      saveStoredRecords(records);

      return {
        fly,
        weights: updatedWeights,
        newRecord,
        lapCompleted: true,
        crashed: false,
      };
    }
  }

  return {
    fly,
    weights,
    newRecord,
    lapCompleted: false,
    crashed: false,
  };
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
