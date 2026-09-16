import { RaceStatus, RaceEventSchedule } from '@/types/racing';

/**
 * Manages the Scheduled Drosophila Race Times
 * Races trigger automatically at fixed intervals (e.g. every 5 minutes: :00, :05, :10, :15...)
 * Also supports manual triggering ("Start Race Now").
 */

const INTERVAL_MINUTES = 5;

export function calculateNextRaceCountdown(): { secondsUntil: number; eventName: string } {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const currentBlock = Math.floor(minutes / INTERVAL_MINUTES);
  const nextBlockMinute = (currentBlock + 1) * INTERVAL_MINUTES;
  const minutesRemaining = nextBlockMinute - minutes;
  const secondsUntil = minutesRemaining * 60 - seconds;

  const eventNames = [
    'Monaco Drosophila Grand Prix',
    'Suzuka Bio-Sprint Championship',
    'Silverstone Optical Flow Trophy',
    'Interlagos Connectome Cup',
    'Spa-Francorchamps Bio-Challenge',
  ];
  const eventName = eventNames[currentBlock % eventNames.length];

  return { secondsUntil, eventName };
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.floor(Math.max(0, seconds) % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
