"use client";

import React, { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatImageUrl } from "@/lib/gdrive";
import { ScrollReveal } from "@/components/ScrollReveal";
import { trackCvDownload } from "@/services/analyticsService";

export const About: React.FC = () => {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";
  const [imgError, setImgError] = useState<boolean>(false);

  const rawImage = data.about?.aboutImage;
  const imageSrc = imgError
    ? "/images/about-photo.jpg"
    : formatImageUrl(rawImage, "/images/about-photo.jpg");

  const aboutTitle = data.about?.aboutTitle || "";
  const aboutText = data.about?.aboutText || "";
  const cvText = data.about?.cvText || "";
  const cvUrl = data.about?.cvUrl || "";

  if (!aboutTitle && !aboutText && !rawImage) {
    return null;
  }

  return (
    <section id="about" className="py-24 md:py-32 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto z-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Photo Column */}
        {rawImage && (
          <div className="lg:col-span-6 relative">
            <ScrollReveal direction="left" delay={150}>
              <div className="relative mx-auto max-w-md lg:max-w-none group">
                {/* Decorative background border frame */}
                <div
                  className={`absolute -inset-4 border rounded-sm transform translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500 pointer-events-none ${
                    isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"
                  }`}
                />
                {/* Strict standardized aspect ratio container */}
                <div
                  className={`relative overflow-hidden rounded-sm aspect-[4/5] shadow-2xl transition-all duration-500 ${
                    isLight ? "bg-white shadow-stone-200/50" : "bg-[#141516] shadow-black/60"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Portrait"
                    className="w-full h-full object-cover object-center filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-102 transition-all duration-700 ease-out"
                    onError={() => setImgError(true)}
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        )}

        {/* Text Column */}
        <div className={`${rawImage ? "lg:col-span-6" : "lg:col-span-12"} flex flex-col justify-center`}>
          <ScrollReveal direction="right" delay={250}>
            {aboutTitle && (
              <div className="text-pretitle with-line">
                {aboutTitle}
              </div>
            )}

            {aboutText && (
              <p
                className={`text-xl sm:text-2xl md:text-3xl font-serif leading-relaxed mb-8 transition-colors ${
                  isLight ? "text-[#2d2d30]" : "text-[#e8e8e8]"
                }`}
              >
                {aboutText}
              </p>
            )}

            {cvText && (
              <div>
                <a
                  href={cvUrl || "#"}
                  target={cvUrl && cvUrl !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={() => trackCvDownload()}
                  className="inline-flex items-center justify-center px-8 py-4 text-xs tracking-widest uppercase font-semibold text-[#101112] bg-[var(--color-gold)] hover:opacity-90 transition-all duration-300 rounded-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
                >
                  {cvText}
                </a>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
