import React, { useEffect } from 'react'
import './css/hero.css'
import { useTheme } from '../context/ThemeContext';

const Hero = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const glow = document.querySelector(".cursor-glow");

    const moveGlow = (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    };

    window.addEventListener("mousemove", moveGlow);

    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  return (
    <section className="hero">
      
      <div className="cursor-glow"></div>

      <div className="ai-hero-card">
        <h1 className="ai-hero-title">
          All-in-One Management Platform for Smarter Work
        </h1>
        <div className="typewriter">
          <div>
            <p className="ai-hero-description">
              Manage tasks, expenses, attendance, and academics
            </p>
          </div>
        </div>

        <div className="ai-button-group">
          <a href="#" className="btn btn-primary">
            Get Started for Free
          </a>

          <a href="#" className="btn btn-outline">
            Explore Features
          </a>
        </div>
      </div>

      <div className="hero-inner">
        <div className="hero-left">
          <p className="hero-pill autoshow">Available for work</p>

          <h1 className="hero-title autoshow">
            Effortless Task Management
            <span>for Individuals</span>
          </h1>

          <p className="hero-subtitle autoshow">
            Our service caters to individuals, ensuring anyone can
            stay organized and focused.
          </p>

          <div className="hero-actions autoshow">
            <div className="hero-input-wrapper">
              <input
                type="email"
                placeholder="Enter your email"
                className="hero-input"
              />
              <button className="hero-button primary">Try it free</button>
            </div>
          </div>
        </div>

        <div className="hero-right">
          {}

          <div className="hero-card hero-card-secondary autoshow">
            <p className="hero-card-title">Track real-time progress with Reports</p>
            <p className="hero-card-text">
              Gain valuable insights into your productivity and project status with our
              real-time reporting features.
            </p>
            <button className="hero-button secondary autoshow">Get Started</button>
          </div>

          <div className="hero-card hero-visitor-card autoshow">
            <div className="hero-visitor-header">
              <span className="hero-visitor-title">Visitor Source</span>

              <button className="hero-visitor-filter">
                <span>Last month</span>
                <span className="hero-visitor-filter-icon" aria-hidden="true">
                  ⏷
                </span>
              </button>
            </div>

            <div className="hero-visitor-body">
              <div className="hero-visitor-donut">
                <div className="hero-visitor-donut-inner">
                  <span className="hero-visitor-percent">84%</span>
                  <span className="hero-visitor-caption">Total Platform Visitor</span>
                </div>
              </div>

              <ul className="hero-visitor-legend">
                <li className="hero-visitor-legend-item legend-website">
                  <span className="legend-dot" />
                  <span>Website (69%)</span>
                </li>
                <li className="hero-visitor-legend-item legend-instagram">
                  <span className="legend-dot" />
                  <span>Workout (25%)</span>
                </li>
                <li className="hero-visitor-legend-item legend-facebook">
                  <span className="legend-dot" />
                  <span>Attendance (73%)</span>
                </li>
                <li className="hero-visitor-legend-item legend-tiktok">
                  <span className="legend-dot" />
                  <span>Tasks (35%)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bonsai-trust-banner">
        <div className="trust-row">
          <div className="headline">
            <h1>
              <span className='two autoshow'>Smart Task & Expense Management</span>
              <span className='one autoshow'>for students, professionals, and growing teams.</span>
            </h1>
          </div>
          <div className="rating-compact">
            <div className="stars" aria-label="5 out of 5 stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <div className="reviews-count">
              <strong>1,020+</strong> reviews
            </div>
          </div>
        </div>

        <div className="logo-strip">
          <div className="logo-track">
            {[
              "Task Management",
              "Expense Tracking",
              "Smart Analytics",
              "Team Collaboration",
              "Real-Time Sync",
              "Secure Storage",
              "Cloud Backup",
              "Productivity Tools",
              "Goal Planning",
              "Performance Insights"
            ].map((item, index) => (
              <div className="logo-item" key={index}>
                <div className="logo-box">{item}</div>
              </div>
            ))}

            {}
            {}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-container">

          {}
          <div className="footer-brand">
            <h2 className="footer-logo">WorkSphere</h2>
            <p>
              Smart task and expense management platform designed to boost
              productivity for students, professionals, and teams.
            </p>
          </div>

          {}
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
              <a href="#">Updates</a>
            </div>

            <div>
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>

            <div>
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>

        {}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} WorkSphere. All rights reserved.</p>
        </div>
      </footer>
    </section>
  )
}

export default Hero

