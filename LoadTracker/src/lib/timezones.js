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

export function detectTimezone() {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Map common aliases
    if (detected === 'Asia/Calcutta') return 'Asia/Kolkata';
    // Check if it matches one of our options
    const match = TIMEZONE_OPTIONS.find(tz => tz.value === detected);
    return match ? detected : 'America/New_York'; // fallback
}
