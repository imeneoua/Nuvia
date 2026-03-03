import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home",    to: "/",        hash: null },
    { label: "Recipes", to: null,       hash: "#recipes" },
    { label: "Explore", to: "/explore", hash: null },
    { label: "Profile", to: "/profile", hash: null },
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>

      {/* ── Logo ── */}
      <Link to="/" className="logo-link">
        <h1 className="logo">
          <span className="logo-n">N</span>uvia
        </h1>
        <span className="logo-tagline">Culinary Experiences</span>
      </Link>

      {/* ── Nav Links ── */}
      <div className="links">
        {navLinks.map(({ label, to, hash }) => {
          const isActive = to ? location.pathname === to : false;

          if (hash) {
            return (
              <a key={label} href={hash} className={`nav-link ${isActive ? "active" : ""}`}>
                <span className="link-text">{label}</span>
                <span className="link-underline"></span>
              </a>
            );
          }

          return (
            <Link
              key={label}
              to={to}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <span className="link-text">{label}</span>
              <span className="link-underline"></span>
            </Link>
          );
        })}
      </div>

      {/* ── CTA Button ── */}
      <Link to="/planner" className="nav-cta">
        <span>Planner</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M1 8h14M9 2l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

    </nav>
  );
}
