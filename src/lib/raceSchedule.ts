import { RaceEventSchedule } from '@/types/racing';

/**
 * Manages the Grand Prix Race Schedule
 * Official races trigger every 15 minutes (:00, :15, :30, :45)
 */
export function getRaceEventSchedule(): RaceEventSchedule {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Next 15-min mark
  const nextMarkMinutes = (Math.floor(minutes / 15) + 1) * 15;
  const minutesUntil = nextMarkMinutes - minutes;
  const secondsUntilNextEvent = minutesUntil * 60 - seconds;

  // Active race window is the first 2 minutes after each 15-min interval
  const isEventActive = minutes % 15 < 2;

  const eventNames = [
    'Monaco Drosophila Grand Prix',
    'Suzuka Bio-Sprint Championship',
    'Silverstone Optical Flow Trophy',
    'Interlagos Connectome Cup',
  ];
  const eventIdx = Math.floor(minutes / 15) % eventNames.length;

  return {
    isEventActive,
    eventName: eventNames[eventIdx],
    nextEventTime: Date.now() + secondsUntilNextEvent * 1000,
    secondsUntilNextEvent,
    eventLapsRemaining: isEventActive ? 3 : 0,
    eventWinnerLap: null,
  };
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
