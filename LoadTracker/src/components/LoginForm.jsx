import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // If email confirmation is enabled, session will be null
                if (data.user && !data.session) {
                    setMessage('Check your email for a confirmation link to complete sign up!');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form-container">
            <div className="login-tabs">
                <button
                    type="button"
                    className={`login-tab ${mode === 'signin' ? 'active' : ''}`}
                    onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                >
                    Sign In
                </button>
                <button
                    type="button"
                    className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
                    onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                >
                    Create Account
                </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-field">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    />
                </div>

                {error && <div className="form-error">{error}</div>}
                {message && <div className="form-message">{message}</div>}

                <button type="submit" disabled={loading} className="login-button">
                    {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
