import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

const PLANNER_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LEGACY_PROFILE_KEYS = [
  "profilePhoto",
  "profileTagline",
  "profileCuisine",
  "profileCity",
  "profileBio",
  "profileInstagram",
];
const EMPTY_PROFILE = {
  photo: null,
  tagline: "",
  favoriteCuisine: "",
  kitchenCity: "",
  bio: "",
  instagram: "",
};

function getProfileStorageKey(user) {
  const identifier = user?._id || user?.id || user?.email;
  return identifier ? `profile:${identifier}` : null;
}

function readStoredProfile(user) {
  const storageKey = getProfileStorageKey(user);
  if (!storageKey) return { ...EMPTY_PROFILE };

  try {
    const storedProfile = localStorage.getItem(storageKey);
    if (!storedProfile) return { ...EMPTY_PROFILE };
    return { ...EMPTY_PROFILE, ...JSON.parse(storedProfile) };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ recipes: 0, saved: 0, planned: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [tagline, setTagline] = useState("");
  const [favoriteCuisine, setFavoriteCuisine] = useState("");
  const [kitchenCity, setKitchenCity] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [statusSaved, setStatusSaved] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    LEGACY_PROFILE_KEYS.forEach((key) => localStorage.removeItem(key));

    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setPhoto(EMPTY_PROFILE.photo);
      setTagline(EMPTY_PROFILE.tagline);
      setFavoriteCuisine(EMPTY_PROFILE.favoriteCuisine);
      setKitchenCity(EMPTY_PROFILE.kitchenCity);
      setBio(EMPTY_PROFILE.bio);
      setInstagram(EMPTY_PROFILE.instagram);
      setStatusSaved(false);
      return;
    }

    const storedProfile = readStoredProfile(user);
    setPhoto(storedProfile.photo);
    setTagline(storedProfile.tagline);
    setFavoriteCuisine(storedProfile.favoriteCuisine);
    setKitchenCity(storedProfile.kitchenCity);
    setBio(storedProfile.bio);
    setInstagram(storedProfile.instagram);
    setStatusSaved(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    let isMounted = true;
    setStatsLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://localhost:5000/api/recipes", { headers }),
      fetch("http://localhost:5000/api/saved-recipes", { headers }),
    ])
      .then(async ([recipesRes, savedRes]) => {
        const recipesData = recipesRes.ok ? await recipesRes.json() : [];
        const savedData = savedRes.ok ? await savedRes.json() : [];

        if (!isMounted) return;

        setStats({
          recipes: Array.isArray(recipesData) ? recipesData.length : 0,
          saved: Array.isArray(savedData) ? savedData.length : 0,
          planned: Array.isArray(recipesData)
            ? recipesData.filter((recipe) => PLANNER_DAYS.includes(recipe.category)).length
            : 0,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setStatsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const saveProfileToStorage = (overrides = {}) => {
    const storageKey = getProfileStorageKey(user);
    if (!storageKey) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        photo,
        tagline,
        favoriteCuisine,
        kitchenCity,
        bio,
        instagram,
        ...overrides,
      })
    );
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const nextPhoto = reader.result;
      setPhoto(nextPhoto);
      saveProfileToStorage({ photo: nextPhoto });
      setLoading(false);
    };
    reader.onerror = () => {
      setLoading(false);
      setError("Upload failed. Try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    saveProfileToStorage({ photo: null });
  };

  const handleSave = () => {
    saveProfileToStorage();
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-ambient">
          <div className="prof-glow prof-glow-1"></div>
          <div className="prof-glow prof-glow-2"></div>
          <div className="prof-grain"></div>
        </div>

        <div className="profile-gate">
          <div className="gate-icon">{"\uD83D\uDD10"}</div>
          <h2 className="gate-title">Welcome to Your Kitchen</h2>
          <p className="gate-text">Log in to access your personal culinary space.</p>
          <Link to="/login" className="prof-btn-primary">
            Log In to Continue
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
        </div>
      </main>
    );
  }

  const displayName = user.name || user.email || "Chef";
  const profileInitial = displayName.charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      <div className="profile-ambient">
        <div className="prof-glow prof-glow-1"></div>
        <div className="prof-glow prof-glow-2"></div>
        <div className="prof-grain"></div>
      </div>

      <section className="profile-hero">
        <div className="prof-avatar-wrap">
          <div className="prof-avatar">
            {photo ? (
              <img src={photo} alt={displayName} />
            ) : (
              <span className="prof-avatar-initial">{profileInitial}</span>
            )}
            <div className="prof-avatar-ring"></div>
          </div>

          <span className="prof-sparkle ps-1">{"\u2726"}</span>
          <span className="prof-sparkle ps-2">{"\u2726"}</span>
          <span className="prof-sparkle ps-3">{"\u2726"}</span>

          <div className="prof-photo-controls">
            <label className="prof-photo-btn">
              {loading ? (
                <span className="prof-loader"></span>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  {photo ? "Change" : "Upload"}
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                hidden
                onChange={handlePhotoChange}
                disabled={loading}
              />
            </label>

            {photo && (
              <button type="button" className="prof-remove-btn" onClick={handleRemovePhoto}>
                Remove
              </button>
            )}
          </div>

          {error && <p className="prof-error">{error}</p>}
        </div>

        <div className="prof-identity">
          <div className="prof-name-row">
            <h1 className="prof-name">{displayName}</h1>
            <div className="prof-verified">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>

          <p className="prof-email">{user.email}</p>

          <div className="prof-tagline-row">
            <span className="prof-diamond">{"\u25C6"}</span>
            <p className="prof-tagline">{tagline || "Add your own tagline below."}</p>
            <span className="prof-diamond">{"\u25C6"}</span>
          </div>

          <div className="prof-stats">
            <div className="prof-stat">
              <span className="prof-stat-num">{statsLoading ? "..." : stats.recipes}</span>
              <span className="prof-stat-label">Recipes</span>
            </div>
            <div className="prof-stat-divider"></div>
            <div className="prof-stat">
              <span className="prof-stat-num">{statsLoading ? "..." : stats.saved}</span>
              <span className="prof-stat-label">Saved</span>
            </div>
            <div className="prof-stat-divider"></div>
            <div className="prof-stat">
              <span className="prof-stat-num">{statsLoading ? "..." : stats.planned}</span>
              <span className="prof-stat-label">Planned</span>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-form-section">
        <div className="profile-form-card">
          <div className="pfc-header">
            <div className="p-head-ornament"></div>
            <span className="p-head-label">YOUR PROFILE</span>
            <h2 className="pfc-title">Profile Details</h2>
            <p className="pfc-subtitle">Personalise your culinary identity</p>
          </div>

          <div className="pfc-body">
            <div className="pf-row">
              <div className="pf-field">
                <label className="pf-label">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(event) => {
                    setTagline(event.target.value);
                    setStatusSaved(false);
                  }}
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
                  onChange={(event) => {
                    setKitchenCity(event.target.value);
                    setStatusSaved(false);
                  }}
                  placeholder="Paris, Tokyo, Algiers..."
                  maxLength={50}
                />
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-field">
                <label className="pf-label">Favourite Cuisine</label>
                <input
                  type="text"
                  value={favoriteCuisine}
                  onChange={(event) => {
                    setFavoriteCuisine(event.target.value);
                    setStatusSaved(false);
                  }}
                  placeholder="Mediterranean, Italian..."
                  maxLength={50}
                />
              </div>

              <div className="pf-field">
                <label className="pf-label">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(event) => {
                    setInstagram(event.target.value);
                    setStatusSaved(false);
                  }}
                  placeholder="@yourusername"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="pf-field pf-field--full">
              <label className="pf-label">About Me</label>
              <textarea
                value={bio}
                onChange={(event) => {
                  setBio(event.target.value);
                  setStatusSaved(false);
                }}
                placeholder="Share your cooking journey and what inspires you..."
                maxLength={500}
                rows={4}
              />
              <span className="pf-hint">{bio.length}/500</span>
            </div>

            <div className="pf-actions">
              <button type="button" className="prof-btn-primary" onClick={handleSave}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Changes
              </button>

              <button type="button" className="prof-btn-logout" onClick={handleLogout}>
                Logout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>

              {statusSaved && (
                <div className="pf-saved">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
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
