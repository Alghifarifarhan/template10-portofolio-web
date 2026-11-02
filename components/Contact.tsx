"use client";

import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { ScrollReveal } from "@/components/ScrollReveal";

export const Contact: React.FC = () => {
  const { data } = usePortfolio();
  const isLight = data.themeMode === "light";

  const activeSocials = [
    { name: "LinkedIn", url: data.socials?.linkedin },
    { name: "Twitter", url: data.socials?.twitter },
    { name: "Instagram", url: data.socials?.instagram },
    { name: "Dribbble", url: data.socials?.dribbble },
    { name: "Behance", url: data.socials?.behance },
    { name: "Pinterest", url: data.socials?.pinterest },
    { name: "GitHub", url: data.socials?.github },
  ].filter((s) => s.url && s.url.trim() !== "");

  const contactTitle = data.contact?.contactTitle || "";
  const contactDescription = data.contact?.contactDescription || "";
  const reachMeTitle = data.contact?.reachMeTitle || "";
  const socialTitle = data.contact?.socialTitle || "";
  const email = data.contact?.email || "";
  const phone = data.contact?.phone || "";
  const location = data.contact?.location || "";

  if (!contactTitle && !contactDescription && !email && !phone && !location && activeSocials.length === 0) {
    return null;
  }

  return (
    <section id="contact" className="py-24 md:py-32 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto z-10 relative">
      {/* Top Header */}
      {(contactTitle || contactDescription) && (
        <div className="max-w-4xl mb-16 md:mb-20">
          {contactTitle && (
            <ScrollReveal delay={100} direction="up">
              <div className="text-pretitle with-line">
                {contactTitle}
              </div>
            </ScrollReveal>
          )}

          {contactDescription && (
            <ScrollReveal delay={200} direction="up">
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight whitespace-pre-line ${
                  isLight ? "text-[#141516]" : "text-white"
                }`}
              >
                {contactDescription}
              </h2>
            </ScrollReveal>
          )}
        </div>
      )}

      {/* Bottom Information Grid with Staggered ScrollReveal */}
      <ScrollReveal delay={300} direction="up">
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-10 items-start pt-8 border-t transition-colors ${
            isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]/60"
          }`}
        >
          {/* Reach me at */}
          {(reachMeTitle || email || phone || location) && (
            <div className="md:col-span-4">
              {reachMeTitle && (
                <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-semibold mb-4">
                  {reachMeTitle}
                </h3>
              )}
              <div className="space-y-2 text-base">
                {email && (
                  <p>
                    <a
                      href={`mailto:${email}`}
                      className={`hover:text-[var(--color-gold)] transition-colors inline-block ${
                        isLight ? "text-[#222225]" : "text-[#e8e8e8]"
                      }`}
                    >
                      {email}
                    </a>
                  </p>
                )}
                {phone && (
                  <p>
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className={`hover:text-[var(--color-gold)] transition-colors inline-block ${
                        isLight ? "text-[#6b6b70]" : "text-[#8a8a8b]"
                      }`}
                    >
                      {phone}
                    </a>
                  </p>
                )}
                {location && (
                  <p className={`text-sm ${isLight ? "text-[#8a8a8f]" : "text-[#8a8a8b]"}`}>
                    {location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Social */}
          <div className="md:col-span-4">
            {socialTitle && (
              <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-semibold mb-4">
                {socialTitle}
              </h3>
            )}
            {activeSocials.length > 0 ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {activeSocials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm hover:text-[var(--color-gold)] transition-colors inline-block py-1 ${
                        isLight ? "text-[#6b6b70]" : "text-[#8a8a8b]"
                      }`}
                    >
                      {social.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div />
            )}
          </div>

          {/* Action Button */}
          {email && (
            <div className="md:col-span-4 flex md:justify-end items-center">
              <a
                href={`mailto:${email}`}
                className="w-full sm:w-auto text-center inline-flex items-center justify-center px-10 py-4 text-xs uppercase tracking-widest font-semibold text-[#101112] bg-[var(--color-gold)] hover:opacity-90 transition-all duration-300 rounded-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
              >
                Say Hello.
              </a>
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
};
