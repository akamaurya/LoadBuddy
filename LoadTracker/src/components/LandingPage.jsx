import React from 'react';
import './LandingPage.css';

export function LandingPage({ onSignIn, onSignUp }) {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">LoadBuddy</div>
        <div className="nav-actions">
          <button className="nav-btn signin-btn" onClick={onSignIn} aria-label="Sign In">Sign In</button>
          <button className="nav-btn create-btn" onClick={onSignUp} aria-label="Create Account">Create Account</button>
        </div>
      </nav>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Periodization<br />on autopilot</h1>
          <p className="hero-subtitle">
            Stop guessing your recovery. LoadBuddy is a frictionless tracker that
            calculates exactly when you push your limits and when you need to recover.<br />
            Maximum hypertrophy, zero burnout.
          </p>
          <div className="hero-actions">
            <button className="hero-btn get-started-btn" onClick={onSignUp}>Get Started - It's free</button>
            <button className="hero-btn view-science-btn" onClick={() => document.getElementById('science-section').scrollIntoView({behavior: 'smooth'})}>View the Science</button>
          </div>

          {/* Phones Graphic */}
          <div className="hero-graphics">
            <div className="glow green-glow"></div>
            <div className="glow orange-glow"></div>
            <div className="phone-mockup phone-load">
              <img src="/iPhone 17 Load.png" alt="Load Phase Interface" loading="lazy" />
            </div>
            <div className="phone-mockup phone-deload">
              <img src="/iPhone 17 DeLoad.png" alt="Deload Phase Interface" loading="lazy" />
            </div>
          </div>
        </section>

        {/* The Burnout Crisis Section */}
        <section className="burnout-section">
          <div className="burnout-card">
            <h3 className="burnout-subtitle">THE BURNOUT CRISIS</h3>
            <h2 className="burnout-title">93% of gym-goers quit within 90 days</h2>
            <p className="burnout-content">
              It's not a lack of willpower. It's a biological failure to manage fatigue. When you train blindly, your central nervous system crashes. LoadBuddy mathematically enforces recovery before you hit the wall.
            </p>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="features-grid">
          {/* Feature 1 */}
          <article className="feature-card">
            <div className="feature-image">
              <img src="/Frame 27.png" alt="Binary Focus: Load or Deload" loading="lazy" />
            </div>
            <div className="feature-text">
              <h3>Binary Focus. Zero Bloat.</h3>
              <p>No spreadsheets. No complex logs. The entire screen is your biological signal. <span className="highlight-green">Green</span> means progressive overload. <span className="highlight-orange">Orange</span> means active recovery.</p>
            </div>
          </article>

          {/* Feature 2 */}
          <article className="feature-card">
            <div className="feature-image">
              <img src="/Frame 27 (1).png" alt="Customize Cycle Length" loading="lazy" />
            </div>
            <div className="feature-text">
              <h3>Your Body. Your Cycles.</h3>
              <p>Not everyone fits a 4-week cycle. Customize your Load and Deload lengths to match your specific training block and physiology.</p>
            </div>
          </article>

          {/* Feature 3 */}
          <article className="feature-card">
            <div className="feature-image">
              <img src="/Frame 43.png" alt="Pause Tasks Button" loading="lazy" />
            </div>
            <div className="feature-text">
              <h3>Pause Anytime.</h3>
              <p>Going on vacation? Sustained an injury? Pause your cycle with one tap and pick up exactly where you left off.</p>
            </div>
          </article>

          {/* Feature 4 */}
          <article className="feature-card">
            <div className="feature-image">
              <img src="/Frame 30.png" alt="Notification Preferences" loading="lazy" />
            </div>
            <div className="feature-text">
              <h3>Automated Autoregulation.</h3>
              <p>Never miss a transition. Set custom push notification days in advance so you are mentally and physically prepared to shift from Load to Deload.</p>
            </div>
          </article>
        </section>

        {/* Science Section */}
        <section id="science-section" className="science-section">
          <div className="science-header">
            <span className="science-subtitle">The Science of the "Sweet Spot"</span>
            <h2>Built on peer-reviewed exercise science</h2>
            <p className="science-description">
              LoadBuddy isn't just a calendar; it's a structural defence against Overtraining Syndrome.
            </p>
          </div>
          
          <div className="science-points">
            <div className="science-point">
              <div className="point-indicator green-dot"></div>
              <div className="point-content">
                <h3>The Acute Chronic Workload Ratio</h3>
                <p>Keeping your training stress mathematically tethered to your rolling 28-day keeps you in the physiological "Sweet Spot" minimising soft-tissue injury risk.</p>
              </div>
            </div>

            <div className="science-point">
              <div className="point-indicator orange-dot"></div>
              <div className="point-content">
                <h3>Active Deload vs Total Reset</h3>
                <p>Taking a full week off causes neurological detraining. LoadBuddy enforces active deloading - cutting volume by 50% to drop inflammation while maintaining strength pathways.</p>
              </div>
            </div>

            <div className="science-point">
              <div className="point-indicator pink-dot"></div>
              <div className="point-content">
                <h3>Psychological Resilience</h3>
                <p>By visualising your recovery phases, LoadBuddy removes the guilt of resting. It proves that recovery isn't "quitting" - it's a programmed phase of growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <h2>The math of muscle growth, simplified.</h2>
            <p>Join the athelets who train smarter, not just harder.<br/>Open Source. Free forever.</p>
            
            <div className="cta-form">
              <input type="email" placeholder="Email Address" aria-label="Email Address" />
              <button className="create-btn" onClick={onSignUp}>Create Account</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Github Repo | Terms | Privacy</p>
      </footer>
    </div>
  );
}
