"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Project } from "@/types";
import { formatImageUrl } from "@/lib/gdrive";
import { usePortfolio } from "@/context/PortfolioContext";
import { trackProjectClick } from "@/services/analyticsService";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  const { data, setIsProjectModalOpen } = usePortfolio();
  const isLight = data.themeMode === "light";
  const [imgError, setImgError] = useState<boolean>(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      setIsProjectModalOpen(true);
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setImgError(false);
    } else {
      setIsProjectModalOpen(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      setIsProjectModalOpen(false);
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, setIsProjectModalOpen]);

  if (!isOpen || !project) return null;

  const gallerySrc = imgError
    ? "/images/portfolio/gallery/g-fuji.jpg"
    : formatImageUrl(project.galleryImage || project.image, "/images/portfolio/gallery/g-fuji.jpg");

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300 z-[9999]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`relative rounded-sm max-w-3xl w-full mx-auto overflow-hidden shadow-2xl z-[10000] animate-pop-modal border transition-colors my-auto ${
          isLight
            ? "bg-white border-[#e2e0d8] shadow-2xl shadow-stone-950/30"
            : "bg-[#141516] border-[#2c2c2d] shadow-2xl shadow-black/90"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] ${
            isLight
              ? "bg-[#f8f7f4]/90 hover:bg-[var(--color-gold)] text-[#141516] hover:text-[#101112]"
              : "bg-[#101112]/80 hover:bg-[var(--color-gold)] text-white hover:text-[#101112]"
          }`}
          aria-label="Close project modal"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Standardized Aspect Ratio Modal Image Container */}
        <div className="relative w-full aspect-[16/10] max-h-[55vh] overflow-hidden bg-[#101112]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallerySrc}
            alt={project.title}
            className="w-full h-full object-cover object-center"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 md:p-10">
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-wider text-[var(--color-gold)] font-medium bg-[var(--color-gold)]/10 px-2.5 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {project.title && (
            <h3
              id="modal-project-title"
              className={`text-2xl sm:text-3xl font-serif mb-4 ${
                isLight ? "text-[#141516]" : "text-white"
              }`}
            >
              {project.title}
            </h3>
          )}

          {project.description && (
            <p
              className={`text-base leading-relaxed mb-8 whitespace-pre-line ${
                isLight ? "text-[#555558]" : "text-[#8a8a8b]"
              }`}
            >
              {project.description}
            </p>
          )}

          <div
            className={`flex items-center justify-between pt-4 border-t ${
              isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"
            }`}
          >
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackProjectClick()}
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#101112] bg-[var(--color-gold)] hover:opacity-90 font-semibold px-6 py-3 rounded-sm transition-colors"
              >
                <span>Project Link</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onClose}
              className={`text-xs uppercase tracking-widest transition-colors ${
                isLight ? "text-[#6b6b70] hover:text-[#141516]" : "text-[#8a8a8b] hover:text-white"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
