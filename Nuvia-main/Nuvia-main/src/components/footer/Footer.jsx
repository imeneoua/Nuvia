import { useState } from "react";
import "./Footer.css";

export default function Footer() {
  const [comment, setComment] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleComment = () => {
    if (!comment.trim()) return;

    setSubscribed(true);
    setComment("");
  };

  return (
    <footer className="footer">
      {/* Ambient background */}
      <div className="footer-ambient">
        <div className="ambient-glow ambient-glow-1"></div>
        <div className="ambient-glow ambient-glow-2"></div>
        <div className="ambient-grain"></div>
      </div>

      <div className="footer-container">
        <div className="footer-inner">
          {/* Brand + Newsletter Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <h2>
                <span className="logo-n">N</span>uvia
              </h2>
              <div className="brand-decorator">
                <span className="decorator-line"></span>
                <span className="decorator-diamond">◆</span>
                <span className="decorator-line"></span>
              </div>
            </div>

            <p className="brand-description">
              Elevate your everyday cooking with curated recipes and
              personalized culinary inspiration.
            </p>

            <div className="newsletter-form">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="newsletter-button" onClick={handleComment}>
                Send
              </button>
            </div>

            {subscribed ? (
              <p className="newsletter-note newsletter-success">
                Thank you! Your comment has been received.
              </p>
            ) : (
              <p className="newsletter-note">
                Join our newsletter for seasonal recipes, cooking tips, and
                product updates.
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="footer-links-group">
            <div className="footer-section">
              <h4 className="section-title">
                <span className="title-accent">✦</span>
                Explore
              </h4>
              <nav className="footer-nav">
                <a href="#recipes" className="footer-link">
                  <span className="link-text">Recipes</span>
                  <span className="link-arrow">→</span>
                </a>
                <a href="#drinks" className="footer-link">
                  <span className="link-text">Drinks</span>
                  <span className="link-arrow">→</span>
                </a>
                <a href="/explore" className="footer-link">
                  <span className="link-text">Collections</span>
                  <span className="link-arrow">→</span>
                </a>
                <a href="/planner" className="footer-link">
                  <span className="link-text">Meal Planner</span>
                  <span className="link-arrow">→</span>
                </a>
              </nav>
            </div>

            <div className="footer-section">
              <h4 className="section-title">
                <span className="title-accent">✦</span>
                Follow Us
              </h4>
              <nav className="footer-nav">
                <a href="#" className="footer-link social-link">
                  <span className="social-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </span>
                  <span className="link-text">Instagram</span>
                </a>
                <a href="#" className="footer-link social-link">
                  <span className="social-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </span>
                  <span className="link-text">Facebook</span>
                </a>
                <a href="#" className="footer-link social-link">
                  <span className="social-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                    </svg>
                  </span>
                  <span className="link-text">YouTube</span>
                </a>
                <a href="#" className="footer-link social-link">
                  <span className="social-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </span>
                  <span className="link-text">LinkedIn</span>
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              <span className="copyright-icon">©</span>
              <span>2026 Nuvia</span>
            </p>
            <nav className="footer-legal">
              <a href="/privacy" className="legal-link">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="/terms" className="legal-link">Terms of Service</a>
              <span className="separator">•</span>
              <a href="/contact" className="legal-link">Contact</a>
            </nav>
          </div>
        </div>
      </div>

      {/* Decorative sparkles */}
      <div className="footer-sparkles">
        <span className="sparkle sparkle-1">✦</span>
        <span className="sparkle sparkle-2">✦</span>
        <span className="sparkle sparkle-3">✦</span>
      </div>
    </footer>
  );
}