/**
 * Daily Grand Prix Race Schedule
 * Exactly 2 Official Heats per Day:
 *  - Heat 1 (Midday Grand Prix): 13:00 local time
 *  - Heat 2 (Night Grand Prix):   21:00 local time
 *
 * Between heats, users can browse past races in the Replay Archive.
 */

export function calculateNextRaceCountdown(): {
  secondsUntil: number;
  eventName: string;
  targetTimeFormatted: string;
} {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  const currentTotalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

  const heat1Seconds = 13 * 3600; // 13:00
  const heat2Seconds = 21 * 3600; // 21:00

  if (currentTotalSeconds < heat1Seconds) {
    // Next heat is 13:00 today
    const diff = heat1Seconds - currentTotalSeconds;
    return {
      secondsUntil: diff,
      eventName: 'Midday Grand Prix (13:00)',
      targetTimeFormatted: '13:00',
    };
  } else if (currentTotalSeconds < heat2Seconds) {
    // Next heat is 21:00 today
    const diff = heat2Seconds - currentTotalSeconds;
    return {
      secondsUntil: diff,
      eventName: 'Night Grand Prix (21:00)',
      targetTimeFormatted: '21:00',
    };
  } else {
    // Next heat is 13:00 tomorrow
    const secondsTillMidnight = 24 * 3600 - currentTotalSeconds;
    const diff = secondsTillMidnight + heat1Seconds;
    return {
      secondsUntil: diff,
      eventName: 'Tomorrow Midday GP (13:00)',
      targetTimeFormatted: 'Tomorrow 13:00',
    };
  }
}

export function formatCountdown(seconds: number): string {
  const total = Math.max(0, seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  }
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}
