// Single source of truth for load/deload phase math.
// Imported by both the app (src/App.jsx) and the notify edge function.
// Pure + zero-dependency so it runs unchanged in Vite and Deno.
export function phaseFor(daysSinceStart: number, cycleWeeks: number, deloadWeeks: number) {
  const cycleDays = cycleWeeks * 7;
  const loadDays = (cycleWeeks - deloadWeeks) * 7;
  if (daysSinceStart < 0) {
    // Before the cycle starts: count down to day 0.
    return { isDeload: false, daysIntoCycle: -1, daysUntilNextPhase: -daysSinceStart, isPhaseStart: false };
  }
  const daysIntoCycle = daysSinceStart % cycleDays;
  const isDeload = daysIntoCycle >= loadDays;
  return {
    isDeload,
    daysIntoCycle,
    daysUntilNextPhase: isDeload ? cycleDays - daysIntoCycle : loadDays - daysIntoCycle,
    isPhaseStart: daysIntoCycle === 0 || daysIntoCycle === loadDays, // first day of a load/deload block
  };
}
