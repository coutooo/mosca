export interface Point {
  x: number;
  y: number;
}

export interface TrackSegment {
  inner: Point;
  outer: Point;
  center: Point;
}

export interface TrackData {
  id: string;
  name: string;
  location: string;
  lengthMeters: number;
  waypoints: Point[]; // center line
  innerBoundary: Point[];
  outerBoundary: Point[];
  checkpoints: Point[];
  startPoint: Point;
  startAngle: number;
}

export interface FlyCarState {
  x: number;
  y: number;
  angle: number; // radians
  speed: number;
  steer: number; // -1 to 1
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
  currentCheckpoint: number;
  lapsCompleted: number;
  lapStartTime: number;
  currentLapTime: number;
  isCrashed: boolean;
  crashCount: number;
  distanceTraveled: number;
  raySensors: RaySensor[];
}

export interface RaySensor {
  angle: number; // relative to fly heading
  distance: number; // 0 to 1 (normalized, 1 = clear, 0 = wall)
  hitPoint: Point;
}

export interface TrackRecord {
  lapTime: number; // in seconds, e.g. 14.821
  formattedTime: string;
  date: string;
  topSpeed: number;
  generation: number;
  sectorTimes: number[];
}

export interface RacingTelemetry {
  currentLapTime: number;
  lastLapTime: number | null;
  bestLapTime: number | null;
  lapRecord: TrackRecord | null;
  recentRecords: TrackRecord[];
  generation: number;
  totalLaps: number;
  totalCrashes: number;
  speed: number;
  gForce: number;
  leftEyeOpticalFlow: number; // 0 to 1
  rightEyeOpticalFlow: number; // 0 to 1
  steeringAngle: number;
  dopamineSurge: boolean;
  painShock: boolean;
}

export interface RaceEventSchedule {
  isEventActive: boolean;
  eventName: string;
  nextEventTime: number; // timestamp
  secondsUntilNextEvent: number;
  eventLapsRemaining: number;
  eventWinnerLap: TrackRecord | null;
}

export interface ConnectomeWeights {
  sensorWeightsLeft: number[]; // weights from left eye rays to steer
  sensorWeightsRight: number[]; // weights from right eye rays to steer
  speedWeight: number;
  biasSteer: number;
  learningRate: number;
}
