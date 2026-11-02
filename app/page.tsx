"use client";

import React, { useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Expertise } from "@/components/Expertise";
import { Timeline } from "@/components/Timeline";
import { Portfolio } from "@/components/Portfolio";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/services/analyticsService";

export default function Home() {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";

  useEffect(() => {
    trackPageView();
  }, []);

  return (
    <div
      style={{ "--color-gold": data.accentColor || "#eabe7c" } as React.CSSProperties}
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-400 ${
        isLight ? "theme-light bg-[#f8f7f4] text-[#555558]" : "theme-dark bg-[#101112] text-[#8a8a8b]"
      }`}
    >
      {/* Signature Animated Ambient Circles */}
      <AmbientBackground />

      {/* Header & Sticky Navigation (z-40) */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <About />
        <Expertise />
        <Timeline />
        <Portfolio />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
