"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePortfolio } from "@/context/PortfolioContext";

export const Navbar: React.FC = () => {
  const { data, isProjectModalOpen } = usePortfolio();
  const isLight = data.themeMode === "light";

  const [activeSection, setActiveSection] = useState<string>("intro");
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const brandName = data.nav?.brandName || "";

  const navItems = [
    { label: data.nav?.intro, href: "#intro" },
    { label: data.nav?.about, href: "#about" },
    { label: data.nav?.works, href: "#works" },
    { label: data.nav?.contact, href: "#contact" },
  ].filter((item) => item.label && item.label.trim() !== "");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ["intro", "about", "works", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const sectionEl = document.getElementById(sectionId);
        if (sectionEl) {
          const top = sectionEl.offsetTop;
          const height = sectionEl.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 ${
        isProjectModalOpen
          ? "opacity-0 pointer-events-none -translate-y-8 invisible"
          : "opacity-100 translate-y-0"
      } ${
        isScrolled
          ? isLight
            ? "bg-[#f8f7f4]/90 backdrop-blur-md py-4 border-b border-[#e2e0d8] shadow-sm"
            : "bg-[#101112]/90 backdrop-blur-md py-4 border-b border-[#2c2c2d]/60 shadow-lg"
          : "bg-transparent py-6 md:py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 flex items-center justify-between">
        {/* Logo (Clean empty handling) */}
        {brandName ? (
          <Link
            href="#intro"
            onClick={(e) => handleLinkClick(e, "#intro")}
            className={`text-2xl md:text-3xl font-serif tracking-tight hover:text-[var(--color-gold)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] ${
              isLight ? "text-[#141516]" : "text-white"
            }`}
          >
            {brandName}
            <span className="text-[var(--color-gold)]">.</span>
          </Link>
        ) : (
          <div />
        )}

        {/* Desktop Nav */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`text-sm tracking-widest uppercase transition-all duration-200 relative py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] ${
                    isActive
                      ? "text-[var(--color-gold)] font-semibold"
                      : isLight
                      ? "text-[#4a4a4d] hover:text-[var(--color-gold)]"
                      : "text-[#d0d0d0] hover:text-[var(--color-gold)]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-gold)] rounded-full animate-fade-scale" />
                  )}
                </a>
              );
            })}
          </nav>
        )}

        {/* Mobile Hamburger Button with Smooth Morphing Animation */}
        {navItems.length > 0 && (
          <div className="md:hidden flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex items-center space-x-2 text-xs uppercase tracking-widest py-2 px-3 rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] ${
                isLight
                  ? "text-[#333336] hover:text-[var(--color-gold)] border-[#e2e0d8] bg-white/90"
                  : "text-[#d0d0d0] hover:text-[var(--color-gold)] border-[#2c2c2d] bg-[#141516]/80"
              }`}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span>Menu</span>
              <div className="w-4 h-3.5 flex flex-col justify-between items-center relative">
                <span
                  className={`w-full h-0.5 rounded-full transition-all duration-300 ease-in-out ${
                    isLight ? "bg-black" : "bg-white"
                  } ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                />
                <span
                  className={`w-full h-0.5 rounded-full transition-all duration-200 ease-in-out ${
                    isLight ? "bg-black" : "bg-white"
                  } ${mobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"}`}
                />
                <span
                  className={`w-full h-0.5 rounded-full transition-all duration-300 ease-in-out ${
                    isLight ? "bg-black" : "bg-white"
                  } ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {navItems.length > 0 && (
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
            mobileMenuOpen
              ? isLight
                ? "max-h-72 opacity-100 border-b border-[#e2e0d8] bg-[#f8f7f4]/95 backdrop-blur-xl shadow-lg"
                : "max-h-72 opacity-100 border-b border-[#2c2c2d] bg-[#101112]/95 backdrop-blur-xl shadow-2xl"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="px-6 py-6 space-y-4 animate-drawer" aria-label="Mobile Navigation">
            {navItems.map((item, idx) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className={`block text-base tracking-wider uppercase transition-all py-1 ${
                    isActive
                      ? "text-[var(--color-gold)] font-semibold translate-x-1"
                      : isLight
                      ? "text-[#333336] hover:text-[var(--color-gold)]"
                      : "text-[#d0d0d0] hover:text-[var(--color-gold)]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
