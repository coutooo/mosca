export interface Point {
  x: number;
  y: number;
}

export interface ReplayFrame {
  x: number;
  y: number;
  angle: number;
  speed: number;
  steer: number;
  leftFlow: number;
  rightFlow: number;
}

export interface MultiFlyFrame {
  flies: {
    id: string;
    x: number;
    y: number;
    angle: number;
    speed: number;
    steer: number;
    rank: number;
  }[];
}

export interface SavedRaceReplay {
  id: string;
  title: string;
  date: string;
  winnerName: string;
  winnerTeam: string;
  winnerColor: string;
  bestLap: string;
  totalLaps: number;
  frames: MultiFlyFrame[];
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
  gridSlots: { x: number; y: number; angle: number }[];
}

export interface RaySensor {
  angle: number; // relative to fly heading
  distance: number; // 0 to 1 (normalized, 1 = clear, 0 = wall)
  hitPoint: Point;
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
  totalDistance: number;
  raySensors: RaySensor[];
}

export interface FlyCompetitor {
  id: string;
  name: string;
  team: string;
  bodyColor: string;
  eyeColor: string;
  accentColor: string;
  state: FlyCarState;
  weights: ConnectomeWeights;
  rank: number; // 1, 2, 3, 4
  gapToLeader: string;
  bestLapTime: number | null;
  lastLapTime: number | null;
}

export interface TrackRecord {
  lapTime: number; // in seconds
  formattedTime: string;
  date: string;
  topSpeed: number;
  generation: number;
  holderName: string;
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
  leftEyeOpticalFlow: number;
  rightEyeOpticalFlow: number;
  steeringAngle: number;
  dopamineSurge: boolean;
  painShock: boolean;
  competitors: {
    id: string;
    name: string;
    team: string;
    rank: number;
    color: string;
    speed: number;
    lapsCompleted: number;
    gap: string;
    bestLap: string;
  }[];
  focusedFlyId: string;
}

export type RaceStatus = 'WAITING' | 'STARTING_LIGHTS' | 'RACING' | 'FINISHED';

export interface RaceEventSchedule {
  raceStatus: RaceStatus;
  eventName: string;
  nextEventTime: number; // timestamp
  secondsUntilNextEvent: number;
  currentLapInRace: number;
  totalRaceLaps: number;
  startingLightsCount: number; // 0 to 5
}

export interface ConnectomeWeights {
  sensorWeightsLeft: number[];
  sensorWeightsRight: number[];
  speedWeight: number;
  biasSteer: number;
  learningRate: number;
}
