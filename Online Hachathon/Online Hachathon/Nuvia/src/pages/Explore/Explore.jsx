import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Explore.css";

const API = "http://localhost:5000/api/saved-recipes";

export default function Explore() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Please log in to explore your saved recipes.");
      setLoading(false);
      return;
    }

    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setSavedRecipes(data); setLoading(false); })
      .catch(() => { setError("Failed to load recipes. Please try again."); setLoading(false); });
  }, [token]);

  const filtered = savedRecipes.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="explore-page">

      {/* Ambient */}
      <div className="explore-ambient">
        <div className="ex-glow ex-glow-1"></div>
        <div className="ex-glow ex-glow-2"></div>
        <div className="ex-grain"></div>
      </div>

      {/* ══════════════════════════════════
          DARK HERO BAND
      ══════════════════════════════════ */}
      <section className="explore-hero">

        <div className="explore-hero-inner">
          <span className="explore-eyebrow">
            <span className="eyebrow-diamond">◆</span>
            Your Collection
            <span className="eyebrow-diamond">◆</span>
          </span>

          <h1 className="explore-title">Explore Recipes</h1>

          <p className="explore-subtitle">
            Discover and revisit every recipe you've saved to your collection.
          </p>

          {/* Search bar */}
          <div className="explore-search">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your saved recipes…"
              aria-label="Search recipes"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>

        {/* Sparkles */}
        <div className="explore-sparkles">
          <span className="ex-sparkle ex-sp-1">✦</span>
          <span className="ex-sparkle ex-sp-2">✦</span>
          <span className="ex-sparkle ex-sp-3">✦</span>
        </div>

      </section>

      {/* ══════════════════════════════════
          RECIPE GRID
      ══════════════════════════════════ */}
      <section className="explore-grid-section">

        {/* State: loading */}
        {loading && (
          <div className="explore-state">
            <div className="explore-spinner"></div>
            <p>Loading your collection…</p>
          </div>
        )}

        {/* State: error */}
        {!loading && error && (
          <div className="explore-state">
            <span className="explore-state-icon">⚠️</span>
            <p className="explore-error-text">{error}</p>
            <Link to="/login" className="ex-btn-primary">Log In</Link>
          </div>
        )}

        {/* State: no results */}
        {!loading && !error && filtered.length === 0 && (
          <div className="explore-state">
            <span className="explore-state-icon">{search ? "🔍" : "🍽️"}</span>
            <p>{search ? `No recipes matching "${search}"` : "No saved recipes yet. Start saving from the home page!"}</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="explore-count">
              <span>{filtered.length}</span> recipe{filtered.length !== 1 ? "s" : ""} in your collection
            </p>

            <div className="explore-grid">
              {filtered.map((recipe) => (
                <div key={recipe._id} className="ex-card">
                  <div className="ex-card-img">
                    <img src={recipe.image} alt={recipe.title} />
                    <div className="ex-card-gradient"></div>
                  </div>

                  <div className="ex-card-body">
                    {recipe.mood && (
                      <div className="ex-mood">{recipe.mood}</div>
                    )}
                    <h3 className="ex-card-title">{recipe.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </section>

    </div>
  );
}
