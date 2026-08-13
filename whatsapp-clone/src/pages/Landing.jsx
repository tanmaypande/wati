import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiMenu,
  FiX,
  FiMessageSquare,
  FiUsers,
  FiFileText,
  FiSend,
  FiBarChart2,
  FiShield,
  FiStar,
} from 'react-icons/fi';
import { useAuth } from '../context/useAuth';
import '../styles/Landing.css';

const featureCards = [
  {
    icon: <FiMessageSquare />, 
    title: 'WhatsApp Conversations',
    description: 'Manage customer conversations from one centralized interface.',
  },
  {
    icon: <FiUsers />,
    title: 'Contact Management',
    description: 'Organize customer contacts and keep your communication list ready.',
  },
  {
    icon: <FiFileText />,
    title: 'Message Templates',
    description: 'Create and reuse message templates for fast, consistent replies.',
  },
  {
    icon: <FiSend />,
    title: 'Broadcasts',
    description: 'Send campaigns to multiple contacts with a single workflow.',
  },
  {
    icon: <FiBarChart2 />,
    title: 'Analytics',
    description: 'Track communications and see what matters in one dashboard.',
  },
  {
    icon: <FiShield />,
    title: 'Secure Workspace',
    description: 'Protected access with login, verification and account control.',
  },
];

const steps = [
  {
    title: 'Connect / Sign Up',
    description: 'Create your workspace account and get started in seconds.',
  },
  {
    title: 'Manage Conversations',
    description: 'Handle contacts, chats, templates and broadcasts from one place.',
  },
  {
    title: 'Grow Customer Engagement',
    description: 'Use your communication tools and analytics to stay ahead.',
  },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className={`landing-navbar ${menuOpen ? 'open' : ''}`}>
        <div className="landing-navbar-brand">
          <span>WATI</span> Clone
        </div>

        <button
          type="button"
          className="landing-navbar-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <nav className="landing-navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="landing-navbar-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button
                type="button"
                className="landing-navbar-cta"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="landing-navbar-link" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <button
                type="button"
                className="landing-navbar-cta"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/register');
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="landing-content">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">Customer conversation management for modern teams</span>
            <h1>Build better customer conversations with WATI Clone.</h1>
            <p>
              Manage WhatsApp chats, contacts, templates, broadcasts, and analytics from one clean workspace.
              Keep every customer interaction organized and moving forward.
            </p>

            <div className="landing-hero-actions">
              {user ? (
                <button type="button" className="landing-hero-button landing-hero-button--primary" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard <FiArrowRight />
                </button>
              ) : (
                <>
                  <button type="button" className="landing-hero-button landing-hero-button--primary" onClick={() => navigate('/register')}>
                    Get Started Free <FiArrowRight />
                  </button>
                  <button type="button" className="landing-hero-button landing-hero-button--secondary" onClick={() => navigate('/login')}>
                    Log In
                  </button>
                </>
              )}
            </div>

            <div className="landing-hero-trust">
              <span>Includes WhatsApp conversations, contact management, templates and broadcasts.</span>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="hero-card hero-card--top">
              <div className="hero-card-tag">Live Overview</div>
              <div className="hero-card-title">Dashboard summary</div>
              <div className="hero-card-grid">
                <div>
                  <strong>2.4k</strong>
                  <span>Contacts</span>
                </div>
                <div>
                  <strong>312</strong>
                  <span>Active chats</span>
                </div>
                <div>
                  <strong>18%</strong>
                  <span>Response rate</span>
                </div>
              </div>
            </div>

            <div className="hero-card hero-card--main">
              <div className="hero-card-header">
                <div>
                  <h3>Recent conversations</h3>
                  <p>Quick access to your latest WhatsApp threads.</p>
                </div>
                <span>Live</span>
              </div>
              <div className="hero-card-list">
                <div>Maria • Order update</div>
                <div>Harris • New contact request</div>
                <div>Oliver • Broadcast follow-up</div>
              </div>
            </div>

            <div className="hero-card hero-card--bottom">
              <div>
                <span className="badge">Templates</span>
                <p>Welcome message</p>
              </div>
              <div>
                <span className="badge badge--accent">Broadcast</span>
                <p>Campaign scheduled</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-preview-section">
          <div className="section-header">
            <span className="section-label">Product Preview</span>
            <h2>See the workspace your teams will actually use.</h2>
            <p>Everything is designed around WhatsApp communication, with fast access to chats, contacts, templates, broadcasts and analytics.</p>
          </div>

          <div className="preview-cards">
            <div className="preview-panel preview-panel--stats">
              <div className="preview-panel-title">Workspace overview</div>
              <div className="preview-stat-grid">
                <div>
                  <strong>1.9k</strong>
                  <span>Contacts</span>
                </div>
                <div>
                  <strong>224</strong>
                  <span>Chats</span>
                </div>
                <div>
                  <strong>78</strong>
                  <span>Broadcasts</span>
                </div>
              </div>
            </div>

            <div className="preview-panel preview-panel--chat">
              <div className="preview-panel-title">Recent chats</div>
              <ul>
                <li>Emma • New order query</li>
                <li>Leo • Template approval</li>
                <li>Sophia • Broadcast follow-up</li>
              </ul>
            </div>

            <div className="preview-panel preview-panel--status">
              <div className="preview-panel-title">WhatsApp status</div>
              <div className="status-pill">Connected</div>
              <div className="status-list">
                <span>Messages Today</span>
                <strong>154</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-features-section">
          <div className="section-header">
            <span className="section-label">Core features</span>
            <h2>Everything you need to manage customer conversations.</h2>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section landing-steps-section">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2>Get started in three simple steps.</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={step.title} className="step-card">
                <div className="step-index">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section landing-value-section">
          <div className="section-header">
            <span className="section-label">Why WATI Clone</span>
            <h2>Centralized communication with the tools your team already needs.</h2>
          </div>

          <div className="value-grid">
            <div className="value-card">
              <FiStar className="value-icon" />
              <h3>Centralized communication</h3>
              <p>Keep chats, contacts, templates and broadcasts organized in one modern dashboard.</p>
            </div>
            <div className="value-card">
              <FiUsers className="value-icon" />
              <h3>Faster customer responses</h3>
              <p>Quickly access active chats and reply to customers right from your workspace.</p>
            </div>
            <div className="value-card">
              <FiFileText className="value-icon" />
              <h3>Reusable message templates</h3>
              <p>Create message templates that keep responses consistent and efficient.</p>
            </div>
            <div className="value-card">
              <FiBarChart2 className="value-icon" />
              <h3>Actionable analytics</h3>
              <p>Monitor communications and performance metrics with clean dashboard insights.</p>
            </div>
          </div>
        </section>

        <section className="landing-section landing-cta-section">
          <div className="cta-panel">
            <div>
              <span className="section-label">Ready to start</span>
              <h2>Ready to build better customer conversations?</h2>
              <p>Create your workspace and start managing your customer communication from one place.</p>
            </div>

            <div className="cta-actions">
              <button type="button" className="landing-hero-button landing-hero-button--primary" onClick={() => navigate('/register')}>
                Get Started Free <FiArrowRight />
              </button>
              <button type="button" className="landing-hero-button landing-hero-button--secondary" onClick={() => navigate('/login')}>
                Log In
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <h2>WATI <span>Clone</span></h2>
            <p>Centralized WhatsApp communication for modern teams.</p>
          </div>

          <div>
            <h4>Product</h4>
            <Link to="/dashboard" className="footer-link">Dashboard</Link>
            <Link to="/chats" className="footer-link">Chats</Link>
            <Link to="/contacts" className="footer-link">Contacts</Link>
            <Link to="/broadcast" className="footer-link">Broadcast</Link>
            <Link to="/templates" className="footer-link">Templates</Link>
            <Link to="/analytics" className="footer-link">Analytics</Link>
          </div>

          <div>
            <h4>Company</h4>
            <span className="footer-link footer-link--disabled">About</span>
            <span className="footer-link footer-link--disabled">Support</span>
            <span className="footer-link footer-link--disabled">Contact</span>
          </div>

          <div>
            <h4>Resources</h4>
            <span className="footer-link footer-link--disabled">Documentation</span>
            <span className="footer-link footer-link--disabled">Help Center</span>
            <span className="footer-link footer-link--disabled">FAQ</span>
          </div>

          <div>
            <h4>Legal</h4>
            <span className="footer-link footer-link--disabled">Privacy Policy</span>
            <span className="footer-link footer-link--disabled">Terms of Service</span>
          </div>
        </div>

        <div className="landing-footer-bottom">
          © 2026 WATI Clone. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
