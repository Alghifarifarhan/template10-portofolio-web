"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { PortfolioProvider } from "@/context/PortfolioContext";

export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <PortfolioProvider>{children}</PortfolioProvider>
    </AuthProvider>
  );
};
