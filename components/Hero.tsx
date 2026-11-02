"use client";

import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { ScrollReveal } from "@/components/ScrollReveal";

export const Hero: React.FC = () => {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";

  const handleScrollDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeSocials = [
    { name: "LinkedIn", url: data.socials?.linkedin },
    { name: "Twitter", url: data.socials?.twitter },
    { name: "Instagram", url: data.socials?.instagram },
    { name: "Dribbble", url: data.socials?.dribbble },
    { name: "Behance", url: data.socials?.behance },
    { name: "Pinterest", url: data.socials?.pinterest },
    { name: "GitHub", url: data.socials?.github },
  ].filter((s) => s.url && s.url.trim() !== "");

  const headline = data.hero?.headline || "";
  const greeting = data.hero?.greeting || "";

  const headlineLines = headline
    .split("\n")
    .filter((line) => line.trim() !== "");

  return (
    <section
      id="intro"
      className="relative min-h-screen flex flex-col justify-between pt-36 md:pt-48 pb-16 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto z-10"
    >
      <div className="flex-1 flex flex-col justify-center max-w-4xl">
        {/* Pretitle */}
        {greeting && (
          <ScrollReveal delay={100} direction="up">
            <div className="text-pretitle with-line">
              {greeting}
            </div>
          </ScrollReveal>
        )}

        {/* Main Headline */}
        {headlineLines.length > 0 && (
          <ScrollReveal delay={250} direction="up">
            <h1
              className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.14] tracking-tight mb-12 transition-colors ${
                isLight ? "text-[#141516]" : "text-white"
              }`}
            >
              {headlineLines.map((line, idx) => (
                <React.Fragment key={idx}>
                  {line.includes("&") ? (
                    <>
                      {line.split("&").map((part, pIdx, arr) => (
                        <React.Fragment key={pIdx}>
                          {part}
                          {pIdx < arr.length - 1 && <span className="text-[var(--color-gold)]">&amp;</span>}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    line
                  )}
                  {idx < headlineLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>
          </ScrollReveal>
        )}

        {/* Social Links Staggered */}
        {activeSocials.length > 0 && (
          <ScrollReveal delay={400} direction="up">
            <ul className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4" aria-label="Social Profiles">
              {activeSocials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs sm:text-sm uppercase tracking-widest transition-colors relative group py-1 ${
                      isLight ? "text-[#6b6b70] hover:text-[var(--color-gold)]" : "text-[#8a8a8b] hover:text-[var(--color-gold)]"
                    }`}
                  >
                    {social.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--color-gold)] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        )}
      </div>

      {/* Scroll Down Indicator */}
      <ScrollReveal delay={550} direction="up">
        <div className="pt-12 flex justify-start">
          <a
            href="#about"
            onClick={handleScrollDown}
            className={`group inline-flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] ${
              isLight
                ? "border-[#e2e0d8] hover:border-[var(--color-gold)] bg-white/70 hover:bg-[var(--color-gold)]/10 text-[#4a4a4d] hover:text-[var(--color-gold)]"
                : "border-[#2c2c2d] hover:border-[var(--color-gold)] bg-[#141516]/50 hover:bg-[var(--color-gold)]/10 text-[#d0d0d0] hover:text-[var(--color-gold)]"
            }`}
            aria-label="Scroll down to About section"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z" />
            </svg>
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
};
