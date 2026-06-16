import React from 'react';
import './LegalPage.css';

export function TermsPage({ onBack }) {
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
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: June 16, 2026</p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using LoadBuddy ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              LoadBuddy is an open-source training periodization tool that helps users manage their 
              load and deload training cycles. The Service provides automated cycle tracking, notifications, 
              and training phase management.
            </p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>
              To use certain features of the Service, you must create an account. You are responsible for 
              maintaining the confidentiality of your account credentials and for all activities that occur 
              under your account. You agree to provide accurate and complete information when creating your account.
            </p>
          </section>

          <section>
            <h2>4. User Responsibilities</h2>
            <ul>
              <li>You must be at least 13 years of age to use the Service.</li>
              <li>You are solely responsible for your use of the Service and any training decisions you make.</li>
              <li>You agree not to misuse the Service or interfere with its operation.</li>
              <li>You will not attempt to gain unauthorized access to any part of the Service.</li>
            </ul>
          </section>

          <section>
            <h2>5. Health Disclaimer</h2>
            <p>
              LoadBuddy is a periodization management tool and does <strong>not</strong> provide medical or 
              professional fitness advice. The Service is not a substitute for professional guidance from a 
              qualified physician, trainer, or healthcare provider.
            </p>
            <p>
              Always consult a healthcare professional before beginning any exercise program. You assume all 
              risks associated with your training activities. LoadBuddy and its creators shall not be held 
              liable for any injuries, health issues, or adverse effects resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2>6. Open Source License</h2>
            <p>
              LoadBuddy is open-source software. The source code is available on{' '}
              <a href="https://github.com/akamaurya/LoadBuddy" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              . Use of the source code is subject to the applicable open-source license in the repository.
            </p>
          </section>

          <section>
            <h2>7. Service Availability</h2>
            <p>
              We strive to keep the Service available at all times, but we do not guarantee uninterrupted access. 
              The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2>8. Termination</h2>
            <p>
              You may delete your account at any time. We reserve the right to suspend or terminate accounts 
              that violate these Terms. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, LoadBuddy and its contributors shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages arising from your use of 
              the Service. The Service is provided "as is" and "as available" without warranties of any kind.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes 
              constitutes acceptance of the updated Terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              For questions about these Terms, please reach out via our{' '}
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
