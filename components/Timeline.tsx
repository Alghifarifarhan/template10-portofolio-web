"use client";

import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { TimelineItem } from "@/types";
import { ScrollReveal } from "@/components/ScrollReveal";

interface TimelineColumnProps {
  title: string;
  items: TimelineItem[];
  isLight: boolean;
  baseDelay: number;
}

const TimelineColumn: React.FC<TimelineColumnProps> = ({ title, items, isLight, baseDelay }) => {
  if (items.length === 0 && !title) return null;

  return (
    <div className="flex-1">
      {title && (
        <ScrollReveal delay={baseDelay} direction="up">
          <div className="text-pretitle mb-8">{title}</div>
        </ScrollReveal>
      )}

      {items.length > 0 && (
        <div
          className={`relative pl-6 space-y-12 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] ${
            isLight ? "before:bg-[#e2e0d8]" : "before:bg-[#2c2c2d]"
          }`}
        >
          {items.map((item, index) => (
            <ScrollReveal
              key={item.id || index}
              delay={baseDelay + 100 + index * 140}
              direction="up"
            >
              <div className="relative group">
                {/* Timeline Bullet */}
                <div
                  className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 group-hover:border-[var(--color-gold)] group-hover:bg-[var(--color-gold)] transition-all duration-300 transform -translate-x-[2px] ${
                    isLight
                      ? "bg-[#f8f7f4] border-[#d2cfc4]"
                      : "bg-[#101112] border-[#2c2c2d]"
                  }`}
                />

                {/* Header */}
                <div className="mb-2">
                  {item.title && (
                    <h3
                      className={`text-2xl sm:text-3xl font-serif group-hover:text-[var(--color-gold)] transition-colors ${
                        isLight ? "text-[#141516]" : "text-white"
                      }`}
                    >
                      {item.title}
                    </h3>
                  )}
                  {item.role && (
                    <div
                      className={`text-base font-medium mt-1 ${
                        isLight ? "text-[#333336]" : "text-[#e8e8e8]"
                      }`}
                    >
                      {item.role}
                    </div>
                  )}
                  {item.timeframe && (
                    <span
                      className={`inline-block text-xs uppercase tracking-wider mt-1 font-mono ${
                        isLight ? "text-[#8a8a8f]" : "text-[#8a8a8b]"
                      }`}
                    >
                      {item.timeframe}
                    </span>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <p
                    className={`text-sm sm:text-base leading-relaxed mt-3 whitespace-pre-line ${
                      isLight ? "text-[#6b6b70]" : "text-[#8a8a8b]"
                    }`}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};

export const Timeline: React.FC = () => {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";

  const expItems = data.timeline?.experienceItems || [];
  const eduItems = data.timeline?.educationItems || [];
  const expTitle = data.timeline?.experienceTitle || "";
  const eduTitle = data.timeline?.educationTitle || "";

  if (expItems.length === 0 && eduItems.length === 0 && !expTitle && !eduTitle) {
    return null;
  }

  return (
    <section
      className={`py-20 md:py-28 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto z-10 relative border-t transition-colors ${
        isLight ? "border-[#e2e0d8]/70" : "border-[#2c2c2d]/40"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
        <TimelineColumn
          title={expTitle}
          items={expItems}
          isLight={isLight}
          baseDelay={100}
        />
        <TimelineColumn
          title={eduTitle}
          items={eduItems}
          isLight={isLight}
          baseDelay={200}
        />
      </div>
    </section>
  );
};
