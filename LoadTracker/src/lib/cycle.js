import { detectTimezone } from './timezones';

// Single source of truth for the cycle/notification form. Both the onboarding
// wizard and the Settings screen edit the same six profile columns, so the
// defaults, bounds, and the row they build live here rather than in each.

export const CYCLE_DEFAULTS = {
  cycle_length_weeks: 4,
  deload_length_weeks: 1,
  notification_hour: 8,
  notification_days_before: 1,
};

export const LIMITS = {
  cycle_length_weeks: { min: 1, max: 52 },
  notification_hour: { min: 0, max: 23 },
  notification_days_before: { min: 1, max: 30 },
};

export function today() {
  return new Date().toISOString().split('T')[0];
}

// A cycle needs at least one load week, so deload must stay strictly below it.
export function maxDeloadWeeks(cycleLengthWeeks) {
  return Math.max(1, (parseInt(cycleLengthWeeks, 10) || 1) - 1);
}

export function initialFormData(profile) {
  return {
    start_date: profile?.start_date || today(),
    cycle_length_weeks: profile?.cycle_length_weeks ?? CYCLE_DEFAULTS.cycle_length_weeks,
    deload_length_weeks: profile?.deload_length_weeks ?? CYCLE_DEFAULTS.deload_length_weeks,
    timezone: profile?.timezone || detectTimezone(),
    notification_hour: profile?.notification_hour ?? CYCLE_DEFAULTS.notification_hour,
    notification_days_before: profile?.notification_days_before ?? CYCLE_DEFAULTS.notification_days_before,
  };
}

// Maps the form onto a `profiles` row, clamping deload so a bad value can never
// produce a cycle with zero load weeks (which would pin the user to DELOAD).
export function toProfileRow(session, formData) {
  const cycle = parseInt(formData.cycle_length_weeks, 10);
  const deload = parseInt(formData.deload_length_weeks, 10);
  return {
    id: session.user.id,
    email: session.user.email,
    start_date: formData.start_date,
    cycle_length_weeks: cycle,
    deload_length_weeks: Math.min(deload, maxDeloadWeeks(cycle)),
    timezone: formData.timezone,
    notification_hour: parseInt(formData.notification_hour, 10),
    notification_days_before: parseInt(formData.notification_days_before, 10),
  };
}

// "2026-01-05" -> "Jan 5, 2026". Parsed as calendar parts, not `new Date(str)`,
// which would treat the value as UTC midnight and shift it a day west of GMT.
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
