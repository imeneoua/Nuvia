import { useEffect, useRef, useState } from "react";
import "./Hero.css";

export default function Hero() {
  const heroRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(0);

  const philosophies = [
    {
      number: "01",
      title: "Intent over speed",
      description: "Mindful preparation",
    },
    {
      number: "02",
      title: "Heat is emotion",
      description: "Cooking with feeling",
    },
    {
      number: "03",
      title: "Simplicity wins",
      description: "Pure ingredients shine",
    },
  ];

  const images = [
    { src: "/Pics/Features1.jpeg",                                              alt: "Blue Matcha Latte"          },
    { src: "/Pics/The Easiest No-Bake Biscoff Cheesecake You'll Ever Make.jpg", alt: "No-bake Biscoff Cheesecake" },
    { src: "/Cozy Masala Chai Latte.jpg",                                       alt: "Cozy Masala Chai Latte"     },
  ];

  // ── Auto-rotate every 4 s ──
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ── IntersectionObserver fade-in ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll(".fade-in-element");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero-wrapper" ref={heroRef}>

      {/* ══════════════════════════════════════
          DARK WAVE ZONE  (.hero-main)
      ══════════════════════════════════════ */}
      <div className="hero-main">

        {/* Ambient background layers */}
        <div className="hero-ambient">
          <div className="ambient-glow ambient-glow-1"></div>
          <div className="ambient-glow ambient-glow-2"></div>
          <div className="ambient-grain"></div>
        </div>

        {/* Inner two-column layout */}
        <div className="hero-content">

          {/* ── LEFT: Text ── */}
          <div className="the-text">

            <span className="eyebrow fade-in-element">
              <span className="eyebrow-accent">◆</span>
              Nuvia EXPERIENCE
              <span className="eyebrow-accent">◆</span>
            </span>

            <h1 className="fade-in-element">
              Cook <span className="accent">with intent</span>
              <br />
              Eat <span className="accent-green">beautifully</span>
            </h1>

            <p className="subtitle fade-in-element">
              A refined way to discover recipes, plan meals, and transform
              everyday cooking into an experience worth savoring.
            </p>

            {/* Philosophy cards grid */}
            <div className="hero-philosophy-grid fade-in-element">
              {philosophies.map((item, index) => (
                <div
                  key={item.number}
                  className="hero-philosophy-card"
                  style={{ "--card-index": index }}
                >
                  <div className="philosophy-header">
                    <span className="hero-philosophy-number">{item.number}</span>
                    <div className="philosophy-line"></div>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="philosophy-description">{item.description}</p>
                </div>
              ))}
            </div>

          </div>
          {/* end .the-text */}

          {/* ── RIGHT: Image gallery ── */}
          <div className="hero-visual fade-in-element">
            <div className="visual-gallery">

              {/* Three stacked image cards */}
              <div className="image-stack">

                <div className={`image-layer image-layer-1${currentImage === 0 ? " active" : ""}`}>
                  <div className="visual-image">
                    <img className="visual-photo" src={images[0].src} alt={images[0].alt} />
                  </div>
                </div>

                <div className={`image-layer image-layer-2${currentImage === 1 ? " active" : ""}`}>
                  <div className="visual-image">
                    <img className="visual-photo" src={images[1].src} alt={images[1].alt} />
                  </div>
                </div>

                <div className={`image-layer image-layer-3${currentImage === 2 ? " active" : ""}`}>
                  <div className="visual-image">
                    <img className="visual-photo" src={images[2].src} alt={images[2].alt} />
                  </div>
                </div>

              </div>
              {/* end .image-stack */}

              {/* Decorative floating circles */}
              <div className="visual-accent visual-accent-1"></div>
              <div className="visual-accent visual-accent-2"></div>

              {/* Dot navigation */}
              <div className="gallery-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`dot${currentImage === index ? " active" : ""}`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <span className="dot-inner"></span>
                  </button>
                ))}
              </div>

            </div>
            {/* end .visual-gallery */}
          </div>
          {/* end .hero-visual */}

        </div>
        {/* end .hero-content */}

        {/* Sparkles */}
        <div className="hero-sparkles">
          <span className="sparkle sparkle-1">✦</span>
          <span className="sparkle sparkle-2">✦</span>
          <span className="sparkle sparkle-3">✦</span>
          <span className="sparkle sparkle-4">✦</span>
          <span className="sparkle sparkle-5">✦</span>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="scroll-text">Explore</span>
        </div>

      </div>
      {/* end .hero-main */}

    </section>
  );
}