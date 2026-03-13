import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, addDays } from 'date-fns';
import './OnboardingWizard.css';

const TIMEZONE_OPTIONS = [
  { label: 'US Pacific', value: 'America/Los_Angeles' },
  { label: 'US Mountain', value: 'America/Denver' },
  { label: 'US Central', value: 'America/Chicago' },
  { label: 'US Eastern', value: 'America/New_York' },
  { label: 'UK / GMT', value: 'Europe/London' },
  { label: 'Central Europe', value: 'Europe/Berlin' },
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'Japan (JST)', value: 'Asia/Tokyo' },
  { label: 'Australia East', value: 'Australia/Sydney' },
];

function detectTimezone() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (detected === 'Asia/Calcutta') return 'Asia/Kolkata';
  const match = TIMEZONE_OPTIONS.find(tz => tz.value === detected);
  return match ? detected : 'America/New_York';
}

export function OnboardingWizard({ session, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    cycle_length_weeks: 4,
    deload_length_weeks: 1,
    timezone: detectTimezone(),
    notification_hour: 8,
    notification_days_before: 4,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAndStart = async () => {
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

      // Move to success step
      setStep(4);
      
      // Auto-continue after short delay down to main flow
      setTimeout(() => {
        onComplete(updates);
      }, 3500);

    } catch (error) {
      alert("Error saving profile: " + error.message);
      setLoading(false);
    }
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const pdots = [1, 2, 3, 4];

  return (
    <div className="onboarding-wrap auth-app-view">
      <div className="onboarding-logo">LOAD</div>
      
      <div className="onboarding-progress">
        {pdots.map(d => (
          <div 
            key={d} 
            className={`onboarding-pdot ${step === d ? 'active' : ''} ${step > d ? 'done' : ''}`} 
          />
        ))}
      </div>

      <div className="onboarding-card">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="onboarding-step active">
            <div className="onboarding-step-title">Step 1 of 3</div>
            <div className="onboarding-step-head">Training block</div>
            
            <div className="onboarding-field">
              <label>Start date</label>
              <input 
                type="date" 
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="onboarding-row2">
              <div className="onboarding-field">
                <label>Cycle length</label>
                <input 
                  type="number" 
                  name="cycle_length_weeks"
                  value={formData.cycle_length_weeks} 
                  min="1" max="52"
                  onChange={handleChange}
                />
                <div className="onboarding-hint">weeks</div>
              </div>
              <div className="onboarding-field">
                <label>Deload length</label>
                <input 
                  type="number" 
                  name="deload_length_weeks"
                  value={formData.deload_length_weeks}
                  min="1" max={formData.cycle_length_weeks}
                  onChange={handleChange}
                />
                <div className="onboarding-hint">weeks</div>
              </div>
            </div>
            
            <div className="onboarding-btn-row">
              <button className="onboarding-btn btn-next" onClick={handleNext}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="onboarding-step active">
            <div className="onboarding-step-title">Step 2 of 3</div>
            <div className="onboarding-step-head">Notifications</div>
            
            <div className="onboarding-field">
              <label>Timezone</label>
              <div className="onboarding-tz-row">
                <div className="onboarding-tz-dot"></div>
                <div className="onboarding-tz-text">{formData.timezone}</div>
                <div className="onboarding-tz-badge">auto</div>
              </div>
              <div className="onboarding-hint" style={{marginTop: '6px'}}>Detected from your device</div>
            </div>
            
            <div className="onboarding-row2">
              <div className="onboarding-field">
                <label>Notify at hour</label>
                <input 
                  type="number" 
                  name="notification_hour"
                  value={formData.notification_hour}
                  min="0" max="23"
                  onChange={handleChange}
                />
                <div className="onboarding-hint">0–23 (8 = 8am)</div>
              </div>
              <div className="onboarding-field">
                <label>Days before</label>
                <input 
                  type="number" 
                  name="notification_days_before"
                  value={formData.notification_days_before}
                  min="1" max="14"
                  onChange={handleChange}
                />
                <div className="onboarding-hint">cycle change</div>
              </div>
            </div>
            
            <div className="onboarding-btn-row">
              <button className="onboarding-btn btn-back" onClick={handleBack}>Back</button>
              <button className="onboarding-btn btn-next" onClick={handleNext}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="onboarding-step active">
            <div className="onboarding-step-title">Step 3 of 3</div>
            <div className="onboarding-step-head">Confirm setup</div>
            
            <div className="onboarding-summary-rows">
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Start date</span>
                <span className="onboarding-summary-val">{formatDisplayDate(formData.start_date)}</span>
              </div>
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Cycle length</span>
                <span className="onboarding-summary-val">{formData.cycle_length_weeks} weeks</span>
              </div>
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Deload length</span>
                <span className="onboarding-summary-val">{formData.deload_length_weeks} week(s)</span>
              </div>
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Timezone</span>
                <span className="onboarding-summary-val" style={{fontSize: '11px'}}>{formData.timezone}</span>
              </div>
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Notify at</span>
                <span className="onboarding-summary-val">{formData.notification_hour}:00</span>
              </div>
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Days before change</span>
                <span className="onboarding-summary-val">{formData.notification_days_before} days</span>
              </div>
            </div>
            
            <div className="onboarding-btn-row">
              <button className="onboarding-btn btn-back" onClick={handleBack} disabled={loading}>Back</button>
              <button className="onboarding-btn btn-next" onClick={handleSaveAndStart} disabled={loading}>
                {loading ? 'Saving...' : 'Save & start'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="onboarding-step active">
            <div className="onboarding-confetti-wrap">
              <div className="big-check">✓</div>
              <div className="done-title">You're all set!</div>
              <div className="done-sub">
                Your training block starts on<br/>
                <span style={{color:'#fff', fontWeight:500}}>{formatDisplayDate(formData.start_date)}</span>. 
                We'll remind you <span style={{color:'#fff', fontWeight:500}}>{formData.notification_days_before}</span> days before each cycle change.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
