"use client";

import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";

export const AmbientBackground: React.FC = () => {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Circle 1 - Top Left Gold */}
      <div
        className={`ambient-circle bg-[var(--color-gold)] w-[500px] h-[500px] -top-32 -left-32 transition-opacity duration-700 ${
          isLight ? "opacity-5" : "opacity-10"
        }`}
        style={{ animationDuration: "25s" }}
      />
      {/* Circle 2 - Top Right Teal */}
      <div
        className={`ambient-circle bg-[#23967f] w-[600px] h-[600px] top-1/4 -right-40 transition-opacity duration-700 ${
          isLight ? "opacity-4" : "opacity-10"
        }`}
        style={{ animationDuration: "30s", animationDelay: "-5s" }}
      />
      {/* Circle 3 - Middle Center Gold */}
      <div
        className={`ambient-circle bg-[var(--color-gold)] w-[450px] h-[450px] top-1/2 left-1/4 transition-opacity duration-700 ${
          isLight ? "opacity-3" : "opacity-5"
        }`}
        style={{ animationDuration: "22s", animationDelay: "-10s" }}
      />
      {/* Circle 4 - Bottom Left Teal */}
      <div
        className={`ambient-circle bg-[#23967f] w-[550px] h-[550px] bottom-1/4 -left-20 transition-opacity duration-700 ${
          isLight ? "opacity-4" : "opacity-8"
        }`}
        style={{ animationDuration: "28s", animationDelay: "-15s" }}
      />
      {/* Circle 5 - Bottom Right Gold */}
      <div
        className={`ambient-circle bg-[var(--color-gold)] w-[400px] h-[400px] -bottom-20 right-10 transition-opacity duration-700 ${
          isLight ? "opacity-5" : "opacity-10"
        }`}
        style={{ animationDuration: "20s", animationDelay: "-7s" }}
      />
    </div>
  );
};
