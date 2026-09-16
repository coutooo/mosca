import { SavedRaceReplay, MultiFlyFrame, TrackData } from '@/types/racing';
import { createCompetitors, stepCompetitor, updateCompetitorRanks } from './racingConnectome';
import { getCircuitData, formatLapTime } from './trackData';

const REPLAYS_STORAGE_KEY = 'fly_grand_prix_archive_v1';

export function getSavedReplays(): SavedRaceReplay[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPLAYS_STORAGE_KEY);
    if (!raw) {
      // If empty, generate and store an initial classic race archive
      const initial = [generatePreRecordedRace('Corrida Histórica • 21:00 (Janelia vs Fly-Zero)')];
      localStorage.setItem(REPLAYS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = [generatePreRecordedRace('Corrida Histórica • 21:00 (Janelia vs Fly-Zero)')];
    localStorage.setItem(REPLAYS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (err) {
    console.error('Failed to load replays', err);
    return [];
  }
}

export function saveRaceReplay(replay: SavedRaceReplay): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedReplays();
    const updated = [replay, ...existing.filter((r) => r.id !== replay.id)].slice(0, 10);
    localStorage.setItem(REPLAYS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save replay', err);
  }
}

/**
 * Generates an authentic pre-recorded autonomous Grand Prix race
 * using the real biological connectome physics and multi-fly overtaking engine.
 */
export function generatePreRecordedRace(title: string): SavedRaceReplay {
  const track = getCircuitData();
  const competitors = createCompetitors(track);
  const frames: MultiFlyFrame[] = [];

  const totalFrames = 1200; // ~20 seconds at 60 FPS
  let winner = competitors[0];
  let bestLapTime = 14.82;

  for (let f = 0; f < totalFrames; f++) {
    competitors.forEach((comp) => {
      const res = stepCompetitor(comp, track, competitors, 0.016);
      if (res.lapCompleted && comp.rank === 1) {
        winner = comp;
        if (comp.bestLapTime) bestLapTime = comp.bestLapTime;
      }
    });

    updateCompetitorRanks(competitors);

    frames.push({
      flies: competitors.map((c) => ({
        id: c.id,
        x: c.state.x,
        y: c.state.y,
        angle: c.state.angle,
        speed: c.state.speed,
        steer: c.state.steer,
        rank: c.rank,
      })),
    });
  }

  return {
    id: `replay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    date: 'Ontem, 21:00',
    winnerName: winner.name,
    winnerTeam: winner.team,
    winnerColor: winner.eyeColor,
    bestLap: formatLapTime(bestLapTime),
    totalLaps: 2,
    frames,
  };
}
