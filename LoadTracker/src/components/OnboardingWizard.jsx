import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LIMITS, formatDisplayDate, initialFormData, maxDeloadWeeks, toProfileRow } from '../lib/cycle';
import './OnboardingWizard.css';

const TOTAL_INPUT_STEPS = 3; // steps 1-3 collect input; step 4 is the confirmation screen

export function OnboardingWizard({ session, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [formData, setFormData] = useState(() => initialFormData(null));
  const doneTimer = useRef(null);

  useEffect(() => () => clearTimeout(doneTimer.current), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAndStart = async () => {
    setLoading(true);
    setSaveError(null);
    const row = toProfileRow(session, formData);

    // Retry transient network errors — iOS Safari drops the first request
    // ("Load failed") often enough to strand users on the final step.
    const MAX_RETRIES = 2;
    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const { data, error } = await supabase.from('profiles').upsert(row).select().single();
      if (!error) {
        setStep(4);
        doneTimer.current = setTimeout(() => onComplete(data), 3500);
        return;
      }
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, attempt === 0 ? 300 : 800));
      }
    }

    console.error('Profile save failed after retries:', lastError);
    setSaveError("Couldn't save — check your connection and try again.");
    setLoading(false);
  };

  const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_INPUT_STEPS));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const pdots = [1, 2, 3];

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
            <div className="onboarding-step-title">Step 1 of {TOTAL_INPUT_STEPS}</div>
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
                  min={LIMITS.cycle_length_weeks.min} max={LIMITS.cycle_length_weeks.max}
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
                  min="1" max={maxDeloadWeeks(formData.cycle_length_weeks)}
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
            <div className="onboarding-step-title">Step 2 of {TOTAL_INPUT_STEPS}</div>
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
                  min={LIMITS.notification_hour.min} max={LIMITS.notification_hour.max}
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
                  min={LIMITS.notification_days_before.min} max={LIMITS.notification_days_before.max}
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
            <div className="onboarding-step-title">Step 3 of {TOTAL_INPUT_STEPS}</div>
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
            
            {saveError && <div className="onboarding-error">{saveError}</div>}

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
