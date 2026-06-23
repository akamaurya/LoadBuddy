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

// ponytail: self-check, run with `deno run phase.ts`. Pins formula equivalence + boundaries.
if (import.meta.main) {
  const assert = (c: boolean, m: string) => { if (!c) throw new Error(m); };
  // Equivalence vs the old week-floor formula across configs/days.
  for (let C = 2; C <= 8; C++) for (let D = 1; D <= C - 1; D++) for (let d = 0; d < C * 7 * 4; d++) {
    const weekFloor = (Math.floor(d / 7) % C) >= (C - D);
    assert(phaseFor(d, C, D).isDeload === weekFloor, `mismatch C${C} D${D} d${d}`);
  }
  // 4wk cycle / 1wk deload: load wks 0-2, deload wk 3.
  assert(phaseFor(0, 4, 1).isPhaseStart && !phaseFor(0, 4, 1).isDeload, "day0 = load start");
  assert(phaseFor(21, 4, 1).isPhaseStart && phaseFor(21, 4, 1).isDeload, "day21 = deload start");
  assert(!phaseFor(5, 4, 1).isPhaseStart, "mid-block is not a phase start");
  assert(phaseFor(-3, 4, 1).daysUntilNextPhase === 3, "pre-start countdown");
  console.log("phase.ts self-check passed");
}
