import { useState } from 'react';
import { supabase } from '../lib/supabase';

const TIMEZONE_OPTIONS = [
    { label: 'US Pacific', value: 'America/Los_Angeles', offset: 'UTC-8 / UTC-7' },
    { label: 'US Mountain', value: 'America/Denver', offset: 'UTC-7 / UTC-6' },
    { label: 'US Central', value: 'America/Chicago', offset: 'UTC-6 / UTC-5' },
    { label: 'US Eastern', value: 'America/New_York', offset: 'UTC-5 / UTC-4' },
    { label: 'UK / GMT', value: 'Europe/London', offset: 'UTC+0 / UTC+1' },
    { label: 'Central Europe', value: 'Europe/Berlin', offset: 'UTC+1 / UTC+2' },
    { label: 'India (IST)', value: 'Asia/Kolkata', offset: 'UTC+5:30' },
    { label: 'Japan (JST)', value: 'Asia/Tokyo', offset: 'UTC+9' },
    { label: 'Australia East', value: 'Australia/Sydney', offset: 'UTC+10 / UTC+11' },
];

function detectTimezone() {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Map common aliases
    if (detected === 'Asia/Calcutta') return 'Asia/Kolkata';
    // Check if it matches one of our options
    const match = TIMEZONE_OPTIONS.find(tz => tz.value === detected);
    return match ? detected : 'America/New_York'; // fallback
}

export function Settings({ session, profile, onProfileUpdated, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        start_date: profile?.start_date || new Date().toISOString().split('T')[0],
        cycle_length_weeks: profile?.cycle_length_weeks || 4,
        deload_length_weeks: profile?.deload_length_weeks || 1,
        timezone: profile?.timezone && TIMEZONE_OPTIONS.some(tz => tz.value === profile.timezone)
            ? profile.timezone
            : detectTimezone(),
        notification_hour: profile?.notification_hour ?? 20,
        notification_days_before: profile?.notification_days_before ?? 1,
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // Fix: always update with value. The type condition was causing an issue 
        // with how the state was updating if not properly handled
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTimezoneChange = (value) => {
        setFormData(prev => ({ ...prev, timezone: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates = {
                id: session.user.id,
                email: session.user.email,
                start_date: formData.start_date,
                cycle_length_weeks: parseInt(formData.cycle_length_weeks, 10),
                deload_length_weeks: parseInt(formData.deload_length_weeks, 10),
                timezone: formData.timezone,
                notification_hour: parseInt(formData.notification_hour, 10),
                notification_days_before: parseInt(formData.notification_days_before, 10),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            onProfileUpdated(updates);
        } catch (error) {
            alert("Error saving profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-modal" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', paddingBottom: 'calc(2rem + 80px)', borderRadius: '12px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2>Preferences</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Training Block Start Date */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Training Block Start Date:
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                {/* Cycle Length */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Cycle Length (Weeks):
                    <input type="number" name="cycle_length_weeks" min="1" value={formData.cycle_length_weeks} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                {/* Deload Length */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Deload Length (Weeks):
                    <input type="number" name="deload_length_weeks" min="1" max={formData.cycle_length_weeks} value={formData.deload_length_weeks} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                {/* Timezone Radio Buttons */}
                <fieldset className="timezone-fieldset">
                    <legend>Timezone:</legend>
                    <div className="timezone-radio-group">
                        {TIMEZONE_OPTIONS.map((tz) => (
                            <label
                                key={tz.value}
                                className={`timezone-radio-label ${formData.timezone === tz.value ? 'selected' : ''}`}
                                onClick={() => handleTimezoneChange(tz.value)}
                            >
                                <input
                                    type="radio"
                                    name="timezone"
                                    value={tz.value}
                                    checked={formData.timezone === tz.value}
                                    onChange={() => handleTimezoneChange(tz.value)}
                                    className="timezone-radio-input"
                                />
                                <span className="timezone-radio-text">
                                    <span className="tz-name">{tz.label}</span>
                                    <span className="tz-offset">{tz.offset}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                {/* Notification Hour */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Notification Hour (0-23):
                    <input
                        type="number"
                        name="notification_hour"
                        min="0"
                        max="23"
                        value={formData.notification_hour}
                        onChange={handleChange}
                        required
                        style={{ padding: '0.5rem', borderRadius: '4px' }}
                    />
                </label>

                {/* Notification Days Before */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Notify me before cycle change (Days):
                    <input
                        type="number"
                        name="notification_days_before"
                        min="1"
                        max="30"
                        value={formData.notification_days_before}
                        onChange={handleChange}
                        required
                        style={{ padding: '0.5rem', borderRadius: '4px' }}
                    />
                </label>

                <div className="button-group-settings" style={{ marginTop: '2rem', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button type="submit" disabled={loading} className="action-button">
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="action-button secondary">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
