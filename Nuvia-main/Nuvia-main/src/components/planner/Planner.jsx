import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "./Planner.css";

const API      = "http://localhost:5000/api/recipes";
const SAVE_API = "http://localhost:5000/api/saved-recipes";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Planner() {
  const [searchParams]                      = useSearchParams();
  const [recipes, setRecipes]               = useState([]);
  const [selectedDay, setSelectedDay]       = useState("Monday");
  const [activeRecipe, setActiveRecipe]     = useState(null);
  const [savedIds, setSavedIds]             = useState([]);
  const [savedDocs, setSavedDocs]           = useState([]);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [ingredients, setIngredients]       = useState([]);
  const [newIngredient, setNewIngredient]   = useState("");
  const [form, setForm] = useState({
    title: "", description: "", image: "",
    ingredients: "", instructions: "",
    prepTime: "", cookTime: "", totalTime: "",
  });

  const plannerRef     = useRef(null);
  const ingredientsRef = useRef(null);
  const token          = localStorage.getItem("token");

  // ── Init ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRecipes();
    fetchSaved();
    loadIngredients();
  }, []);

  const fetchRecipes = async () => {
    const res  = await fetch(API);
    const data = await res.json();
    setRecipes(data);
    const recipeId = searchParams.get("recipe");
    if (recipeId) {
      const found = data.find((r) => r._id === recipeId);
      if (found) setActiveRecipe(found);
    }
  };

  const fetchSaved = async () => {
    if (!token) return;
    const res  = await fetch(SAVE_API, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSavedDocs(data);
    setSavedIds(data.map((r) => r.recipeId));
  };

  const loadIngredients = () => {
    const saved = localStorage.getItem("ingredients");
    if (saved) setIngredients(JSON.parse(saved));
  };

  const saveIngredients = (items) => {
    localStorage.setItem("ingredients", JSON.stringify(items));
  };

  // ── Form ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        category: selectedDay,
        ingredients: form.ingredients.split(",").map((i) => i.trim()),
      }),
    });
    fetchRecipes();
    setForm({ title: "", description: "", image: "", ingredients: "", instructions: "", prepTime: "", cookTime: "", totalTime: "" });
    setShowAddModal(false);
  };

  const handleDelete = async (recipeId) => {
    if (!token) { alert("Please login first"); return; }
    const res = await fetch(`${API}/${recipeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { setRecipes((prev) => prev.filter((r) => r._id !== recipeId)); setActiveRecipe(null); }
  };

  // ── Ingredients list ─────────────────────────────────────────────
  const addIngredient = () => {
    if (!newIngredient.trim()) return;
    const updated = [...ingredients, { name: newIngredient.trim(), checked: false, id: Date.now() }];
    setIngredients(updated);
    saveIngredients(updated);
    setNewIngredient("");
  };

  const toggleIngredient = (id) => {
    const updated = ingredients.map((item) => item.id === id ? { ...item, checked: !item.checked } : item);
    setIngredients(updated);
    saveIngredients(updated);
  };

  const removeIngredient = (id) => {
    const updated = ingredients.filter((item) => item.id !== id);
    setIngredients(updated);
    saveIngredients(updated);
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const getRecipeForDay  = (day) => recipes.find((r) => r.category === day);
  const getMealIcon      = (desc) => {
    if (!desc) return "🍽️";
    const d = desc.toLowerCase();
    if (d.includes("breakfast")) return "🌅";
    if (d.includes("lunch"))     return "☀️";
    if (d.includes("dinner"))    return "🌙";
    return "🍽️";
  };

  const scrollToPlanner     = () => plannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToIngredients = () => ingredientsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const selectedRecipe = getRecipeForDay(selectedDay);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="planner-page">

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="planner-hero">

        {/* Ambient */}
        <div className="planner-ambient">
          <div className="p-glow p-glow-1"></div>
          <div className="p-glow p-glow-2"></div>
          <div className="p-grain"></div>
        </div>

        <div className="planner-hero-inner">

          {/* Left: text */}
          <div className="planner-hero-text">

            <div className="p-eyebrow">
              <span className="eyebrow-dot"></span>
              Your Personal Kitchen Companion
            </div>

            <h1 className="planner-hero-title">
              Plan Your Week.<br />
              <span className="title-accent-span">Cook with Intention.</span>
            </h1>

            <p className="planner-hero-subtitle">
              A mindful approach to weekly meal planning. Curate your culinary
              journey, organise ingredients, and savour every moment in the kitchen.
            </p>

            <div className="planner-hero-actions">
              <button className="p-btn-primary" onClick={scrollToPlanner}>
                <span>Start Planning</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M8 13L12 9M8 13L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="p-btn-secondary" onClick={scrollToIngredients}>
                <span>Manage Ingredients</span>
              </button>
            </div>

            <div className="planner-stats">
              <div className="stat-item">
                <span className="stat-number">{recipes.length}</span>
                <span className="stat-label">Recipes Planned</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{ingredients.filter(i => i.checked).length}/{ingredients.length}</span>
                <span className="stat-label">Ingredients Ready</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{DAYS.filter(d => getRecipeForDay(d)).length}/7</span>
                <span className="stat-label">Days Complete</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          WEEKLY PLANNER
      ══════════════════════════════════ */}
      <section className="planner-week-section" ref={plannerRef}>

        <div className="p-section-header">
          <div className="p-head-ornament"></div>
          <span className="p-head-label">WEEKLY PLANNER</span>
          <h2 className="p-head-title">Weekly Planner</h2>
          <p className="p-head-subtitle">Select a day to view and manage your meal</p>
        </div>

        <div className="week-card">

          {/* Days strip */}
          <div className="days-strip">
            {DAYS.map((day) => {
              const hasRecipe = getRecipeForDay(day);
              return (
                <button
                  key={day}
                  className={`day-btn${selectedDay === day ? " active" : ""}${hasRecipe ? " has-recipe" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="day-short">{day.slice(0, 3)}</span>
                  <span className="day-full">{day}</span>
                  {hasRecipe && <span className="day-dot"></span>}
                </button>
              );
            })}
          </div>

          {/* Recipe display */}
          <div className="recipe-display">
            {selectedRecipe ? (
              <div className="recipe-content">

                <div className="recipe-img-wrap">
                  <img src={selectedRecipe.image} alt={selectedRecipe.title} className="recipe-img" />
                  <div className="recipe-meal-badge">{getMealIcon(selectedRecipe.description)}</div>
                </div>

                <div className="recipe-info">
                  <h3 className="recipe-name">{selectedRecipe.title}</h3>
                  <p className="recipe-desc">{selectedRecipe.description || "A delightful meal"}</p>

                  <div className="recipe-meta-row">
                    <div className="meta-pill"><span>⏱️</span><span>{selectedRecipe.prepTime || "15 min"}</span></div>
                    <div className="meta-pill"><span>🔥</span><span>{selectedRecipe.cookTime || "30 min"}</span></div>
                    <div className="meta-pill"><span>📊</span><span>{selectedRecipe.totalTime || "45 min"}</span></div>
                  </div>

                  <div className="recipe-details-grid">
                    <div className="detail-col">
                      <h4 className="detail-col-title">Ingredients</h4>
                      {Array.isArray(selectedRecipe.ingredients) && selectedRecipe.ingredients.length > 0 ? (
                        <ul className="detail-list">
                          {selectedRecipe.ingredients.map((item, idx) => (
                            <li key={idx}><span className="detail-dot"></span>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty-text">No ingredients listed</p>
                      )}
                    </div>

                    <div className="detail-col">
                      <h4 className="detail-col-title">Instructions</h4>
                      <p className="instructions-text">
                        {selectedRecipe.instructions || "No instructions provided yet"}
                      </p>
                    </div>
                  </div>

                  <div className="recipe-action-row">
                    <button className="p-btn-outline" onClick={() => handleDelete(selectedRecipe._id)}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 4.5H15M7.5 8.25V12.75M10.5 8.25V12.75M4.5 4.5L5.25 14.25C5.25 14.6478 5.40804 15.0294 5.68934 15.3107C5.97064 15.592 6.35218 15.75 6.75 15.75H11.25C11.6478 15.75 12.0294 15.592 12.3107 15.3107C12.592 15.0294 12.75 14.6478 12.75 14.25L13.5 4.5M6.75 4.5V3C6.75 2.80109 6.82902 2.61032 6.96967 2.46967C7.11032 2.32902 7.30109 2.25 7.5 2.25H10.5C10.6989 2.25 10.8897 2.32902 11.0303 2.46967C11.171 2.61032 11.25 2.80109 11.25 3V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Remove Recipe
                    </button>
                    <button className="p-btn-primary" onClick={() => setActiveRecipe(selectedRecipe)}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.75 9c-1.5 3-3.75 4.5-6.75 4.5S3.75 12 2.25 9c1.5-3 3.75-4.5 6.75-4.5S14.25 6 15.75 9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Full Details
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="empty-day">
                <div className="empty-day-icon">📝</div>
                <h3>No Recipe for {selectedDay}</h3>
                <p>Add a recipe to start planning your {selectedDay} meal</p>
                <button className="p-btn-primary" onClick={() => setShowAddModal(true)}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add Recipe
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Floating add button */}
        <button className="float-add-btn" onClick={() => setShowAddModal(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      </section>

      {/* ══════════════════════════════════
          INGREDIENTS PLANNER
      ══════════════════════════════════ */}
      <section className="ingredients-section" ref={ingredientsRef}>

        <div className="p-section-header">
          <div className="p-head-ornament"></div>
          <span className="p-head-label">SHOPPING LIST</span>
          <h2 className="p-head-title">Ingredients Planner</h2>
          <p className="p-head-subtitle">Keep track of what you need for the week</p>
        </div>

        <div className="ingredients-card">

          <div className="ingredients-input-row">
            <input
              type="text"
              className="ingredient-input"
              placeholder="Add an ingredient…"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addIngredient()}
            />
            <button className="ingredient-add-btn" onClick={addIngredient}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="ingredients-list-wrap">
            {ingredients.length === 0 ? (
              <div className="ingredients-empty">
                <span className="empty-day-icon">🥬</span>
                <p>No ingredients yet. Start adding items to your shopping list.</p>
              </div>
            ) : (
              <ul className="ingredients-checklist">
                {ingredients.map((item) => (
                  <li key={item.id} className={`checklist-item${item.checked ? " checked" : ""}`}>
                    <label className="checklist-label">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleIngredient(item.id)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="ingredient-name">{item.name}</span>
                    </label>
                    <button className="ingredient-remove-btn" onClick={() => removeIngredient(item.id)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {ingredients.length > 0 && (
            <div className="ingredients-footer">
              <span className="ingredients-count">{ingredients.filter(i => !i.checked).length} items remaining</span>
              <button className="ingredients-clear-btn" onClick={() => { setIngredients([]); saveIngredients([]); }}>
                Clear All
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════
          ADD RECIPE MODAL
      ══════════════════════════════════ */}
      {showAddModal && (
        <div className="p-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="p-modal" onClick={(e) => e.stopPropagation()}>

            <div className="p-modal-header">
              <h2>Add Recipe for <span className="modal-day-accent">{selectedDay}</span></h2>
              <button className="p-modal-close" onClick={() => setShowAddModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-modal-form">
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Recipe Name</label>
                  <input type="text" placeholder="e.g., Mediterranean Quinoa Bowl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-field full-width">
                  <label>Image URL</label>
                  <input type="url" placeholder="https://…" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
                </div>
                <div className="form-field full-width">
                  <label>Meal Type</label>
                  <input type="text" placeholder="Breakfast, Lunch, or Dinner" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Prep Time</label>
                  <input type="text" placeholder="15 min" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Cook Time</label>
                  <input type="text" placeholder="30 min" value={form.cookTime} onChange={(e) => setForm({ ...form, cookTime: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Total Time</label>
                  <input type="text" placeholder="45 min" value={form.totalTime} onChange={(e) => setForm({ ...form, totalTime: e.target.value })} />
                </div>
                <div className="form-field full-width">
                  <label>Ingredients</label>
                  <textarea placeholder="Separate with commas: Quinoa, Tomatoes, Cucumber…" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} rows={3} />
                </div>
                <div className="form-field full-width">
                  <label>Instructions</label>
                  <textarea placeholder="Describe the cooking steps…" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={5} />
                </div>
              </div>

              <div className="p-modal-actions">
                <button type="button" className="p-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="p-btn-primary">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add Recipe
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          RECIPE DETAIL MODAL
      ══════════════════════════════════ */}
      {activeRecipe && (
        <div className="p-modal-overlay" onClick={() => setActiveRecipe(null)}>
          <div className="p-modal p-modal--detail" onClick={(e) => e.stopPropagation()}>

            <button className="p-modal-close" onClick={() => setActiveRecipe(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="detail-img-wrap">
              <img src={activeRecipe.image} alt={activeRecipe.title} />
              <div className="detail-img-gradient"></div>
            </div>

            <div className="detail-body">
              <h2 className="detail-title">{activeRecipe.title}</h2>
              <p className="detail-desc">{activeRecipe.description || "A delicious recipe"}</p>

              <div className="detail-meta-row">
                <div className="detail-meta-pill"><span>⏱️</span><span>{activeRecipe.prepTime || "—"}</span></div>
                <div className="detail-meta-pill"><span>🔥</span><span>{activeRecipe.cookTime || "—"}</span></div>
                <div className="detail-meta-pill"><span>📊</span><span>{activeRecipe.totalTime || "—"}</span></div>
              </div>

              <div className="detail-sections-grid">
                <div className="detail-col">
                  <h3 className="detail-col-title">Ingredients</h3>
                  {Array.isArray(activeRecipe.ingredients) && activeRecipe.ingredients.length > 0 ? (
                    <ul className="detail-list">
                      {activeRecipe.ingredients.map((item, idx) => (
                        <li key={idx}><span className="detail-dot"></span>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-text">No ingredients listed</p>
                  )}
                </div>

                <div className="detail-col">
                  <h3 className="detail-col-title">Instructions</h3>
                  <p className="instructions-text">{activeRecipe.instructions || "No instructions provided"}</p>
                </div>
              </div>

              <div className="p-modal-actions">
                <button className="p-btn-outline" onClick={() => handleDelete(activeRecipe._id)}>Remove from Week</button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
