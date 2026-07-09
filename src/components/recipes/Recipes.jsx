﻿import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Recipes.css";

const API = "http://localhost:5000/api/saved-recipes";

export default function Recipes() {
  const [saved, setSaved]                   = useState([]);
  const [activeIndex, setActiveIndex]       = useState(0);
  const [isPaused, setIsPaused]             = useState(false);
  const [drinkActiveIndex, setDrinkActiveIndex] = useState(0);
  const [drinkPaused, setDrinkPaused]       = useState(false);
  const [savedDrinks, setSavedDrinks]       = useState([]);
  const [isFlipped, setIsFlipped]           = useState(null);
  const [drinkFlipped, setDrinkFlipped]     = useState(null);

  const token = localStorage.getItem("token");

  // ── Data ──────────────────────────────────────────────────────────
  const recipes = [
    { _id: "1", title: "Golden Banana Bread",   mood: "Soft & comforting",    img: "/Pics/Banana Loaf with Walnuts.jpg",                                          ingredients: ["Ripe bananas","Flour","Butter","Brown sugar","Walnuts"],      steps: ["Mash bananas","Mix wet + dry","Fold in walnuts","Bake until golden"] },
    { _id: "2", title: "Silk Tiramisu",          mood: "Slow & indulgent",     img: "/Pics/Tiramisú Clásico .jpg",                                                 ingredients: ["Mascarpone","Espresso","Ladyfingers","Cocoa","Eggs"],         steps: ["Whisk cream","Dip ladyfingers","Layer & chill","Dust cocoa"] },
    { _id: "3", title: "Butter Croissant",       mood: "Warm morning ritual",  img: "/Pics/Best Bread In France In 2025.jpg",                                      ingredients: ["Flour","Butter","Milk","Yeast","Sugar"],                      steps: ["Make dough","Laminate with butter","Shape crescents","Bake"] },
    { _id: "4", title: "Chourba Frik",           mood: "Deep & nostalgic",     img: "/Pics/chourba frik  copy.jpg",                                                ingredients: ["Frik","Tomato","Onion","Lamb","Spices"],                      steps: ["Sauté aromatics","Add broth","Simmer frik","Finish herbs"] },
    { _id: "5", title: "Mushroom Risotto",       mood: "Earthy & calm",        img: "/Pics/Velouté de Champignons Onctueux.jpg",                                   ingredients: ["Arborio rice","Mushrooms","Stock","Parmesan","Butter"],       steps: ["Toast rice","Add stock gradually","Stir in mushrooms","Finish cheese"] },
    { _id: "6", title: "Apple Crumble",          mood: "Golden & familiar",    img: "/Mini Apple Crumbles with Cinnamon _ Elegant Fall Dessert.jpg",               ingredients: ["Apples","Cinnamon","Flour","Butter","Sugar"],                  steps: ["Slice apples","Mix crumble","Top apples","Bake"] },
    { _id: "7", title: "Honey Roasted Carrots",  mood: "Gentle & warm",        img: "/Roasted Honey Glazed Carrots Recipe - MushroomSalus.jpg",                    ingredients: ["Carrots","Honey","Olive oil","Thyme","Salt"],                  steps: ["Coat carrots","Roast","Glaze with honey","Finish herbs"] },
    { _id: "8", title: "Evening Soup",           mood: "Quiet & grounding",    img: "/Grain-free coconut flour muffins perfect for winter mornings.jpg",           ingredients: ["Onion","Garlic","Vegetable stock","Cream","Herbs"],            steps: ["Sauté base","Simmer stock","Blend smooth","Finish cream"] },
    { _id: "9", title: "Dark Chocolate Cake",    mood: "Deep indulgence",      img: "/Pics/Blackout Cake.jpg",                                                     ingredients: ["Cocoa","Flour","Eggs","Sugar","Butter"],                       steps: ["Mix batter","Bake layers","Cool","Frost generously"] },
  ];

  const drinks = [
    { _id: "d1", title: "Citrus Spark",    mood: "Bright & refreshing", img: "/Tangerine Light Mocktail _ Jeju Tangerine, Barley Tea & Yuzu.jpg",                               ingredients: ["Orange","Lemon","Sparkling water","Mint","Ice"],          steps: ["Slice citrus","Muddle mint","Add ice","Top with sparkle"] },
    { _id: "d2", title: "Velvet Mocha",    mood: "Deep & cozy",         img: "/télécharger (24).jpg",                                                                            ingredients: ["Espresso","Cocoa","Milk","Vanilla","Sugar"],               steps: ["Brew espresso","Whisk cocoa","Steam milk","Combine & pour"] },
    { _id: "d3", title: "Garden Tonic",    mood: "Herbal & crisp",      img: "/Moxito.jpg",                                                                                       ingredients: ["Cucumber","Lime","Tonic","Basil","Ice"],                   steps: ["Slice cucumber","Squeeze lime","Add ice","Top with tonic"] },
    { _id: "d4", title: "Spiced Chai",     mood: "Warm & calming",      img: "/Cozy Masala Chai Latte.jpg",                                                                       ingredients: ["Black tea","Milk","Cinnamon","Cardamom","Honey"],           steps: ["Simmer spices","Brew tea","Add milk","Sweeten & serve"] },
    { _id: "d5", title: "Berry Cloud",     mood: "Soft & sweet",        img: "/Blue Matcha Latte_ Caffeine-Free Beauty You Can Sip.jpg",                                          ingredients: ["Berries","Yogurt","Milk","Honey","Ice"],                    steps: ["Blend berries","Add yogurt","Add milk","Blend smooth"] },
    { _id: "d6", title: "Matcha Bloom",    mood: "Clean & earthy",      img: "/Matcha-Infused Cold Brew with Black Sesame Foam.jpg",                                              ingredients: ["Matcha","Hot water","Oat milk","Honey"],                    steps: ["Whisk matcha","Warm milk","Combine","Sweeten"] },
    { _id: "d7", title: "Rose Lemonade",   mood: "Floral & light",      img: "/télécharger (25).jpg",                                                                            ingredients: ["Lemon","Rose water","Water","Sugar","Ice"],                 steps: ["Juice lemons","Add sugar","Mix water","Add rose"] },
    { _id: "d8", title: "Cold Brew Noir",  mood: "Bold & smooth",       img: "/Nitro CaffÃ¨ White_ Creamy Cold Brew Coffee with Whipped Cream  Chocolate Syrup.jpg",             ingredients: ["Coffee grounds","Water","Ice","Cream"],                     steps: ["Steep overnight","Strain","Add ice","Finish with cream"] },
    { _id: "d9", title: "Golden Latte",    mood: "Glow & comfort",      img: "/How to Make Golden Milk Turmeric Tea - Masala Haldi Doodh.jpg",                                   ingredients: ["Turmeric","Milk","Ginger","Honey","Cinnamon"],               steps: ["Warm milk","Whisk spices","Sweeten","Serve warm"] },
  ];

  // ── Helpers ───────────────────────────────────────────────────────
  const total      = recipes.length;
  const drinkTotal = drinks.length;

  const wrapIndex = (index, length) => (index + length) % length;

  const getOffset = (index, currentIndex, length) => {
    let diff = index - currentIndex;
    if (diff >  length / 2) diff -= length;
    if (diff < -length / 2) diff += length;
    return diff;
  };

  // ── Fetch saved recipes ───────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setSaved(data.map((r) => r.recipeId)))
      .catch(console.error);
  }, [token]);

  // ── Auto-rotate carousels ─────────────────────────────────────────
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setActiveIndex((i) => wrapIndex(i + 1, total)), 5000);
    return () => clearInterval(id);
  }, [isPaused, total]);

  useEffect(() => {
    if (drinkPaused) return;
    const id = setInterval(() => setDrinkActiveIndex((i) => wrapIndex(i + 1, drinkTotal)), 5000);
    return () => clearInterval(id);
  }, [drinkPaused, drinkTotal]);

  // ── Save / unsave ─────────────────────────────────────────────────
  const toggleSave = async (recipe) => {
    if (!token) { alert("Please login first"); return; }

    if (saved.includes(recipe._id)) {
      const res  = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const found = data.find((r) => r.recipeId === recipe._id);
      if (found) {
        await fetch(`${API}/${found._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSaved((prev) => prev.filter((id) => id !== recipe._id));
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipeId: recipe._id, title: recipe.title, image: recipe.img }),
      });
      setSaved((prev) => [...prev, recipe._id]);
    }
  };

  const toggleDrinkSave = (drinkId) => {
    setSavedDrinks((prev) =>
      prev.includes(drinkId) ? prev.filter((id) => id !== drinkId) : [...prev, drinkId]
    );
  };

  // ── Card click (navigate + flip) ──────────────────────────────────
  const handleCardClick = (index, recipeId) => {
    if (isFlipped === recipeId) { setIsFlipped(null); return; }
    setActiveIndex(index);
    setTimeout(() => setIsFlipped(recipeId), 300);
  };

  const handleDrinkCardClick = (index, drinkId) => {
    if (drinkFlipped === drinkId) { setDrinkFlipped(null); return; }
    setDrinkActiveIndex(index);
    setTimeout(() => setDrinkFlipped(drinkId), 300);
  };

  // ── Shared card renderer ──────────────────────────────────────────
  const renderCard = ({ item, index, currentIndex, totalCount, flippedId, setFlipped, savedList, onSave, onCardClick, onEnter, onLeave }) => {
    const offset      = getOffset(index, currentIndex, totalCount);
    const isActive    = offset === 0;
    const isCardFlipped = flippedId === item._id;
    const isSaved     = savedList.includes(item._id);

    return (
      <div
        key={item._id}
        className={`habit-card${isCardFlipped ? " is-flipped" : ""}${isActive ? " is-active" : ""}`}
        style={{ "--offset": offset, "--abs": Math.abs(offset) }}
        onClick={() => onCardClick(index, item._id)}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="card-inner">

          {/* ── Front ── */}
          <div className="habit-front">
            <div className="card-shimmer"></div>
            <img src={item.img} alt={item.title} />

            <div className="habit-overlay">
              <div className="card-gradient"></div>

              <div className="habit-text">
                <div className="mood-badge">{item.mood}</div>
                <h3>{item.title}</h3>
                <div className="card-divider"></div>
              </div>
            </div>
          </div>

          {/* ── Back ── */}
          <div className="habit-back">
            <div className="habit-back-content">

              <div className="back-header">
                <h3>{item.title}</h3>
                <button
                  className="flip-back-btn"
                  onClick={(e) => { e.stopPropagation(); setFlipped(null); }}
                >
                  ✕
                </button>
              </div>

              <div className="recipe-section">
                <h4>Ingredients</h4>
                <ul className="ingredients-list">
                  {item.ingredients.map((ing) => (
                    <li key={ing}>
                      <span className="ingredient-dot"></span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recipe-section">
                <h4>Method</h4>
                <ol className="steps-list">
                  {item.steps.map((step, i) => (
                    <li key={step}>
                      <span className="step-number">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <button
                className={`habit-save habit-save-back${isSaved ? " saved" : ""}`}
                onClick={(e) => { e.stopPropagation(); onSave(item); }}
              >
                <span className="save-icon">{isSaved ? "♥" : "♡"}</span>
                <span className="save-text">{isSaved ? "Saved to Collection" : "Save Recipe"}</span>
              </button>

            </div>
          </div>

        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <section className="recipes-section" id="recipes">

      {/* Ambient orbs */}
      <div className="recipes-atmosphere">
        <div className="atm-orb atm-orb-1"></div>
        <div className="atm-orb atm-orb-2"></div>
        <div className="atm-orb atm-orb-3"></div>
      </div>

      {/* ══════════════════════════════════
          FOOD RECIPES
      ══════════════════════════════════ */}
      <div className="recipes-head">
        <div className="head-ornament"></div>
        <span className="head-label">CULINARY ARTISTRY</span>
        <h2 className="head-title">Recipes </h2>
        <p className="head-subtitle">A curated collection of timeless moments</p>
      </div>

      <div className="habit-carousel">
        <div className="carousel-glow"></div>

          <button
            className="carousel-arrow left"
            onClick={() => setActiveIndex((i) => wrapIndex(i - 1, total))}
            aria-label="Previous recipe"
          >
            &#10094;
          </button>

        <div className="habit-viewport">
          {recipes.map((r, index) =>
            renderCard({
              item: r, index,
              currentIndex: activeIndex, totalCount: total,
              flippedId: isFlipped, setFlipped: setIsFlipped,
              savedList: saved, onSave: toggleSave,
              onCardClick: handleCardClick,
              onEnter: () => setIsPaused(true),
              onLeave: () => setIsPaused(false),
            })
          )}
        </div>

          <button
            className="carousel-arrow right"
            onClick={() => setActiveIndex((i) => wrapIndex(i + 1, total))}
            aria-label="Next recipe"
          >
            &#10095;
          </button>

        <div className="carousel-dots">
          {recipes.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === activeIndex ? " active" : ""}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to recipe ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          DRINKS
      ══════════════════════════════════ */}
      <div className="recipes-head recipes-head--alt">
        <div className="head-ornament"></div>
        <span className="head-label">BEVERAGE COLLECTION</span>
        <h2 className="head-title">Liquid </h2>
        <p className="head-subtitle">Crafted moments in every sip</p>
      </div>

      <div className="habit-carousel">
        <div className="carousel-glow"></div>

        <button
            className="carousel-arrow left"
            onClick={() => setDrinkActiveIndex((i) => wrapIndex(i - 1, drinkTotal))}
            aria-label="Previous drink"
          >
            &#10094;
          </button>
        <div className="habit-viewport">
          {drinks.map((d, index) =>
            renderCard({
              item: d, index,
              currentIndex: drinkActiveIndex, totalCount: drinkTotal,
              flippedId: drinkFlipped, setFlipped: setDrinkFlipped,
              savedList: savedDrinks, onSave: (item) => toggleDrinkSave(item._id),
              onCardClick: handleDrinkCardClick,
              onEnter: () => setDrinkPaused(true),
              onLeave: () => setDrinkPaused(false),
            })
          )}
        </div>

          <button
            className="carousel-arrow right"
            onClick={() => setDrinkActiveIndex((i) => wrapIndex(i + 1, drinkTotal))}
            aria-label="Next drink"
          >
            &#10095;
          </button>

        <div className="carousel-dots">
          {drinks.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === drinkActiveIndex ? " active" : ""}`}
              onClick={() => setDrinkActiveIndex(i)}
              aria-label={`Go to drink ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          PLANNER CTA
      ══════════════════════════════════ */}
      <div className="planner-cta">
        <div className="cta-ornament"></div>
        <Link to="/planner" className="planner-btn">
          <span className="btn-shimmer"></span>
          <span className="btn-text">Explore Your Weekly Planner</span>
          <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 14L13 10L7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="cta-ornament"></div>
      </div>

    </section>
  );
}