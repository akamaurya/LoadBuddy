// Run with: deno test supabase/functions/_shared/phase.test.ts
//
// Kept out of phase.ts itself so the assertions don't ride along into the
// browser bundle — Vite can't statically resolve `import.meta.main`, so an
// inline self-check block would survive tree-shaking.
import { assert, assertEquals } from "jsr:@std/assert@1";
import { phaseFor } from "./phase.ts";

Deno.test("matches the week-floor formula across every cycle/deload config", () => {
  for (let cycle = 2; cycle <= 8; cycle++) {
    for (let deload = 1; deload <= cycle - 1; deload++) {
      for (let day = 0; day < cycle * 7 * 4; day++) {
        const weekFloor = (Math.floor(day / 7) % cycle) >= (cycle - deload);
        assertEquals(
          phaseFor(day, cycle, deload).isDeload,
          weekFloor,
          `cycle=${cycle} deload=${deload} day=${day}`,
        );
      }
    }
  }
});

Deno.test("4-week cycle with a 1-week deload: load weeks 1-3, deload week 4", () => {
  const day0 = phaseFor(0, 4, 1);
  assert(day0.isPhaseStart && !day0.isDeload, "day 0 starts a load block");
  assertEquals(day0.daysUntilNextPhase, 21);

  const day21 = phaseFor(21, 4, 1);
  assert(day21.isPhaseStart && day21.isDeload, "day 21 starts the deload block");
  assertEquals(day21.daysUntilNextPhase, 7);

  assert(!phaseFor(5, 4, 1).isPhaseStart, "mid-block is not a phase start");
});

Deno.test("cycles repeat indefinitely from the start date", () => {
  assertEquals(phaseFor(28, 4, 1).daysIntoCycle, 0);
  assert(phaseFor(28, 4, 1).isPhaseStart);
  assertEquals(phaseFor(49, 4, 1).isDeload, true);
});

Deno.test("counts down to a start date in the future", () => {
  const pending = phaseFor(-3, 4, 1);
  assertEquals(pending.daysUntilNextPhase, 3);
  assertEquals(pending.isDeload, false);
  assertEquals(pending.isPhaseStart, false);
});
