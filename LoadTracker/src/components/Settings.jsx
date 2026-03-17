import { useState } from 'react';
import { supabase } from '../lib/supabase';

const TIMEZONE_OPTIONS = [
    { label: 'US Pacific', value: 'America/Los_Angeles', offset: 'UTC - 8 / UTC - 7' },
    { label: 'US Mountain', value: 'America/Denver', offset: 'UTC - 7 / UTC - 6' },
    { label: 'US Central', value: 'America/Chicago', offset: 'UTC - 6 / UTC - 5' },
    { label: 'US Eastern', value: 'America/New_York', offset: 'UTC - 5 / UTC - 4' },
    { label: 'UK / GMT', value: 'Europe/London', offset: 'UTC + 0 / UTC + 1' },
    { label: 'Central Europe', value: 'Europe/Berlin', offset: 'UTC + 1 / UTC + 2' },
    { label: 'India (IST)', value: 'Asia/Kolkata', offset: 'UTC + 5:30' },
    { label: 'Japan (JST)', value: 'Asia/Tokyo', offset: 'UTC + 9' },
    { label: 'Australia East', value: 'Australia/Sydney', offset: 'UTC + 10 / UTC + 11' },
];

function detectTimezone() {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Map common aliases
    if (detected === 'Asia/Calcutta') return 'Asia/Kolkata';
    // Check if it matches one of our options
    const match = TIMEZONE_OPTIONS.find(tz => tz.value === detected);
    return match ? detected : 'America/New_York'; // fallback
}

export function Settings({ session, profile, onProfileUpdated, onCancel, isDeload }) {
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
        const { name, value } = e.target;
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

    const handleDeleteAccount = async () => {
        const confirm1 = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (!confirm1) return;
        
        const confirm2 = window.confirm("Final confirmation: Delete all data and account forever?");
        if (!confirm2) return;

        setLoading(true);
        try {
            const { error: rpcError } = await supabase.rpc('delete_user');
            if (rpcError) throw rpcError;
            
            await supabase.auth.signOut();
        } catch (error) {
            alert("Error deleting account: " + error.message);
            setLoading(false);
        }
    };

    // Ordinal suffix helper
    const getOrdinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Format the date for display as "1st Jan 2026"
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr + 'T00:00:00');
            const day = getOrdinal(d.getDate());
            const month = d.toLocaleDateString('en-US', { month: 'short' });
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateStr;
        }
    };

    const themeClass = isDeload ? 'settings-deload' : 'settings-load';

    return (
        <div className={`settings-container ${themeClass}`}>
            {/* State Title */}
            <div className="settings-title">
                {isDeload ? 'DELOAD' : 'LOAD'}
            </div>

            {/* Inner Card */}
            <div className="settings-card">
                <div className="settings-card-content">
                    {/* Preferences Heading */}
                    <h2 className="settings-heading">Preferences</h2>

                    {/* Form */}
                    <form className="settings-form" onSubmit={handleSubmit}>

                        {/* Training Block Start Date */}
                        <div className="settings-field-row">
                            <span className="settings-field-label">Training Block Start Date:</span>
                            <div className="settings-field-value" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('settings-date-input').showPicker?.()}>
                                <span style={{ color: '#fff', fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500, fontSize: 'clamp(0.875rem, 4vw, 1.5rem)' }}>
                                    {formatDisplayDate(formData.start_date)}
                                </span>
                                <input
                                    id="settings-date-input"
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        {/* Cycle Length */}
                        <div className="settings-field-row">
                            <span className="settings-field-label">Cycle Length (Weeks):</span>
                            <div className="settings-field-value">
                                <input
                                    type="number"
                                    name="cycle_length_weeks"
                                    min="1"
                                    value={formData.cycle_length_weeks}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Deload Length */}
                        <div className="settings-field-row">
                            <span className="settings-field-label">Deload Length (Weeks):</span>
                            <div className="settings-field-value">
                                <input
                                    type="number"
                                    name="deload_length_weeks"
                                    min="1"
                                    max={formData.cycle_length_weeks}
                                    value={formData.deload_length_weeks}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Timezone */}
                        <div className="settings-tz-section">
                            <span className="settings-tz-label">Timezone:</span>
                            <div className="settings-tz-list">
                                {TIMEZONE_OPTIONS.map((tz) => (
                                    <label
                                        key={tz.value}
                                        className={`settings-tz-item ${formData.timezone === tz.value ? 'selected' : ''}`}
                                        onClick={() => handleTimezoneChange(tz.value)}
                                    >
                                        <input
                                            type="radio"
                                            name="timezone"
                                            value={tz.value}
                                            checked={formData.timezone === tz.value}
                                            onChange={() => handleTimezoneChange(tz.value)}
                                            className="settings-tz-radio"
                                        />
                                        <div className="settings-tz-left">
                                            <span className="settings-tz-dot" />
                                            <span className="settings-tz-name">{tz.label}</span>
                                        </div>
                                        <span className="settings-tz-offset">{tz.offset}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Notification Hour */}
                        <div className="settings-field-row">
                            <span className="settings-field-label">Notification Hour (0-23):</span>
                            <div className="settings-field-value">
                                <input
                                    type="number"
                                    name="notification_hour"
                                    min="0"
                                    max="23"
                                    value={formData.notification_hour}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Notify Before Cycle Change */}
                        <div className="settings-field-row">
                            <span className="settings-field-label">Notify me before cycle change (Days):</span>
                            <div className="settings-field-value">
                                <input
                                    type="number"
                                    name="notification_days_before"
                                    min="1"
                                    max="30"
                                    value={formData.notification_days_before}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Button Row */}
                        <div className="settings-btn-row">
                            <button type="submit" disabled={loading} className="settings-btn">
                                <span>{loading ? 'Saving...' : 'Save'}</span>
                            </button>
                            {onCancel && (
                                <button type="button" onClick={onCancel} className="settings-btn" disabled={loading}>
                                    <span>Cancel</span>
                                </button>
                            )}
                        </div>

                        {/* Danger Zone */}
                        <div style={{ marginTop: '2rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <button 
                                type="button" 
                                onClick={handleDeleteAccount} 
                                disabled={loading}
                                className="delete-account-btn"
                            >
                                Delete Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
