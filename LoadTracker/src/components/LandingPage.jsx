import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const content = {
  en: {
    navbar: {
      signIn: "Sign In",
      createAccount: "Create Account"
    },
    hero: {
      title: <>Periodization<br />on autopilot</>,
      subtitle: <>Stop guessing your recovery. LoadBuddy is a frictionless tracker that calculates exactly when you push your limits and when you need to recover.<br />Maximum hypertrophy, zero burnout.</>,
      getStarted: "Get Started - It's free",
      science: "View the Science"
    },
    burnout: {
      subtitle: "THE BURNOUT CRISIS",
      title: "93% of gym-goers quit within 90 days",
      content: "It's not a lack of willpower. It's a biological failure to manage fatigue. When you train blindly, your central nervous system crashes. LoadBuddy mathematically enforces recovery before you hit the wall."
    },
    features: [
      {
        image: "/Frame 27.png",
        alt: "Binary Focus: Load or Deload",
        title: "Binary Focus. Zero Bloat.",
        desc: <>No spreadsheets. No complex logs. The entire screen is your biological signal. <span className="highlight-green">Green</span> means progressive overload. <span className="highlight-orange">Orange</span> means active recovery.</>
      },
      {
        image: "/Frame 27 (1).png",
        alt: "Customize Cycle Length",
        title: "Your Body. Your Cycles.",
        desc: "Not everyone fits a 4-week cycle. Customize your Load and Deload lengths to match your specific training block and physiology."
      },
      {
        image: "/Frame 43.png",
        alt: "Pause Tasks Button",
        title: "Pause Anytime.",
        desc: "Going on vacation? Sustained an injury? Pause your cycle with one tap and pick up exactly where you left off."
      },
      {
        image: "/Frame 30.png",
        alt: "Notification Preferences",
        title: "Automated Autoregulation.",
        desc: "Never miss a transition. Set custom push notification days in advance so you are mentally and physically prepared to shift from Load to Deload."
      }
    ],
    science: {
      subtitle: "The Science of the \"Sweet Spot\"",
      title: "Built on peer-reviewed exercise science",
      description: "LoadBuddy isn't just a calendar; it's a structural defence against Overtraining Syndrome.",
      points: [
        {
          dotClass: "green-dot",
          url: "https://bjsm.bmj.com/content/51/5/452",
          title: "The Acute Chronic Workload Ratio",
          desc: "Keeping your training stress mathematically tethered to your rolling 28-day keeps you in the physiological \"Sweet Spot\" minimising soft-tissue injury risk."
        },
        {
          dotClass: "orange-dot",
          url: "https://peerj.com/articles/16777/",
          title: "Active Deload vs Total Reset",
          desc: "Taking a full week off causes neurological detraining. LoadBuddy enforces active deloading - cutting volume by 50% to drop inflammation while maintaining strength pathways."
        },
        {
          dotClass: "pink-dot",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11927186/",
          title: "Psychological Resilience",
          desc: "By visualising your recovery phases, LoadBuddy removes the guilt of resting. It proves that recovery isn't \"quitting\" - it's a programmed phase of growth."
        }
      ]
    },
    cta: {
      title: "The math of muscle growth, simplified.",
      desc: <>Join the athletes who train smarter, not just harder.<br/>Open Source. Free forever.</>,
      createAccount: "Create Account"
    }
  },
  hi: {
    navbar: {
      signIn: "Sign In",
      createAccount: "Account Banao"
    },
    hero: {
      title: <>Periodization?<br />Autopilot hai na</>,
      subtitle: <>Recovery guess karna chhod yaar. LoadBuddy sab calculate kar leta hai — kab push karna hai, kab rest.<br />Maximum gains, zero burnout. W app.</>,
      getStarted: "Shuru Kar — Free hai bhai",
      science: "Science dekh"
    },
    burnout: {
      subtitle: "BURNOUT KA BT",
      title: "93% gym-goers 90 din mein hi ghost kar dete hain",
      content: "Willpower ki kami nahi hai bhai. Fatigue manage karna nahi aata — wahi real villain hai. Blindly train karte ho toh CNS literally crash kar jaata hai. LoadBuddy mathematically recovery enforce karta hai — wall se pehle."
    },
    features: [
      {
        image: "/Frame 27.png",
        alt: "Binary Focus: Load or Deload",
        title: "Do cheezein. Koi bakwaas nahi.",
        desc: <>Na spreadsheets, na complex logs. Poora screen teri biological signal hai. <span className="highlight-green">Green</span> = progressive overload. <span className="highlight-orange">Orange</span> = chill mode. That's it.</>
      },
      {
        image: "/Frame 27 (1).png",
        alt: "Customize Cycle Length",
        title: "Tera body. Tera cycle. Teri marzi.",
        desc: "Har kisi pe 4-week cycle fit nahi hota — obvious hai. Load aur Deload customize karo apne hisaab se. No cap."
      },
      {
        image: "/Frame 43.png",
        alt: "Pause Tasks Button",
        title: "Ruk ja jab man kare.",
        desc: "Goa trip plan hai? Injury ho gayi? Ek tap mein pause karo. Waapas aao toh wahin se shuru — koi drama nahi."
      },
      {
        image: "/Frame 30.png",
        alt: "Notification Preferences",
        title: "Automatic Autoregulation. Zero bhool.",
        desc: "Koi transition miss mat karo yaar. Advance notifications set karo — Load se Deload shift ke liye mentally aur physically ready rehna padega. App remind karega."
      }
    ],
    science: {
      subtitle: "\"Sweet Spot\" ki actual science",
      title: "Peer-reviewed exercise science pe bana — randomly nahi banaya",
      description: "LoadBuddy sirf ek calendar nahi hai yaar — yeh Overtraining Syndrome ke against full structural defence hai.",
      points: [
        {
          dotClass: "green-dot",
          url: "https://bjsm.bmj.com/content/51/5/452",
          title: "Acute Chronic Workload Ratio",
          desc: "Tera training stress rolling 28-day average se linked rehta hai — tu physiological \"Sweet Spot\" mein rehta hai. Soft-tissue injury? L nahi leni na?"
        },
        {
          dotClass: "orange-dot",
          url: "https://peerj.com/articles/16777/",
          title: "Active Deload vs Total Reset",
          desc: "Poora week off = neurological detraining. That's an L. LoadBuddy active deload enforce karta hai — volume 50% cut, inflammation down, strength intact. Smart move."
        },
        {
          dotClass: "pink-dot",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11927186/",
          title: "Psychological Resilience",
          desc: "Rest karne ka guilt? Chhod yaar. LoadBuddy prove karta hai ki recovery \"quitting\" nahi — yeh growth ka programmed phase hai. Rest is W."
        }
      ]
    },
    cta: {
      title: "Muscle growth ka maths, simple kar diya.",
      desc: <>Un athletes mein shamil ho jo smart train karte hain, sirf hard nahi.<br/>Open Source. Hamesha Free. No catch.</>,
      createAccount: "Account Banao"
    }
  }
};

export function LandingPage({ onSignIn, onSignUp }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lb_lang') || 'en');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    localStorage.setItem('lb_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLang(prevLang => prevLang === 'en' ? 'hi' : 'en');
      setIsTransitioning(false);
    }, 150); // 150ms total transition time matching CSS
  };

  const t = content[lang];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-left">
          <div className="nav-logo">LoadBuddy</div>
          <button 
            className="lang-toggle-btn" 
            onClick={toggleLang}
            aria-label="Toggle Language"
          >
            {lang === 'en' ? '🇮🇳 Hinglish' : '🇬🇧 English'}
          </button>
        </div>
        
        <div className="nav-actions">
          <button className="nav-btn signin-btn" onClick={onSignIn} aria-label="Sign In">{t.navbar.signIn}</button>
          <button className="nav-btn create-btn" onClick={onSignUp} aria-label="Create Account">{t.navbar.createAccount}</button>
        </div>
      </nav>

      <main className={`landing-main fade-content ${isTransitioning ? 'fade-out' : ''}`}>
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">{t.hero.title}</h1>
          <p className="hero-subtitle">
            {t.hero.subtitle}
          </p>
          <div className="hero-actions">
            <button className="hero-btn get-started-btn" onClick={onSignUp}>{t.hero.getStarted}</button>
            <button className="hero-btn view-science-btn" onClick={() => document.getElementById('science-section').scrollIntoView({behavior: 'smooth'})}>{t.hero.science}</button>
          </div>

          {/* Phones Graphic */}
          <div className="hero-graphics">
            <div className="glow green-glow"></div>
            <div className="glow orange-glow"></div>
            <div className="phone-mockup phone-load">
              <img src="/iPhone 17 Load.svg" alt="Load Phase Interface" loading="lazy" />
            </div>
            <div className="phone-mockup phone-deload">
              <img src="/iPhone 17 DeLoad.svg" alt="Deload Phase Interface" loading="lazy" />
            </div>
          </div>
        </section>

        {/* The Burnout Crisis Section */}
        <section className="burnout-section">
          <div className="burnout-card">
            <h3 className="burnout-subtitle">{t.burnout.subtitle}</h3>
            <h2 className="burnout-title">
              <a href="https://fortisfitness.ca/how-we-are-set-up-to-fail-by-the-gym-industry-the-plot-thickens/" target="_blank" rel="noopener noreferrer">
                {t.burnout.title}
              </a>
            </h2>
            <p className="burnout-content">
              {t.burnout.content}
            </p>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="features-grid">
          {t.features.map((feature, idx) => (
            <article key={idx} className="feature-card">
              <div className="feature-image">
                <img src={feature.image} alt={feature.alt} loading="lazy" />
              </div>
              <div className="feature-text">
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Science Section */}
        <section id="science-section" className="science-section">
          <div className="science-header">
            <span className="science-subtitle">{t.science.subtitle}</span>
            <h2>{t.science.title}</h2>
            <p className="science-description">
              {t.science.description}
            </p>
          </div>
          
          <div className="science-points">
            {t.science.points.map((point, idx) => (
              <div key={idx} className="science-point">
                <div className={`point-indicator ${point.dotClass}`}></div>
                <div className="point-content">
                  <h3>
                    <a href={point.url} target="_blank" rel="noopener noreferrer">
                      {point.title}
                    </a>
                  </h3>
                  <p>{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <h2>{t.cta.title}</h2>
            <p>{t.cta.desc}</p>
            
            <div className="cta-form">
              <input type="email" placeholder="Email Address" aria-label="Email Address" />
              <button className="create-btn" onClick={onSignUp}>{t.cta.createAccount}</button>
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

