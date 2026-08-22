import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { timezoneOptionsFor } from '../lib/timezones';
import { LIMITS, formatDisplayDate, initialFormData, maxDeloadWeeks, toProfileRow } from '../lib/cycle';

export function Settings({ session, profile, onProfileUpdated, onCancel, isDeload }) {
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formData, setFormData] = useState(() => initialFormData(profile));
    const dateInputRef = useRef(null);

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
        setFormError(null);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert(toProfileRow(session, formData))
                .select()
                .single();
            if (error) throw error;

            onProfileUpdated(data);
        } catch (error) {
            setFormError(error.message);
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
        setFormError(null);
        try {
            const { error: rpcError } = await supabase.rpc('delete_user');
            if (rpcError) throw rpcError;
            
            await supabase.auth.signOut();
        } catch (error) {
            setFormError(error.message);
            setLoading(false);
        }
    };

    const themeClass = isDeload ? 'settings-deload' : 'settings-load';
    const timezoneOptions = timezoneOptionsFor(formData.timezone);

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
                            <div className="settings-field-value" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => dateInputRef.current?.showPicker?.()}>
                                <span style={{ color: '#fff', fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500, fontSize: 'clamp(0.875rem, 4vw, 1.5rem)' }}>
                                    {formatDisplayDate(formData.start_date)}
                                </span>
                                <input
                                    ref={dateInputRef}
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
                                    min={LIMITS.cycle_length_weeks.min}
                                    max={LIMITS.cycle_length_weeks.max}
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
                                    max={maxDeloadWeeks(formData.cycle_length_weeks)}
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
                                {timezoneOptions.map((tz) => (
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
                                    min={LIMITS.notification_hour.min}
                                    max={LIMITS.notification_hour.max}
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
                                    min={LIMITS.notification_days_before.min}
                                    max={LIMITS.notification_days_before.max}
                                    value={formData.notification_days_before}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Inline error */}
                        {formError && (
                            <div className="settings-error">
                                <span className="settings-error-icon">⚠️</span>
                                <span>{formError}</span>
                                <button type="button" className="settings-error-close" onClick={() => setFormError(null)}>✕</button>
                            </div>
                        )}

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
