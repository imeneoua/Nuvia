import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const PLANNER_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [photo, setPhoto]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [stats, setStats]         = useState({ recipes: 0, saved: 0, planned: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  // Editable fields
  const [tagline, setTagline]               = useState("");
  const [favoriteCuisine, setFavoriteCuisine] = useState("");
  const [kitchenCity, setKitchenCity]       = useState("");
  const [bio, setBio]                       = useState("");
  const [instagram, setInstagram]           = useState("");
  const [statusSaved, setStatusSaved]       = useState(false);

  // ── Load from localStorage ────────────────────────────────────────
  useEffect(() => {
    const storedUser     = localStorage.getItem("user");
    const storedPhoto    = localStorage.getItem("profilePhoto");
    const storedTagline  = localStorage.getItem("profileTagline");
    const storedCuisine  = localStorage.getItem("profileCuisine");
    const storedCity     = localStorage.getItem("profileCity");
    const storedBio      = localStorage.getItem("profileBio");
    const storedInsta    = localStorage.getItem("profileInstagram");

    if (storedUser)    setUser(JSON.parse(storedUser));
    if (storedPhoto)   setPhoto(storedPhoto);
    if (storedTagline) setTagline(storedTagline);
    if (storedCuisine) setFavoriteCuisine(storedCuisine);
    if (storedCity)    setKitchenCity(storedCity);
    if (storedBio)     setBio(storedBio);
    if (storedInsta)   setInstagram(storedInsta);
  }, []);

  // ── Fetch stats ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    let isMounted = true;
    setStatsLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://localhost:5000/api/recipes",       { headers }),
      fetch("http://localhost:5000/api/saved-recipes", { headers }),
    ])
      .then(async ([recipesRes, savedRes]) => {
        const recipesData = recipesRes.ok ? await recipesRes.json() : [];
        const savedData   = savedRes.ok   ? await savedRes.json()   : [];
        if (isMounted) {
          setStats({
            recipes: Array.isArray(recipesData) ? recipesData.length : 0,
            saved:   Array.isArray(savedData)   ? savedData.length   : 0,
            planned: Array.isArray(recipesData) ? recipesData.filter(r => PLANNER_DAYS.includes(r.category)).length : 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setStatsLoading(false); });

    return () => { isMounted = false; };
  }, [user]);

  // ── Photo handlers ────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024)    { setError("Image must be under 5 MB."); return; }

    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => { setPhoto(reader.result); localStorage.setItem("profilePhoto", reader.result); setLoading(false); };
    reader.onerror  = () => { setLoading(false); setError("Upload failed. Try again."); };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => { setPhoto(null); localStorage.removeItem("profilePhoto"); };

  // ── Save / Logout ─────────────────────────────────────────────────
  const handleSave = () => {
    localStorage.setItem("profileTagline",  tagline);
    localStorage.setItem("profileCuisine",  favoriteCuisine);
    localStorage.setItem("profileCity",     kitchenCity);
    localStorage.setItem("profileBio",      bio);
    localStorage.setItem("profileInstagram", instagram);
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // ── Not logged in ─────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-ambient">
          <div className="prof-glow prof-glow-1"></div>
          <div className="prof-glow prof-glow-2"></div>
          <div className="prof-grain"></div>
        </div>
        <div className="profile-gate">
          <div className="gate-icon">🔐</div>
          <h2 className="gate-title">Welcome to Your Kitchen</h2>
          <p className="gate-text">Log in to access your personal culinary space.</p>
          <a href="/login" className="prof-btn-primary">
            Log In to Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </main>
    );
  }

  // ── Main profile ──────────────────────────────────────────────────
  return (
    <main className="profile-page">

      {/* Ambient */}
      <div className="profile-ambient">
        <div className="prof-glow prof-glow-1"></div>
        <div className="prof-glow prof-glow-2"></div>
        <div className="prof-grain"></div>
      </div>

      {/* ══════════════════════════════════
          DARK HERO BAND
      ══════════════════════════════════ */}
      <section className="profile-hero">

        {/* Avatar */}
        <div className="prof-avatar-wrap">
          <div className="prof-avatar">
            {photo
              ? <img src={photo} alt={user.name} />
              : <span className="prof-avatar-initial">{user.name.charAt(0).toUpperCase()}</span>
            }
            <div className="prof-avatar-ring"></div>
          </div>

          {/* Sparkles */}
          <span className="prof-sparkle ps-1">✦</span>
          <span className="prof-sparkle ps-2">✦</span>
          <span className="prof-sparkle ps-3">✦</span>

          {/* Photo controls */}
          <div className="prof-photo-controls">
            <label className="prof-photo-btn">
              {loading ? <span className="prof-loader"></span> : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  {photo ? "Change" : "Upload"}
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" hidden onChange={handlePhotoChange} disabled={loading} />
            </label>

            {photo && (
              <button className="prof-remove-btn" onClick={handleRemovePhoto}>Remove</button>
            )}
          </div>

          {error && <p className="prof-error">{error}</p>}
        </div>

        {/* Identity */}
        <div className="prof-identity">
          <div className="prof-name-row">
            <h1 className="prof-name">{user.name}</h1>
            <div className="prof-verified">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>

          <p className="prof-email">{user.email}</p>

          <div className="prof-tagline-row">
            <span className="prof-diamond">◆</span>
            <p className="prof-tagline">{tagline || "Crafting cozy moments, one recipe at a time."}</p>
            <span className="prof-diamond">◆</span>
          </div>

          {/* Stats */}
          <div className="prof-stats">
            <div className="prof-stat">
              <span className="prof-stat-num">{statsLoading ? "…" : stats.recipes}</span>
              <span className="prof-stat-label">Recipes</span>
            </div>
            <div className="prof-stat-divider"></div>
            <div className="prof-stat">
              <span className="prof-stat-num">{statsLoading ? "…" : stats.saved}</span>
              <span className="prof-stat-label">Saved</span>
            </div>
            <div className="prof-stat-divider"></div>
            <div className="prof-stat">
              <span className="prof-stat-num">{statsLoading ? "…" : stats.planned}</span>
              <span className="prof-stat-label">Planned</span>
            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════
          EDIT FORM
      ══════════════════════════════════ */}
      <section className="profile-form-section">
        <div className="profile-form-card">

          <div className="pfc-header">
            <div className="p-head-ornament"></div>
            <span className="p-head-label">YOUR PROFILE</span>
            <h2 className="pfc-title">Profile Details</h2>
            <p className="pfc-subtitle">Personalise your culinary identity</p>
          </div>

          <div className="pfc-body">

            {/* Row 1 */}
            <div className="pf-row">
              <div className="pf-field">
                <label className="pf-label">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => { setTagline(e.target.value); setStatusSaved(false); }}
                  placeholder="Your culinary motto"
                  maxLength={100}
                />
                <span className="pf-hint">{tagline.length}/100</span>
              </div>

              <div className="pf-field">
                <label className="pf-label">Kitchen City</label>
                <input
                  type="text"
                  value={kitchenCity}
                  onChange={e => { setKitchenCity(e.target.value); setStatusSaved(false); }}
                  placeholder="Paris, Tokyo, Algiers…"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="pf-row">
              <div className="pf-field">
                <label className="pf-label">Favourite Cuisine</label>
                <input
                  type="text"
                  value={favoriteCuisine}
                  onChange={e => { setFavoriteCuisine(e.target.value); setStatusSaved(false); }}
                  placeholder="Mediterranean, Italian…"
                  maxLength={50}
                />
              </div>

              <div className="pf-field">
                <label className="pf-label">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => { setInstagram(e.target.value); setStatusSaved(false); }}
                  placeholder="@yourusername"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="pf-field pf-field--full">
              <label className="pf-label">About Me</label>
              <textarea
                value={bio}
                onChange={e => { setBio(e.target.value); setStatusSaved(false); }}
                placeholder="Share your cooking journey and what inspires you…"
                maxLength={500}
                rows={4}
              />
              <span className="pf-hint">{bio.length}/500</span>
            </div>

            {/* Actions */}
            <div className="pf-actions">
              <button className="prof-btn-primary" onClick={handleSave}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Changes
              </button>

              <button className="prof-btn-logout" onClick={handleLogout}>
                Logout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>

              {statusSaved && (
                <div className="pf-saved">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Saved successfully!
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}