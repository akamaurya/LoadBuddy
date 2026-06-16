import React from 'react';
import './LegalPage.css';

export function PrivacyPage({ onBack }) {
  return (
    <div className="legal-container">
      <nav className="legal-nav">
        <button className="legal-back-btn" onClick={onBack} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div className="legal-logo">LoadBuddy</div>
      </nav>

      <main className="legal-content">
        <div className="legal-header">
          <span className="legal-label">LEGAL</span>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: June 16, 2026</p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. Introduction</h2>
            <p>
              LoadBuddy ("we", "us", "our") respects your privacy. This Privacy Policy explains how we 
              collect, use, and protect your information when you use our training periodization service.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>Account Information</h3>
            <p>
              When you create an account, we collect your email address and authentication credentials. 
              This information is managed through Supabase, our authentication and database provider.
            </p>

            <h3>Training Profile Data</h3>
            <p>
              We collect information you provide during onboarding, including:
            </p>
            <ul>
              <li>Training cycle preferences (load and deload week lengths)</li>
              <li>Cycle start date</li>
              <li>Timezone</li>
              <li>Notification preferences</li>
            </ul>

            <h3>Usage Analytics</h3>
            <p>
              We use Vercel Analytics to collect anonymized usage data such as page views and general 
              interaction patterns. This data does not personally identify you.
            </p>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>Your information is used solely to:</p>
            <ul>
              <li>Manage your training load/deload cycles</li>
              <li>Send phase transition notifications (if you opt in)</li>
              <li>Improve the Service based on aggregate usage patterns</li>
              <li>Maintain and secure your account</li>
            </ul>
          </section>

          <section>
            <h2>4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Supabase</strong> — Authentication and database hosting</li>
              <li><strong>OneSignal</strong> — Push notification delivery (only if you enable notifications)</li>
              <li><strong>Vercel</strong> — Hosting and anonymized analytics</li>
            </ul>
            <p>
              Each of these services has their own privacy policy. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2>5. Data Storage & Security</h2>
            <p>
              Your data is stored securely using Supabase's infrastructure with Row Level Security (RLS) 
              policies. Only you can access your own profile and training data. We implement appropriate 
              technical measures to protect your information from unauthorized access.
            </p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, 
              your profile and training data will be permanently removed from our systems.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Update or correct your information through the Settings page</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of push notifications at any time</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies & Local Storage</h2>
            <p>
              LoadBuddy uses browser local storage to persist user preferences such as language selection, 
              pause state, and notification banner dismissal. We do not use third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>
              The Service is not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If you believe a child has provided us with personal 
              information, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2>10. Open Source Transparency</h2>
            <p>
              LoadBuddy is open-source. You can review exactly what data we collect and how we handle it 
              by inspecting our{' '}
              <a href="https://github.com/akamaurya/LoadBuddy" target="_blank" rel="noopener noreferrer">
                source code on GitHub
              </a>.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be reflected on this page 
              with an updated "Last updated" date. Continued use of the Service after changes constitutes 
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              For privacy-related questions or data requests, please reach out via our{' '}
              <a href="https://github.com/akamaurya/LoadBuddy/issues" target="_blank" rel="noopener noreferrer">
                GitHub Issues
              </a> page.
            </p>
          </section>
        </div>
      </main>

      <footer className="legal-footer">
        <p>© {new Date().getFullYear()} LoadBuddy · Open Source · Free Forever</p>
      </footer>
    </div>
  );
}
