import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Settings({ session, profile, onProfileUpdated, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        start_date: profile?.start_date || new Date().toISOString().split('T')[0],
        cycle_length_weeks: profile?.cycle_length_weeks || 4,
        deload_length_weeks: profile?.deload_length_weeks || 1,
        timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        notification_hour: profile?.notification_hour || 20,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates = {
                id: session.user.id,
                ...formData,
                cycle_length_weeks: parseInt(formData.cycle_length_weeks, 10),
                deload_length_weeks: parseInt(formData.deload_length_weeks, 10),
                notification_hour: parseInt(formData.notification_hour, 10),
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
        <div className="settings-modal" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px' }}>
            <h2>Preferences</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Training Block Start Date:
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Cycle Length (Weeks):
                    <input type="number" name="cycle_length_weeks" min="1" value={formData.cycle_length_weeks} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Deload Length (Weeks):
                    <input type="number" name="deload_length_weeks" min="1" max={formData.cycle_length_weeks} value={formData.deload_length_weeks} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Timezone:
                    <input type="text" name="timezone" value={formData.timezone} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    Notification Hour (0-23):
                    <input type="number" name="notification_hour" min="0" max="23" value={formData.notification_hour} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>

                <div className="button-group" style={{ marginTop: '1rem' }}>
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
