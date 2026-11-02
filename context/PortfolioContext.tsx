"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { FullPortfolioData } from "@/types";
import { emptyPortfolioData, templateSampleData } from "@/data/portfolio-data";
import {
  getPortfolioContent,
  savePortfolioContent,
  subscribePortfolioContent,
} from "@/services/portfolioService";

interface PortfolioContextType {
  data: FullPortfolioData;
  loading: boolean;
  isProjectModalOpen: boolean;
  setIsProjectModalOpen: (open: boolean) => void;
  updateData: (newData: FullPortfolioData) => Promise<{ success: boolean; error?: string }>;
  resetToDefault: () => Promise<{ success: boolean; error?: string }>;
  loadTemplateSamples: () => Promise<{ success: boolean; error?: string }>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronously initialize from localStorage cache for 0ms delay without flash
  const [data, setData] = useState<FullPortfolioData>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("portfolio_content_cache");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // ignore
        }
      }
    }
    return emptyPortfolioData;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch from Firestore
    getPortfolioContent().then((initialData) => {
      setData(initialData);
      setLoading(false);
    });

    // Realtime subscription
    const unsubscribe = subscribePortfolioContent((updatedData) => {
      setData(updatedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Synchronize dynamic accent/gold color with CSS custom property on document element
  useEffect(() => {
    if (typeof window !== "undefined") {
      const color = data.accentColor || "#eabe7c";
      document.documentElement.style.setProperty("--color-gold", color);
    }
  }, [data.accentColor]);

  const updateData = async (newData: FullPortfolioData) => {
    setData(newData);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_content_cache", JSON.stringify(newData));
    }
    return await savePortfolioContent(newData);
  };

  const resetToDefault = async () => {
    setData(emptyPortfolioData);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_content_cache", JSON.stringify(emptyPortfolioData));
    }
    return await savePortfolioContent(emptyPortfolioData);
  };

  const loadTemplateSamples = async () => {
    setData(templateSampleData);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_content_cache", JSON.stringify(templateSampleData));
    }
    return await savePortfolioContent(templateSampleData);
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        isProjectModalOpen,
        setIsProjectModalOpen,
        updateData,
        resetToDefault,
        loadTemplateSamples,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
