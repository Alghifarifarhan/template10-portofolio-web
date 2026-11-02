"use client";

import React, { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Project } from "@/types";
import { ProjectModal } from "./ProjectModal";
import { formatImageUrl } from "@/lib/gdrive";
import { ScrollReveal } from "@/components/ScrollReveal";

export const Portfolio: React.FC = () => {
  const { data, setIsProjectModalOpen } = usePortfolio();
  const isLight = data.themeMode === "light";
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    setIsProjectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setIsProjectModalOpen(false);
  };

  const projects = data.works?.projects || [];
  const worksTitle = data.works?.worksTitle || "";
  const worksDescription = data.works?.worksDescription || "";

  if (projects.length === 0 && !worksTitle && !worksDescription) {
    return null;
  }

  return (
    <section id="works" className="py-24 md:py-32 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto z-10 relative">
      {/* Section Header with ScrollReveal */}
      {(worksTitle || worksDescription) && (
        <div className="max-w-3xl mb-16 md:mb-24">
          {worksTitle && (
            <ScrollReveal delay={100} direction="up">
              <div className="text-pretitle with-line">
                {worksTitle}
              </div>
            </ScrollReveal>
          )}

          {worksDescription && (
            <ScrollReveal delay={200} direction="up">
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight whitespace-pre-line ${
                  isLight ? "text-[#141516]" : "text-white"
                }`}
              >
                {worksDescription}
              </h2>
            </ScrollReveal>
          )}
        </div>
      )}

      {/* Portfolio Grid with Staggered ScrollReveal */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project, index) => {
            const coverSrc = formatImageUrl(project.image, "/images/portfolio/fuji.jpg");
            const staggerDelay = 150 + (index % 2) * 150;

            return (
              <ScrollReveal
                key={project.id || index}
                delay={staggerDelay}
                direction="up"
                className="h-full"
              >
                <div
                  className={`group relative border rounded-sm overflow-hidden flex flex-col justify-between h-full transition-all duration-400 hover:shadow-2xl hover:-translate-y-1 ${
                    isLight
                      ? "bg-white border-[#e2e0d8] hover:border-[var(--color-gold)] shadow-md shadow-stone-200/50"
                      : "bg-[#141516] border-[#2c2c2d]/70 hover:border-[var(--color-gold)]/60 shadow-xl"
                  }`}
                >
                  {/* Standardized Aspect Ratio Clickable Image Container */}
                  <div
                    onClick={() => handleOpenModal(project)}
                    className="relative w-full aspect-[16/10] overflow-hidden cursor-pointer bg-[#101112]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverSrc}
                      alt={project.title}
                      className="w-full h-full object-cover object-center filter grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/portfolio/fuji.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Content info */}
                  <div className="p-6 sm:p-8 flex items-center justify-between">
                    <div
                      onClick={() => handleOpenModal(project)}
                      className="cursor-pointer flex-1 mr-4"
                    >
                      {project.category && (
                        <span className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-medium block mb-1">
                          {project.category}
                        </span>
                      )}
                      <h3
                        className={`text-2xl sm:text-3xl font-serif group-hover:text-[var(--color-gold)] transition-colors ${
                          isLight ? "text-[#141516]" : "text-white"
                        }`}
                      >
                        {project.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenModal(project)}
                      className={`w-12 h-12 rounded-full border group-hover:border-[var(--color-gold)] group-hover:text-[var(--color-gold)] flex items-center justify-center transition-all duration-300 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] ${
                        isLight
                          ? "border-[#e2e0d8] bg-[#f8f7f4] text-[#6b6b70]"
                          : "border-[#2c2c2d] bg-[#101112] text-[#8a8a8b]"
                      }`}
                      aria-label={`View details for ${project.title}`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};
