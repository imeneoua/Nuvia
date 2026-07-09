import { useEffect, useRef, useState } from "react";
import "./Hero.css";

export default function Hero() {
  const heroRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});

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
    {
      src: "/Pics/Flu Bomb _ Barbara O'Neill’s Recipe -.jpg",
      alt: "Flu bomb recipe drink",
    },
    {
      src: "public/noodles (1).jpg",
      alt: "Elegant plated dessert",
    },
    {
      src: "public/Tangerine Light Mocktail _ Jeju Tangerine, Barley Tea & Yuzu.jpg",
      alt: "Iced citrus cocktail with dried orange and rosemary",
    },
  ];

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
      <div className="hero-main">
        <div className="hero-ambient">
          <div className="ambient-glow ambient-glow-1"></div>
          <div className="ambient-glow ambient-glow-2"></div>
          <div className="ambient-grain"></div>
        </div>

        <div className="hero-content">
          <div className="the-text">
            <h1 className="fade-in-element visible">
              Cook <span className="accent"> with care</span>
              <br />
              Eat <span className="accent-green">beautifully</span>
            </h1>

            <p className="subtitle fade-in-element visible">
              A refined way to discover recipes, plan meals, and transform
              everyday cooking into an experience worth savoring.
            </p>

            <div className="hero-philosophy-grid fade-in-element visible">
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

          <div className="hero-visual fade-in-element visible">
            <div className="visual-gallery">
              <div className="image-stack">
                {images.map((image, index) => (
                  <div
                    key={image.src}
                    className={`image-layer image-layer-${index + 1}${
                      loadedImages[index] ? " image-loaded" : ""
                    }`}
                    style={{ "--image-index": index }}
                  >
                    <div className="visual-image">
                      <img
                        className="visual-photo"
                        src={image.src}
                        alt={image.alt}
                        onLoad={() =>
                          setLoadedImages((current) => ({
                            ...current,
                            [index]: true,
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-sparkles">
          <span className="sparkle sparkle-1">{"\u2726"}</span>
          <span className="sparkle sparkle-2">{"\u2726"}</span>
          <span className="sparkle sparkle-3">{"\u2726"}</span>
          <span className="sparkle sparkle-4">{"\u2726"}</span>
          <span className="sparkle sparkle-5">{"\u2726"}</span>
        </div>
      </div>
    </section>
  );
}