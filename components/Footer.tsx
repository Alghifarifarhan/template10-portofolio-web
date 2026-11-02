"use client";

import React, { useState, useEffect } from "react";
import { FIXED_FOOTER_COPYRIGHT } from "@/data/portfolio-data";
import { usePortfolio } from "@/context/PortfolioContext";

export const Footer: React.FC = () => {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";
  const [showTopBtn, setShowTopBtn] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={`py-12 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto z-10 relative border-t transition-colors ${
        isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]/40"
      }`}
    >
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-6 text-xs ${
          isLight ? "text-[#6b6b70]" : "text-[#8a8a8b]"
        }`}
      >
        {/* Fixed Unchangeable Copyright */}
        <div className="space-y-1 text-center sm:text-left">
          <div>
            &copy; Copyright Luther 2021 Design by{" "}
            <a
              href={FIXED_FOOTER_COPYRIGHT.styleShoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:text-[var(--color-gold)] transition-colors ${
                isLight ? "text-[#333336]" : "text-[#d0d0d0]"
              }`}
            >
              StyleShout
            </a>{" "}
            Distribution By{" "}
            <a
              href={FIXED_FOOTER_COPYRIGHT.themeWagonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:text-[var(--color-gold)] transition-colors ${
                isLight ? "text-[#333336]" : "text-[#d0d0d0]"
              }`}
            >
              Themewagon
            </a>
          </div>
        </div>

        {/* Back to Top */}
        <div>
          <button
            type="button"
            onClick={scrollToTop}
            className={`inline-flex items-center space-x-2 text-xs uppercase tracking-widest hover:text-[var(--color-gold)] transition-all duration-300 py-2 px-3 rounded border hover:border-[var(--color-gold)] ${
              isLight
                ? "text-[#333336] border-[#e2e0d8] bg-white/90 shadow-sm"
                : "text-[#d0d0d0] border-[#2c2c2d] bg-[#141516]/80"
            } ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-70"}`}
            aria-label="Scroll back to top of page"
          >
            <span>Back to Top</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2.206l-6.235 7.528-.765-.645 7.521-9 7.479 9-.764.646-6.236-7.53v21.884h-1v-21.883z" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};
