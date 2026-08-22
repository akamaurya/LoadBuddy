export const TIMEZONE_OPTIONS = [
    { label: 'Hawaii', value: 'Pacific/Honolulu', offset: 'UTC - 10' },
    { label: 'Alaska', value: 'America/Anchorage', offset: 'UTC - 9 / UTC - 8' },
    { label: 'US Pacific', value: 'America/Los_Angeles', offset: 'UTC - 8 / UTC - 7' },
    { label: 'US Mountain', value: 'America/Denver', offset: 'UTC - 7 / UTC - 6' },
    { label: 'US Central', value: 'America/Chicago', offset: 'UTC - 6 / UTC - 5' },
    { label: 'US Eastern', value: 'America/New_York', offset: 'UTC - 5 / UTC - 4' },
    { label: 'Brazil (São Paulo)', value: 'America/Sao_Paulo', offset: 'UTC - 3' },
    { label: 'UK / GMT', value: 'Europe/London', offset: 'UTC + 0 / UTC + 1' },
    { label: 'Central Europe', value: 'Europe/Berlin', offset: 'UTC + 1 / UTC + 2' },
    { label: 'East Europe', value: 'Europe/Istanbul', offset: 'UTC + 3' },
    { label: 'East Africa', value: 'Africa/Nairobi', offset: 'UTC + 3' },
    { label: 'West Africa', value: 'Africa/Lagos', offset: 'UTC + 1' },
    { label: 'Gulf (Dubai)', value: 'Asia/Dubai', offset: 'UTC + 4' },
    { label: 'India (IST)', value: 'Asia/Kolkata', offset: 'UTC + 5:30' },
    { label: 'Southeast Asia', value: 'Asia/Bangkok', offset: 'UTC + 7' },
    { label: 'China / Singapore', value: 'Asia/Singapore', offset: 'UTC + 8' },
    { label: 'Japan (JST)', value: 'Asia/Tokyo', offset: 'UTC + 9' },
    { label: 'Australia East', value: 'Australia/Sydney', offset: 'UTC + 10 / UTC + 11' },
    { label: 'New Zealand', value: 'Pacific/Auckland', offset: 'UTC + 12 / UTC + 13' },
];

const FALLBACK_TIMEZONE = 'America/New_York';

// Human-readable UTC offset for an arbitrary IANA zone, e.g. "UTC + 2".
function offsetLabel(timeZone) {
    try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
            .formatToParts(new Date());
        const name = parts.find(p => p.type === 'timeZoneName')?.value ?? '';
        return name.replace('GMT', 'UTC ').replace(/([+-])/, '$1 ').replace(/\s+/g, ' ').trim() || 'UTC + 0';
    } catch {
        return '';
    }
}

// Returns the user's real IANA zone. The curated list above covers the common
// cases for the picker, but we deliberately do NOT snap unlisted zones onto a
// listed one — the zone drives phase math and the notification hour, so a
// Europe/Paris user silently becoming America/New_York would fire reminders
// six hours off. Unlisted zones are surfaced by timezoneOptionsFor() instead.
export function detectTimezone() {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) return FALLBACK_TIMEZONE;
    if (detected === 'Asia/Calcutta') return 'Asia/Kolkata'; // legacy alias
    return detected;
}

// The picker options, with `value` appended when it isn't one of the curated
// zones, so a selected timezone is always visible and selectable.
export function timezoneOptionsFor(value) {
    if (!value || TIMEZONE_OPTIONS.some(tz => tz.value === value)) return TIMEZONE_OPTIONS;
    return [...TIMEZONE_OPTIONS, { label: value.replace(/_/g, ' '), value, offset: offsetLabel(value) }];
}
