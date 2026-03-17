import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function ResetPassword({ onComplete }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;
            
            setMessage('Password updated successfully!');
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 2000);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form-container">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>Reset Your Password</h2>
            
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-field">
                    <label htmlFor="reset-password">New Password</label>
                    <input
                        id="reset-password"
                        type="password"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                {error && <div className="form-error">{error}</div>}
                {message && <div className="form-message">{message}</div>}

                <button type="submit" disabled={loading || !!message} className="login-button">
                    {loading ? 'Please wait...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
