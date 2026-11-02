"use client";

import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { ScrollReveal } from "@/components/ScrollReveal";

export const Expertise: React.FC = () => {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";
  const skills = (data.expertise?.skills || []).filter((s) => s && s.trim() !== "");
  const title = data.expertise?.title || "";

  if (skills.length === 0 && !title) {
    return null;
  }

  return (
    <section
      className={`py-20 md:py-28 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto z-10 relative border-t transition-colors ${
        isLight ? "border-[#e2e0d8]/70" : "border-[#2c2c2d]/40"
      }`}
    >
      {title && (
        <ScrollReveal delay={100} direction="up">
          <div className="text-pretitle">{title}</div>
        </ScrollReveal>
      )}

      {skills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12 mt-6">
          {skills.map((skill, index) => (
            <ScrollReveal key={`${skill}-${index}`} delay={150 + index * 90} direction="up">
              <div
                className={`group flex items-center space-x-4 py-3 border-b transition-all duration-300 ${
                  isLight
                    ? "border-[#e2e0d8] hover:border-[var(--color-gold)]"
                    : "border-[#2c2c2d]/60 hover:border-[var(--color-gold)]"
                }`}
              >
                <span
                  className={`text-xs font-mono transition-colors ${
                    isLight ? "text-[#8a8a8f] group-hover:text-[var(--color-gold)]" : "text-[#8a8a8b] group-hover:text-[var(--color-gold)]"
                  }`}
                >
                  {index < 9 ? `0${index + 1}.` : `${index + 1}.`}
                </span>
                <span
                  className={`text-2xl sm:text-3xl lg:text-4xl font-serif group-hover:translate-x-1.5 transition-all duration-300 ${
                    isLight
                      ? "text-[#222225] group-hover:text-[var(--color-gold)]"
                      : "text-[#e8e8e8] group-hover:text-white"
                  }`}
                >
                  {skill}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
};
