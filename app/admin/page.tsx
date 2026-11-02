"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { FullPortfolioData, Project, TimelineItem, ThemeMode } from "@/types";
import { FIXED_FOOTER_COPYRIGHT } from "@/data/portfolio-data";
import { formatImageUrl } from "@/lib/gdrive";
import {
  getAnalyticsStats,
  subscribeAnalytics,
  AnalyticsStats,
  defaultAnalyticsStats,
} from "@/services/analyticsService";

/**
 * Dedicated Tags Input with local string state so commas and spaces can be typed freely
 * and visual tag pills with interactive removal.
 */
function ProjectTagsInput({
  tags,
  onChange,
  isLight,
}: {
  tags: string[];
  onChange: (newTags: string[]) => void;
  isLight?: boolean;
}) {
  const [text, setText] = useState(() => (tags || []).join(", "));

  // Keep in sync when external tags change (e.g. template loaded / reset / imported)
  useEffect(() => {
    const parsedCurrent = text.split(",").map((t) => t.trim()).filter(Boolean);
    const tagsArray = tags || [];
    if (parsedCurrent.join(",") !== tagsArray.join(",")) {
      setText(tagsArray.join(", "));
    }
  }, [tags]);

  const handleTextChange = (val: string) => {
    setText(val);
    const parsed = val.split(",").map((t) => t.trim()).filter(Boolean);
    onChange(parsed);
  };

  const removeTag = (indexToRemove: number) => {
    const currentTags = tags || [];
    const newTags = currentTags.filter((_, idx) => idx !== indexToRemove);
    setText(newTags.join(", "));
    onChange(newTags);
  };

  return (
    <div className="space-y-2">
      <label
        className={`block text-[11px] uppercase tracking-wider ${
          isLight ? "text-[#555558]" : "text-[#8a8a8b]"
        } mb-1 font-medium`}
      >
        Tags Modal (Pisahkan dengan koma, cth: Branding, UI Design)
      </label>
      <input
        type="text"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Pisahkan dengan koma: Branding, UI Design, Next.js"
        className={`w-full ${
          isLight
            ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]"
            : "bg-[#141516] border-[#2c2c2d] text-white"
        } border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
      />
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span
            className={`text-[10px] uppercase font-mono ${
              isLight ? "text-[#777777]" : "text-[#8a8a8b]"
            }`}
          >
            Tags aktif ({tags.length}):
          </span>
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold)]/30 shadow-xs"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-red-400 font-bold ml-1 cursor-pointer focus:outline-none leading-none"
                title={`Hapus tag "${tag}"`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading, login, register, logout, changePassword } = useAuth();
  const {
    data: portfolioData,
    loading: dataLoading,
    updateData,
    resetToDefault,
    loadTemplateSamples,
  } = usePortfolio();

  // Local state for editing form
  const [formData, setFormData] = useState<FullPortfolioData>(portfolioData);
  const [activeTab, setActiveTab] = useState<string>("nav");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsStats>(defaultAnalyticsStats);

  // Auth form state
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [showAuthPassword, setShowAuthPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);

  // Password change state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<string>("");

  // Database JSON Import/Export state
  const [importStatus, setImportStatus] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLight = formData.themeMode === "light";

  // Sync form data when portfolio data loads
  useEffect(() => {
    if (portfolioData) {
      setFormData(portfolioData);
    }
  }, [portfolioData]);

  // Subscribe to real-time analytics
  useEffect(() => {
    getAnalyticsStats().then((stats) => setAnalytics(stats));
    const unsubscribe = subscribeAnalytics((stats) => setAnalytics(stats));
    return () => unsubscribe();
  }, []);

  // Handle Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(authEmail, authPassword);
      } else {
        await login(authEmail, authPassword);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      if (msg.includes("user-not-found")) {
        setAuthError("Email tidak terdaftar. Silakan daftar akun baru terlebih dahulu.");
      } else if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setAuthError("Password salah. Silakan coba lagi.");
      } else if (msg.includes("email-already-in-use")) {
        setAuthError("Email sudah terdaftar. Silakan login.");
      } else if (msg.includes("weak-password")) {
        setAuthError("Password minimal 6 karakter.");
      } else {
        setAuthError(msg);
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Handle Save
  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    const res = await updateData(formData);
    if (res.success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setErrorMessage(res.error || "Gagal menyimpan ke Firestore");
    }
  };

  // Handle Reset to Clean State
  const handleReset = async () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan semua data website (Clean Empty State)?")) {
      setSaveStatus("saving");
      const res = await resetToDefault();
      if (res.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setErrorMessage(res.error || "Gagal mereset data");
      }
    }
  };

  // Handle Load Sample Data
  const handleLoadSamples = async () => {
    if (confirm("Muat data contoh template Luther? Data saat ini akan digantikan dengan contoh template.")) {
      setSaveStatus("saving");
      const res = await loadTemplateSamples();
      if (res.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setErrorMessage(res.error || "Gagal memuat data contoh");
      }
    }
  };

  // Handle Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus("loading");
    setPasswordChangeMsg("");

    if (newPassword.length < 6) {
      setPasswordChangeStatus("error");
      setPasswordChangeMsg("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeStatus("error");
      setPasswordChangeMsg("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      await changePassword(newPassword);
      setPasswordChangeStatus("success");
      setPasswordChangeMsg("Password berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordChangeStatus("idle"), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah password";
      setPasswordChangeStatus("error");
      if (msg.includes("requires-recent-login")) {
        setPasswordChangeMsg("Sesi login Anda sudah lama. Silakan logout dan login ulang sebelum mengubah password.");
      } else {
        setPasswordChangeMsg(msg);
      }
    }
  };

  // Handle Export/Download database.json
  const handleExportDatabase = () => {
    try {
      const dataToExport = {
        ...formData,
        _metadata: {
          exportedAt: new Date().toISOString(),
          appName: "Luther Portfolio CMS",
          version: "1.0",
        },
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToExport, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      const dateStr = new Date().toISOString().split("T")[0];
      downloadAnchor.setAttribute("download", `portfolio-database-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Gagal mendownload file database.json.");
    }
  };

  // Handle Import/Upload database.json
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("");
    setImportError("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Format file JSON tidak valid.");
        }

        // Validate and merge with fallback data
        const validatedData: FullPortfolioData = {
          ...portfolioData,
          ...parsed,
          nav: { ...portfolioData.nav, ...(parsed.nav || {}) },
          hero: { ...portfolioData.hero, ...(parsed.hero || {}) },
          socials: { ...portfolioData.socials, ...(parsed.socials || {}) },
          about: { ...portfolioData.about, ...(parsed.about || {}) },
          expertise: {
            title: parsed.expertise?.title ?? portfolioData.expertise?.title ?? "",
            skills: Array.isArray(parsed.expertise?.skills) ? parsed.expertise.skills : [],
          },
          timeline: {
            experienceTitle: parsed.timeline?.experienceTitle ?? portfolioData.timeline?.experienceTitle ?? "",
            experienceItems: Array.isArray(parsed.timeline?.experienceItems) ? parsed.timeline.experienceItems : [],
            educationTitle: parsed.timeline?.educationTitle ?? portfolioData.timeline?.educationTitle ?? "",
            educationItems: Array.isArray(parsed.timeline?.educationItems) ? parsed.timeline.educationItems : [],
          },
          works: {
            worksTitle: parsed.works?.worksTitle ?? portfolioData.works?.worksTitle ?? "",
            worksDescription: parsed.works?.worksDescription ?? portfolioData.works?.worksDescription ?? "",
            projects: Array.isArray(parsed.works?.projects) ? parsed.works.projects : [],
          },
          contact: { ...portfolioData.contact, ...(parsed.contact || {}) },
          themeMode: parsed.themeMode || portfolioData.themeMode || "dark",
          accentColor: parsed.accentColor || portfolioData.accentColor || "#eabe7c",
        };

        setFormData(validatedData);
        if (validatedData.accentColor && typeof window !== "undefined") {
          document.documentElement.style.setProperty("--color-gold", validatedData.accentColor);
        }

        // Immediately persist to Firestore
        setSaveStatus("saving");
        const res = await updateData(validatedData);
        if (res.success) {
          setSaveStatus("saved");
          setImportStatus("✓ Database JSON berhasil diimpor & disimpan ke Cloud Firestore!");
          setTimeout(() => {
            setSaveStatus("idle");
            setImportStatus("");
          }, 4000);
        } else {
          setSaveStatus("error");
          setImportError(res.error || "Gagal menyimpan data import ke Firestore.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal membaca file JSON.";
        setImportError(`Gagal mengimpor file: ${msg}`);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  // Helper functions for nested updates
  const updateNav = (key: keyof FullPortfolioData["nav"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      nav: { ...prev.nav, [key]: value },
    }));
  };

  const updateHero = (key: keyof FullPortfolioData["hero"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [key]: value },
    }));
  };

  const updateSocials = (key: keyof FullPortfolioData["socials"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: value },
    }));
  };

  const updateAbout = (key: keyof FullPortfolioData["about"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      about: { ...prev.about, [key]: value },
    }));
  };

  const updateExpertiseTitle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: { ...prev.expertise, title: value },
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      expertise: {
        ...prev.expertise,
        skills: ["", ...prev.expertise.skills],
      },
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData((prev) => {
      const newSkills = [...prev.expertise.skills];
      newSkills[index] = value;
      return {
        ...prev,
        expertise: { ...prev.expertise, skills: newSkills },
      };
    });
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      expertise: {
        ...prev.expertise,
        skills: prev.expertise.skills.filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimelineTitle = (field: "experienceTitle" | "educationTitle", value: string) => {
    setFormData((prev) => ({
      ...prev,
      timeline: { ...prev.timeline, [field]: value },
    }));
  };

  const addTimelineItem = (type: "experience" | "education") => {
    const newItem: TimelineItem = {
      id: `${type}-${Date.now()}`,
      title: "",
      role: "",
      timeframe: "",
      description: "",
    };

    setFormData((prev) => {
      const field = type === "experience" ? "experienceItems" : "educationItems";
      return {
        ...prev,
        timeline: {
          ...prev.timeline,
          [field]: [newItem, ...prev.timeline[field]],
        },
      };
    });
  };

  const updateTimelineItem = (
    type: "experience" | "education",
    index: number,
    key: keyof TimelineItem,
    value: string
  ) => {
    setFormData((prev) => {
      const field = type === "experience" ? "experienceItems" : "educationItems";
      const items = [...prev.timeline[field]];
      items[index] = { ...items[index], [key]: value };
      return {
        ...prev,
        timeline: { ...prev.timeline, [field]: items },
      };
    });
  };

  const removeTimelineItem = (type: "experience" | "education", index: number) => {
    setFormData((prev) => {
      const field = type === "experience" ? "experienceItems" : "educationItems";
      return {
        ...prev,
        timeline: {
          ...prev.timeline,
          [field]: prev.timeline[field].filter((_, i) => i !== index),
        },
      };
    });
  };

  const updateWorks = (key: "worksTitle" | "worksDescription", value: string) => {
    setFormData((prev) => ({
      ...prev,
      works: { ...prev.works, [key]: value },
    }));
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: "",
      category: "",
      description: "",
      image: "",
      galleryImage: "",
      tags: [],
      link: "",
    };

    setFormData((prev) => ({
      ...prev,
      works: {
        ...prev.works,
        projects: [newProj, ...prev.works.projects],
      },
    }));
  };

  const updateProject = (index: number, key: keyof Project, value: string | string[]) => {
    setFormData((prev) => {
      const projs = [...prev.works.projects];
      projs[index] = { ...projs[index], [key]: value };
      return {
        ...prev,
        works: { ...prev.works, projects: projs },
      };
    });
  };

  const removeProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      works: {
        ...prev.works,
        projects: prev.works.projects.filter((_, i) => i !== index),
      },
    }));
  };

  const updateContact = (key: keyof FullPortfolioData["contact"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [key]: value },
    }));
  };

  const updateThemeMode = (mode: ThemeMode) => {
    setFormData((prev) => ({
      ...prev,
      themeMode: mode,
    }));
  };

  const updateAccentColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      accentColor: color,
    }));
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty("--color-gold", color);
    }
  };

  // Loading spinner
  if (authLoading || dataLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isLight ? "bg-[#f8f7f4] text-[#141516]" : "bg-[#0d0e0f] text-white"}`}>
        <div className="w-12 h-12 border-4 border-[#2c2c2d]/30 border-t-[var(--color-gold)] rounded-full animate-spin mb-4" />
        <p className={`text-xs uppercase tracking-widest ${isLight ? "text-[#77777a]" : "text-[#8a8a8b]"}`}>Loading Portfolio CMS...</p>
      </div>
    );
  }

  // Not logged in -> Show Login Card
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLight ? "bg-[#f8f7f4]" : "bg-[#0d0e0f]"} relative overflow-hidden`}>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#23967f]/10 rounded-full blur-3xl pointer-events-none" />

        <div className={`relative w-full max-w-md ${isLight ? "bg-[#ffffff] border-[#e2e0d8] text-[#141516] shadow-xl" : "bg-[#141516] border-[#2c2c2d] text-white shadow-2xl"} border rounded-sm p-8 sm:p-10 z-10 animate-pop-modal`}>
          <div className="text-center mb-8">
            <Link href="/" className={`inline-block text-3xl font-serif ${isLight ? "text-[#141516]" : "text-white"} hover:text-[var(--color-gold)] transition-colors`}>
              Portfolio<span className="text-[var(--color-gold)]">.</span>
            </Link>
            <h1 className={`text-sm uppercase tracking-widest ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} mt-2 font-medium`}>
              Admin Portal
            </h1>
            <p className={`text-xs ${isLight ? "text-[#77777a]" : "text-[#8a8a8b]"} mt-1`}>
              {isRegisterMode ? "Buat akun admin baru dengan Firebase Auth" : "Login untuk mengelola konten portfolio"}
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded bg-red-950/50 border border-red-800/60 text-red-200 text-xs leading-relaxed">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@portfolio.com"
                className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
              />
            </div>

            <div>
              <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showAuthPassword ? "text" : "password"}
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword(!showAuthPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? "text-[#77777a] hover:text-[#141516]" : "text-[#8a8a8b] hover:text-white"} p-1 transition-colors cursor-pointer`}
                  aria-label={showAuthPassword ? "Hide password" : "Show password"}
                >
                  {showAuthPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3.5 px-6 rounded text-xs uppercase tracking-widest font-semibold text-[#101112] bg-[var(--color-gold)] hover:brightness-110 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer"
            >
              {authSubmitting ? (
                <div className="w-4 h-4 border-2 border-[#101112] border-t-transparent rounded-full animate-spin" />
              ) : isRegisterMode ? (
                "Daftar Akun Admin"
              ) : (
                "Masuk ke Admin"
              )}
            </button>
          </form>

          <div className={`mt-8 pt-6 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"} text-center`}>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError("");
              }}
              className={`text-xs ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} hover:text-[var(--color-gold)] transition-colors cursor-pointer`}
            >
              {isRegisterMode
                ? "Sudah punya akun? Masuk disini"
                : "Belum punya akun admin? Buat akun sekarang"}
            </button>
            <div className="mt-4">
              <Link href="/" className={`text-xs ${isLight ? "text-[#77777a] hover:text-[#141516]" : "text-[#8a8a8b] hover:text-white"} transition-colors`}>
                &larr; Kembali ke Website Publik
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tabs definitions in requested order
  const tabs = [
    { id: "stats", label: "📊 Statistik Website", desc: "Kunjungan, pengunjung & klik" },
    { id: "nav", label: "🏷️ Navigation & Brand", desc: "Logo brand & label navbar" },
    { id: "hero", label: "🚀 Hero / Intro", desc: "Greeting & headline utama" },
    { id: "socials", label: "🌐 Social Media", desc: "7 platform link sosmed" },
    { id: "about", label: "👤 About & CV", desc: "Bio, foto & tombol CV" },
    { id: "expertise", label: "⚡ Expertise Skills", desc: "Daftar kartu keahlian" },
    { id: "timeline", label: "⏳ Timelines", desc: "Experience & Education" },
    { id: "works", label: "🎨 Recent Works", desc: "Karya & proyek portofolio" },
    { id: "contact", label: "📬 Contact & Footer", desc: "Kontak & footer info" },
    { id: "settings", label: "⚙️ Settings & Theme", desc: "Dark/Light mode, Backup & Password" },
  ];

  return (
    <div className={`min-h-screen ${isLight ? "theme-light bg-[#f8f7f4] text-[#333336]" : "bg-[#0d0e0f] text-[#d0d0d0]"} transition-colors duration-300`}>
      {/* Top Fixed Header */}
      <header className={`sticky top-0 z-40 ${isLight ? "bg-[#ffffff]/95 border-[#e2e0d8]" : "bg-[#141516]/95 border-[#2c2c2d]"} backdrop-blur-md border-b px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between gap-3 transition-colors duration-300`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link href="/" className={`text-xl sm:text-2xl font-serif ${isLight ? "text-[#141516]" : "text-white"} hover:text-[var(--color-gold)] transition-colors flex-shrink-0`}>
            {formData.nav.brandName || "Portfolio"}
            <span className="text-[var(--color-gold)]">.</span>
          </Link>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest bg-[var(--color-gold)]/10 text-[var(--color-gold)] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-semibold border border-[var(--color-gold)]/20 whitespace-nowrap">
            CMS Admin
          </span>
          <span className={`hidden md:inline-block text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
            Mode: <strong className={`uppercase ${isLight ? "text-[#141516]" : "text-white"}`}>{formData.themeMode || "dark"}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-x-auto no-scrollbar py-0.5">
          <Link
            href="/"
            target="_blank"
            className={`text-[10px] sm:text-xs tracking-wider uppercase ${isLight ? "text-[#555558] hover:text-[#141516] border-[#e2e0d8]" : "text-[#8a8a8b] hover:text-white border-[#2c2c2d]"} px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border hover:border-[var(--color-gold)] transition-colors whitespace-nowrap`}
          >
            Preview ↗
          </Link>

          <button
            type="button"
            onClick={handleLoadSamples}
            className="text-[10px] sm:text-xs tracking-wider uppercase text-[var(--color-gold)] hover:brightness-110 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-colors cursor-pointer whitespace-nowrap hidden sm:inline-flex"
            title="Muat contoh template data untuk pengujian"
          >
            Contoh Template
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] sm:text-xs tracking-wider uppercase text-red-500 hover:text-red-400 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border border-red-500/30 hover:border-red-500 transition-colors cursor-pointer whitespace-nowrap hidden sm:inline-flex"
            title="Kosongkan semua data website"
          >
            Kosongkan
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-[#101112] bg-[var(--color-gold)] hover:brightness-110 px-3 sm:px-5 py-1.5 sm:py-2 rounded transition-all shadow disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
          >
            {saveStatus === "saving" ? (
              <>
                <div className="w-3 h-3 border-2 border-[#101112] border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : saveStatus === "saved" ? (
              <span>✓ Tersimpan!</span>
            ) : (
              <span>Simpan</span>
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className={`text-[10px] sm:text-xs tracking-wider uppercase ${isLight ? "text-[#555558] hover:text-[#141516] border-[#e2e0d8]" : "text-[#8a8a8b] hover:text-white border-[#2c2c2d]"} px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border transition-colors cursor-pointer whitespace-nowrap`}
            title={`Logged in as ${user.email}`}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Scrolling Tabs Menu (Slideable / Swipeable below Topbar) */}
      <div className={`lg:hidden sticky top-[49px] sm:top-[57px] z-30 ${isLight ? "bg-[#ffffff]/95 border-[#e2e0d8]" : "bg-[#141516]/95 border-[#2c2c2d]"} backdrop-blur-md border-b px-3 sm:px-4 py-2 transition-colors duration-300 shadow-sm`}>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? "text-[#77777a]" : "text-[#8a8a8b]"} flex items-center space-x-1.5`}>
            <span>📑 Menu Pengaturan</span>
            <span className="text-[10px] text-[var(--color-gold)] font-bold animate-pulse">➔ Geser</span>
          </span>
          <span className="text-[10px] text-[var(--color-gold)] font-mono uppercase font-semibold truncate max-w-[150px]">
            {tabs.find((t) => t.id === activeTab)?.label.split(" ")[0]} {activeTab}
          </span>
        </div>

        {/* Scrollable Container with Smooth Touch Slider */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-gold)] text-[#101112] font-semibold shadow-md scale-[1.02]"
                    : isLight
                    ? "bg-[#f3f1eb] text-[#555558] border border-[#e2e0d8] hover:bg-[#eae7df]"
                    : "bg-[#101112] text-[#8a8a8b] border border-[#2c2c2d] hover:bg-[#1a1c1d] hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-5 sm:py-8 pb-28 sm:pb-32">
        {/* Notification Toast */}
        {saveStatus === "saved" && (
          <div className="mb-6 p-4 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center justify-between animate-fade-in-down">
            <span>✓ Perubahan berhasil disimpan ke Cloud Firestore dan tersinkronisasi di website publik!</span>
          </div>
        )}
        {saveStatus === "error" && (
          <div className="mb-6 p-4 rounded bg-red-950/60 border border-red-700/60 text-red-200 text-xs animate-fade-in-down">
            Gagal menyimpan: {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Vertical Sidebar on Desktop (Sticky) */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 z-30">
            <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-3 max-h-[calc(100vh-7.5rem)] overflow-y-auto transition-colors duration-300`}>
              <div className={`px-3 py-2 text-[11px] uppercase tracking-widest ${isLight ? "text-[#77777a] border-[#e2e0d8]" : "text-[#8a8a8b] border-[#2c2c2d]/70"} font-semibold border-b mb-2`}>
                Menu Pengaturan
              </div>
              <nav className="space-y-1" aria-label="Admin Navigation Tabs">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-sm transition-all flex flex-col group cursor-pointer ${
                        isActive
                          ? "bg-[var(--color-gold)] text-[#101112] font-semibold shadow-md"
                          : isLight
                          ? "text-[#555558] hover:text-[#141516] hover:bg-[#f3f1eb]"
                          : "text-[#8a8a8b] hover:text-white hover:bg-[#1a1c1d]"
                      }`}
                    >
                      <span className="text-xs font-medium">{tab.label}</span>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          isActive
                            ? "text-[#101112]/80"
                            : isLight
                            ? "text-[#88888b] group-hover:text-[#555558]"
                            : "text-[#8a8a8b]/60 group-hover:text-[#8a8a8b]"
                        }`}
                      >
                        {tab.desc}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className={`mt-4 pt-3 border-t ${isLight ? "border-[#e2e0d8] text-[#77777a]" : "border-[#2c2c2d]/70 text-[#8a8a8b]"} px-3 text-[11px] flex justify-between items-center`}>
                <span>Tema: <strong className="text-[var(--color-gold)] uppercase">{formData.themeMode || "dark"}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="text-[var(--color-gold)] hover:underline cursor-pointer"
                >
                  Ubah
                </button>
              </div>
            </div>
          </aside>

          {/* Right Editor Panel */}
          <main className="lg:col-span-9">
            {/* TAB: STATISTIK WEBSITE */}
            {activeTab === "stats" && (
              <div className="space-y-8 animate-fade-scale">
                {/* Traffic Metrics Grid */}
                <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 transition-colors duration-300`}>
                  <div>
                    <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>Statistik Pengunjung &amp; Interaksi</h2>
                    <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                      Data metrik real-time kunjungan dan interaksi yang tercatat di Firebase Cloud Firestore.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {/* Metric 1: Pageviews */}
                    <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-5`}>
                      <div className={`flex items-center justify-between text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} uppercase tracking-wider mb-2`}>
                        <span>Total Kunjungan</span>
                        <span>👁️</span>
                      </div>
                      <div className={`text-3xl font-serif ${isLight ? "text-[#141516]" : "text-white"} font-bold`}>
                        {analytics.pageviews.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[var(--color-gold)] mt-2">
                        Total tayangan halaman web
                      </div>
                    </div>

                    {/* Metric 2: Unique Visitors */}
                    <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-5`}>
                      <div className={`flex items-center justify-between text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} uppercase tracking-wider mb-2`}>
                        <span>Pengunjung Unik</span>
                        <span>👥</span>
                      </div>
                      <div className={`text-3xl font-serif ${isLight ? "text-[#141516]" : "text-white"} font-bold`}>
                        {analytics.uniqueVisitors.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-500 mt-2">
                        Perangkat / user berbeda
                      </div>
                    </div>

                    {/* Metric 3: CV Downloads */}
                    <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-5`}>
                      <div className={`flex items-center justify-between text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} uppercase tracking-wider mb-2`}>
                        <span>Unduhan CV</span>
                        <span>📥</span>
                      </div>
                      <div className={`text-3xl font-serif ${isLight ? "text-[#141516]" : "text-white"} font-bold`}>
                        {analytics.cvDownloads.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[var(--color-gold)] mt-2">
                        Klik tombol Download CV
                      </div>
                    </div>

                    {/* Metric 4: Project Clicks */}
                    <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-5`}>
                      <div className={`flex items-center justify-between text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} uppercase tracking-wider mb-2`}>
                        <span>Klik Proyek</span>
                        <span>🔗</span>
                      </div>
                      <div className={`text-3xl font-serif ${isLight ? "text-[#141516]" : "text-white"} font-bold`}>
                        {analytics.projectClicks.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-teal-500 mt-2">
                        Klik link eksternal proyek
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: Navigation & Brand */}
            {activeTab === "nav" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 animate-fade-scale transition-colors duration-300`}>
                <div>
                  <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>1. Navigation Bar &amp; Brand</h2>
                  <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                    Ubah teks logo nama utama dan label menu navigasi header.
                  </p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Brand Name (Logo Teks)
                    </label>
                    <input
                      type="text"
                      value={formData.nav.brandName}
                      onChange={(e) => updateNav("brandName", e.target.value)}
                      placeholder="Contoh: Luther"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Nav Link 1 (Intro)
                    </label>
                    <input
                      type="text"
                      value={formData.nav.intro}
                      onChange={(e) => updateNav("intro", e.target.value)}
                      placeholder="Contoh: Intro"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Nav Link 2 (About)
                    </label>
                    <input
                      type="text"
                      value={formData.nav.about}
                      onChange={(e) => updateNav("about", e.target.value)}
                      placeholder="Contoh: About"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Nav Link 3 (Works)
                    </label>
                    <input
                      type="text"
                      value={formData.nav.works}
                      onChange={(e) => updateNav("works", e.target.value)}
                      placeholder="Contoh: Works"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Nav Link 4 (Say Hello / Contact)
                    </label>
                    <input
                      type="text"
                      value={formData.nav.contact}
                      onChange={(e) => updateNav("contact", e.target.value)}
                      placeholder="Contoh: Say Hello"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Hero / Intro */}
            {activeTab === "hero" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 animate-fade-scale transition-colors duration-300`}>
                <div>
                  <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>2. Hero / Intro Section</h2>
                  <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                    Ubah teks greeting badge dan headline besar pembuka halaman.
                  </p>
                </div>

                <div className={`space-y-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Greeting Pretitle (cth: Hello World)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.greeting}
                      onChange={(e) => updateHero("greeting", e.target.value)}
                      placeholder="Contoh: Hello World"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Main Headline (Gunakan baris baru untuk memisahkan baris teks)
                    </label>
                    <textarea
                      rows={5}
                      value={formData.hero.headline}
                      onChange={(e) => updateHero("headline", e.target.value)}
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      placeholder="I am Luther,&#10;a digital designer&#10;&amp; frontend&#10;developer based&#10;in Somewhere."
                    />
                    <p className={`text-[11px] ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} mt-1`}>
                      Tip: Tekan Enter untuk membuat baris baru pada judul besar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Social Media Links */}
            {activeTab === "socials" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 animate-fade-scale transition-colors duration-300`}>
                <div>
                  <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>3. Social Media Links (Opsional)</h2>
                  <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                    Masukkan URL profil untuk 7 platform sosial. Jika dikosongkan, tombol tersebut tidak akan muncul di website.
                  </p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.socials.linkedin}
                      onChange={(e) => updateSocials("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Twitter / X URL
                    </label>
                    <input
                      type="url"
                      value={formData.socials.twitter}
                      onChange={(e) => updateSocials("twitter", e.target.value)}
                      placeholder="https://twitter.com/username"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={formData.socials.instagram}
                      onChange={(e) => updateSocials("instagram", e.target.value)}
                      placeholder="https://instagram.com/username"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Dribbble URL
                    </label>
                    <input
                      type="url"
                      value={formData.socials.dribbble}
                      onChange={(e) => updateSocials("dribbble", e.target.value)}
                      placeholder="https://dribbble.com/username"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Behance URL
                    </label>
                    <input
                      type="url"
                      value={formData.socials.behance}
                      onChange={(e) => updateSocials("behance", e.target.value)}
                      placeholder="https://behance.net/username"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Pinterest URL
                    </label>
                    <input
                      type="url"
                      value={formData.socials.pinterest}
                      onChange={(e) => updateSocials("pinterest", e.target.value)}
                      placeholder="https://pinterest.com/username"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData.socials.github}
                      onChange={(e) => updateSocials("github", e.target.value)}
                      placeholder="https://github.com/username"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: About & Download CV */}
            {activeTab === "about" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 animate-fade-scale transition-colors duration-300`}>
                <div>
                  <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>4. About Section &amp; Download CV</h2>
                  <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                    Ubah judul, teks bio profil, foto About (mendukung link Google Drive), dan tombol CV.
                  </p>
                </div>

                <div className={`space-y-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Judul Section (cth: About)
                    </label>
                    <input
                      type="text"
                      value={formData.about.aboutTitle}
                      onChange={(e) => updateAbout("aboutTitle", e.target.value)}
                      placeholder="Contoh: About"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Deskripsi / Bio Text
                    </label>
                    <textarea
                      rows={4}
                      value={formData.about.aboutText}
                      onChange={(e) => updateAbout("aboutText", e.target.value)}
                      placeholder="Tuliskan biografi singkat atau deskripsi tentang Anda disini..."
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-8">
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Foto About (Link Gambar atau Link Google Drive)
                      </label>
                      <input
                        type="text"
                        value={formData.about.aboutImage}
                        onChange={(e) => updateAbout("aboutImage", e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing atau URL gambar"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                      <p className="text-[11px] text-[var(--color-gold)] mt-1.5 flex items-center space-x-1">
                        <span>💡</span>
                        <span>Anda dapat memasukkan link share Google Drive apa saja; sistem akan mengonversinya otomatis!</span>
                      </p>
                    </div>

                    <div className="md:col-span-4">
                      <span className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Live Preview
                      </span>
                      <div className={`relative w-28 h-36 rounded ${isLight ? "bg-[#f8f7f4] border-[#dcd8cf]" : "bg-[#101112] border-[#2c2c2d]"} border overflow-hidden`}>
                        {formData.about.aboutImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formatImageUrl(formData.about.aboutImage)}
                            alt="About preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-[10px] ${isLight ? "text-[#88888b]" : "text-[#8a8a8b]"} text-center p-2`}>
                            Belum ada foto
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                    <div>
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Teks Tombol CV (cth: Download CV)
                      </label>
                      <input
                        type="text"
                        value={formData.about.cvText}
                        onChange={(e) => updateAbout("cvText", e.target.value)}
                        placeholder="Contoh: Download CV"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Link File / URL CV (Google Drive link / direct URL)
                      </label>
                      <input
                        type="text"
                        value={formData.about.cvUrl}
                        onChange={(e) => updateAbout("cvUrl", e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing atau #"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Expertise */}
            {activeTab === "expertise" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 animate-fade-scale transition-colors duration-300`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>5. Expertise &amp; Skills</h2>
                    <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                      Kelola judul section keahlian dan daftar skill cardbox (tambah, edit, hapus).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addSkill}
                    className="text-xs uppercase tracking-wider text-[#101112] bg-[var(--color-gold)] hover:brightness-110 px-4 py-2 rounded font-semibold transition-colors cursor-pointer"
                  >
                    + Tambah Skill
                  </button>
                </div>

                <div className={`space-y-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Judul Section Expertise
                    </label>
                    <input
                      type="text"
                      value={formData.expertise.title}
                      onChange={(e) => updateExpertiseTitle(e.target.value)}
                      placeholder="Contoh: Expertise"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-3 font-medium`}>
                      Daftar Skill Cards
                    </label>
                    {formData.expertise.skills.length > 0 ? (
                      <div className="space-y-3">
                        {formData.expertise.skills.map((skill, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <span className={`text-xs font-mono ${isLight ? "text-[#77777a]" : "text-[#8a8a8b]"} w-6`}>0{index + 1}.</span>
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => updateSkill(index, e.target.value)}
                              placeholder="Nama Keahlian / Skill (contoh: UI/UX Design, React.js)"
                              className={`flex-1 ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                            />
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="text-xs text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Hapus skill ini"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs ${isLight ? "text-[#77777a]" : "text-[#8a8a8b]"}`}>Belum ada skill yang ditambahkan. Klik tombol &quot;+ Tambah Skill&quot; di atas.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Timeline */}
            {activeTab === "timeline" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-8 animate-fade-scale transition-colors duration-300`}>
                <div>
                  <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>6. Experience &amp; Education Timelines</h2>
                  <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                    Kelola riwayat karir dan pendidikan beserta detail waktu dan penjelasannya.
                  </p>
                </div>

                {/* Experience Sub-section */}
                <div className={`space-y-4 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif text-[var(--color-gold)]">Experience Section</h3>
                    <button
                      type="button"
                      onClick={() => addTimelineItem("experience")}
                      className="text-xs uppercase tracking-wider text-[#101112] bg-[var(--color-gold)] hover:brightness-110 px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer"
                    >
                      + Tambah Pengalaman
                    </button>
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                      Judul Section (cth: Experience)
                    </label>
                    <input
                      type="text"
                      value={formData.timeline.experienceTitle}
                      onChange={(e) => updateTimelineTitle("experienceTitle", e.target.value)}
                      placeholder="Contoh: Experience"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div className="space-y-4 mt-4">
                    {formData.timeline.experienceItems.map((item, index) => (
                      <div
                        key={item.id || index}
                        className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-4 sm:p-6 space-y-4 relative`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase font-mono text-[var(--color-gold)] font-semibold">
                            Experience #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTimelineItem("experience", index)}
                            className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
                          >
                            Hapus Item
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                              Perusahaan / Title
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateTimelineItem("experience", index, "title", e.target.value)}
                              placeholder="Nama Perusahaan (contoh: Dropbox, Google)"
                              className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                            />
                          </div>

                          <div>
                            <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                              Role / Posisi
                            </label>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => updateTimelineItem("experience", index, "role", e.target.value)}
                              placeholder="Posisi / Jabatan (contoh: Senior Product Designer)"
                              className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                            />
                          </div>

                          <div>
                            <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                              Periode / Waktu
                            </label>
                            <input
                              type="text"
                              value={item.timeframe}
                              onChange={(e) => updateTimelineItem("experience", index, "timeframe", e.target.value)}
                              placeholder="Periode Waktu (contoh: August 2019 - Present)"
                              className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                            Deskripsi
                          </label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => updateTimelineItem("experience", index, "description", e.target.value)}
                            placeholder="Tuliskan ringkasan peran, tanggung jawab, atau pencapaian..."
                            className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm leading-relaxed focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Sub-section */}
                <div className={`space-y-4 pt-6 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif text-[var(--color-gold)]">Education Section</h3>
                    <button
                      type="button"
                      onClick={() => addTimelineItem("education")}
                      className="text-xs uppercase tracking-wider text-[#101112] bg-[var(--color-gold)] hover:brightness-110 px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer"
                    >
                      + Tambah Pendidikan
                    </button>
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                      Judul Section (cth: Education)
                    </label>
                    <input
                      type="text"
                      value={formData.timeline.educationTitle}
                      onChange={(e) => updateTimelineTitle("educationTitle", e.target.value)}
                      placeholder="Contoh: Education"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div className="space-y-4 mt-4">
                    {formData.timeline.educationItems.map((item, index) => (
                      <div
                        key={item.id || index}
                        className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-4 sm:p-6 space-y-4 relative`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase font-mono text-[var(--color-gold)] font-semibold">
                            Education #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTimelineItem("education", index)}
                            className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
                          >
                            Hapus Item
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                              Institusi / Universitas
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateTimelineItem("education", index, "title", e.target.value)}
                              placeholder="Nama Universitas / Institusi (contoh: University of Life)"
                              className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                            />
                          </div>

                          <div>
                            <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                              Gelar / Bidang Studi
                            </label>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => updateTimelineItem("education", index, "role", e.target.value)}
                              placeholder="Gelar / Program Studi (contoh: Master in Graphic Design)"
                              className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                            />
                          </div>

                          <div>
                            <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                              Tahun / Waktu
                            </label>
                            <input
                              type="text"
                              value={item.timeframe}
                              onChange={(e) => updateTimelineItem("education", index, "timeframe", e.target.value)}
                              placeholder="Tahun / Periode (contoh: October 2015 - July 2017)"
                              className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                            Deskripsi
                          </label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => updateTimelineItem("education", index, "description", e.target.value)}
                            placeholder="Tuliskan ringkasan kegiatan, fokus studi, atau penghargaan..."
                            className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm leading-relaxed focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: Recent Works */}
            {activeTab === "works" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-8 animate-fade-scale transition-colors duration-300`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>7. Recent Works &amp; Projects</h2>
                    <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                      Kelola proyek portofolio, tags/kategori, gambar preview (Google Drive / URL), deskripsi, dan link proyek opsional.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addProject}
                    className="text-xs uppercase tracking-wider text-[#101112] bg-[var(--color-gold)] hover:brightness-110 px-4 py-2 rounded font-semibold transition-colors cursor-pointer"
                  >
                    + Tambah Proyek Baru
                  </button>
                </div>

                <div className={`space-y-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                      Judul Section (cth: Recent Works)
                    </label>
                    <input
                      type="text"
                      value={formData.works.worksTitle}
                      onChange={(e) => updateWorks("worksTitle", e.target.value)}
                      placeholder="Contoh: Recent Works"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                      Deskripsi Header Works
                    </label>
                    <textarea
                      rows={2}
                      value={formData.works.worksDescription}
                      onChange={(e) => updateWorks("worksDescription", e.target.value)}
                      placeholder="Deskripsi pembuka bagian karya portofolio..."
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  {/* Projects List */}
                  <div className="space-y-6 pt-4">
                    <h3 className="text-sm uppercase tracking-wider text-[var(--color-gold)] font-semibold">
                      Daftar Proyek Portofolio ({formData.works.projects.length})
                    </h3>

                    {formData.works.projects.map((project, index) => (
                      <div
                        key={project.id || index}
                        className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded-sm p-6 space-y-6`}
                      >
                        <div className={`flex items-center justify-between border-b ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"} pb-3`}>
                          <span className={`text-sm font-serif ${isLight ? "text-[#141516]" : "text-white"} font-semibold`}>
                            #{index + 1}. {project.title || "Untitled Project"}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProject(index)}
                            className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
                          >
                            Hapus Proyek Ini
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Left Fields */}
                          <div className="md:col-span-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                  Judul Proyek (cth: Retro Camera.)
                                </label>
                                <input
                                  type="text"
                                  value={project.title}
                                  onChange={(e) => updateProject(index, "title", e.target.value)}
                                  placeholder="Judul Proyek (contoh: Retro Camera.)"
                                  className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                                />
                              </div>

                              <div>
                                <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                  Kategori Utama (cth: Website, Product Design)
                                </label>
                                <input
                                  type="text"
                                  value={project.category}
                                  onChange={(e) => updateProject(index, "category", e.target.value)}
                                  placeholder="Kategori (contoh: Website / Branding / Mobile App)"
                                  className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                                />
                              </div>
                            </div>

                            {/* Tags Input using ProjectTagsInput Component */}
                            <div>
                              <ProjectTagsInput
                                tags={project.tags || []}
                                onChange={(newTags) => updateProject(index, "tags", newTags)}
                                isLight={isLight}
                              />
                            </div>

                            <div>
                              <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                Deskripsi Detail Modal Proyek
                              </label>
                              <textarea
                                rows={3}
                                value={project.description}
                                onChange={(e) => updateProject(index, "description", e.target.value)}
                                placeholder="Penjelasan lengkap mengenai proyek saat popup modal dibuka..."
                                className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm leading-relaxed focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                  Cover Image (Google Drive / URL)
                                </label>
                                <input
                                  type="text"
                                  value={project.image}
                                  onChange={(e) => updateProject(index, "image", e.target.value)}
                                  placeholder="https://drive.google.com/... atau URL gambar cover"
                                  className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                                />
                              </div>

                              <div>
                                <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                  Gallery / Detail Image (Google Drive / URL)
                                </label>
                                <input
                                  type="text"
                                  value={project.galleryImage}
                                  onChange={(e) => updateProject(index, "galleryImage", e.target.value)}
                                  placeholder="https://drive.google.com/... atau URL gambar galeri modal"
                                  className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                                />
                              </div>
                            </div>

                            <div>
                              <label className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                Project External Link (Opsional, cth: Behance, Live Site)
                              </label>
                              <input
                                type="url"
                                value={project.link || ""}
                                onChange={(e) => updateProject(index, "link", e.target.value)}
                                placeholder="https://behance.net/... atau link demo live (opsional)"
                                className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#141516] border-[#2c2c2d] text-white"} border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                              />
                            </div>
                          </div>

                          {/* Right Previews */}
                          <div className="md:col-span-4 flex flex-col space-y-4">
                            <div>
                              <span className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                Preview Cover Image
                              </span>
                              <div className={`relative aspect-[16/10] rounded ${isLight ? "bg-[#ffffff] border-[#dcd8cf]" : "bg-[#141516] border-[#2c2c2d]"} border overflow-hidden`}>
                                {project.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={formatImageUrl(project.image)}
                                    alt="Cover preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center text-[10px] ${isLight ? "text-[#88888b]" : "text-[#8a8a8b]"} p-2 text-center`}>
                                    Belum ada cover
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <span className={`block text-[11px] uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-1 font-medium`}>
                                Preview Gallery Image
                              </span>
                              <div className={`relative aspect-[16/10] rounded ${isLight ? "bg-[#ffffff] border-[#dcd8cf]" : "bg-[#141516] border-[#2c2c2d]"} border overflow-hidden`}>
                                {project.galleryImage || project.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={formatImageUrl(project.galleryImage || project.image)}
                                    alt="Gallery preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center text-[10px] ${isLight ? "text-[#88888b]" : "text-[#8a8a8b]"} p-2 text-center`}>
                                    Belum ada gallery
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: Contact & Footer */}
            {activeTab === "contact" && (
              <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 animate-fade-scale transition-colors duration-300`}>
                <div>
                  <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>8. Contact &amp; Footer</h2>
                  <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                    Ubah teks Get In Touch, Reach me at, email, telephone (opsional), lokasi, dan tinjau copyright footer yang terkunci.
                  </p>
                </div>

                <div className={`space-y-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Judul Section Contact (cth: Get In Touch)
                    </label>
                    <input
                      type="text"
                      value={formData.contact.contactTitle}
                      onChange={(e) => updateContact("contactTitle", e.target.value)}
                      placeholder="Contoh: Get In Touch"
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                      Deskripsi / Headline Contact
                    </label>
                    <textarea
                      rows={3}
                      value={formData.contact.contactDescription}
                      onChange={(e) => updateContact("contactDescription", e.target.value)}
                      placeholder="Tuliskan pesan ajakan atau informasi kontak untuk menghubugi Anda..."
                      className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                    />
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                    <div>
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Judul Kolom Kontak (cth: Reach me at)
                      </label>
                      <input
                        type="text"
                        value={formData.contact.reachMeTitle}
                        onChange={(e) => updateContact("reachMeTitle", e.target.value)}
                        placeholder="Contoh: Reach me at"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Judul Kolom Social Media (cth: Social)
                      </label>
                      <input
                        type="text"
                        value={formData.contact.socialTitle || ""}
                        onChange={(e) => updateContact("socialTitle", e.target.value)}
                        placeholder="Contoh: Social"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => updateContact("email", e.target.value)}
                        placeholder="Contoh: sayhello@luther.com"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Telepon (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formData.contact.phone}
                        onChange={(e) => updateContact("phone", e.target.value)}
                        placeholder="Contoh: +197 543 2345 (opsional)"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                        Alamat / Lokasi (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formData.contact.location || ""}
                        onChange={(e) => updateContact("location", e.target.value)}
                        placeholder="Contoh: 1600 Amphitheatre Parkway, Mountain View, CA 94043"
                        className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                      />
                    </div>
                  </div>

                  {/* Fixed Footer Copyright preview */}
                  <div className={`pt-6 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} font-medium`}>
                        🔒 Footer Copyright (Permanen &amp; Tidak Dapat Diubah)
                      </span>
                    </div>
                    <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8] text-[#555558]" : "bg-[#101112] border-[#2c2c2d]/60 text-[#8a8a8b]"} border rounded p-4 text-xs select-none opacity-80`}>
                      {FIXED_FOOTER_COPYRIGHT.text}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: Settings & Theme Mode & Backup */}
            {activeTab === "settings" && (
              <div className="space-y-8 animate-fade-scale">
                {/* Backup & Restore Database Section */}
                <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 transition-colors duration-300`}>
                  <div>
                    <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>Backup &amp; Restore Database (JSON)</h2>
                    <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                      Unduh seluruh data website portfolio ke file <code className="text-[var(--color-gold)]">database.json</code> sebagai cadangan, atau unggah file <code className="text-[var(--color-gold)]">database.json</code> untuk memulihkan atau memindahkan data ke Firestore.
                    </p>
                  </div>

                  {importStatus === "success" && (
                    <div className="p-4 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs animate-fade-in-down">
                      ✓ File <code>database.json</code> berhasil diimpor dan disimpan ke Cloud Firestore! Halaman web telah diperbarui.
                    </div>
                  )}

                  {importStatus === "error" && (
                    <div className="p-4 rounded bg-red-950/60 border border-red-700/60 text-red-200 text-xs animate-fade-in-down">
                      Gagal mengimpor database: {importError}
                    </div>
                  )}

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                    {/* Export Card */}
                    <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-5 flex flex-col justify-between space-y-4`}>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">⬇️</span>
                          <h3 className={`text-sm font-semibold ${isLight ? "text-[#141516]" : "text-white"}`}>Download database.json</h3>
                        </div>
                        <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} leading-relaxed`}>
                          Ekspor seluruh konfigurasi, teks bio, keahlian, riwayat, proyek, dan kontak ke file <code>database.json</code>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportDatabase}
                        className="w-full py-2.5 px-4 rounded text-xs uppercase tracking-wider font-semibold text-[#101112] bg-[var(--color-gold)] hover:brightness-110 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                      >
                        <span>📥 Download database.json</span>
                      </button>
                    </div>

                    {/* Import Card */}
                    <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-5 flex flex-col justify-between space-y-4`}>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">⬆️</span>
                          <h3 className={`text-sm font-semibold ${isLight ? "text-[#141516]" : "text-white"}`}>Upload / Import database.json</h3>
                        </div>
                        <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} leading-relaxed`}>
                          Pilih file <code>database.json</code> dari perangkat Anda untuk memulihkan dan menyimpan seluruh data langsung ke Firestore.
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".json,application/json"
                          onChange={handleImportDatabase}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={importStatus === "loading"}
                          className={`w-full py-2.5 px-4 rounded text-xs uppercase tracking-wider font-semibold ${isLight ? "border-[#dcd8cf] bg-[#ffffff] text-[#141516] hover:bg-[#f3f1eb]" : "border-[#2c2c2d] bg-[#141516] text-white hover:bg-[#1a1c1d]"} border hover:border-[var(--color-gold)] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50`}
                        >
                          {importStatus === "loading" ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span>Mengimpor File...</span>
                            </>
                          ) : (
                            <span>📂 Upload database.json</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Mode Section */}
                <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 transition-colors duration-300`}>
                  <div>
                    <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>Tema Tampilan Website</h2>
                    <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                      Pilih tema tampilan utama website (Dark Mode atau Light Mode). Tampilan admin ini akan otomatis mengikuti mode yang Anda pilih.
                    </p>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                    {/* Dark Mode Card */}
                    <div
                      onClick={() => updateThemeMode("dark")}
                      className={`cursor-pointer rounded-sm border p-5 transition-all flex flex-col justify-between ${
                        formData.themeMode === "dark"
                          ? "border-[var(--color-gold)] bg-[#1a1c1e] shadow-lg shadow-[var(--color-gold)]/10"
                          : isLight
                          ? "border-[#e2e0d8] bg-[#f8f7f4] hover:border-[var(--color-gold)]"
                          : "border-[#2c2c2d] bg-[#101112] hover:border-[#8a8a8b]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-serif ${formData.themeMode === "dark" ? "text-white" : isLight ? "text-[#141516]" : "text-white"} font-semibold flex items-center space-x-2`}>
                            <span>🌙</span>
                            <span>Dark Mode (Original)</span>
                          </span>
                          {formData.themeMode === "dark" && (
                            <span className="text-[10px] uppercase font-bold text-[#101112] bg-[var(--color-gold)] px-2 py-0.5 rounded">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${formData.themeMode === "dark" ? "text-[#8a8a8b]" : isLight ? "text-[#666668]" : "text-[#8a8a8b]"} leading-relaxed`}>
                          Nuansa gelap elegan Luther template dengan latar belakang charcoal (#101112) dan aksen emas (#eabe7c).
                        </p>
                      </div>

                      <div className="mt-6 flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-[#101112] border border-[#2c2c2d]" />
                        <div className="w-5 h-5 rounded-full bg-[#eabe7c]" />
                        <div className="w-5 h-5 rounded-full bg-[#23967f]" />
                      </div>
                    </div>

                    {/* Light Mode Card */}
                    <div
                      onClick={() => updateThemeMode("light")}
                      className={`cursor-pointer rounded-sm border p-5 transition-all flex flex-col justify-between ${
                        formData.themeMode === "light"
                          ? "border-[var(--color-gold)] bg-[#ffffff] shadow-lg shadow-[var(--color-gold)]/10"
                          : isLight
                          ? "border-[#e2e0d8] bg-[#f8f7f4] hover:border-[var(--color-gold)]"
                          : "border-[#2c2c2d] bg-[#101112] hover:border-[#8a8a8b]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-serif ${formData.themeMode === "light" ? (isLight ? "text-[#141516]" : "text-white") : isLight ? "text-[#141516]" : "text-white"} font-semibold flex items-center space-x-2`}>
                            <span>☀️</span>
                            <span>Light Mode (Clean Modern)</span>
                          </span>
                          {formData.themeMode === "light" && (
                            <span className="text-[10px] uppercase font-bold text-[#101112] bg-[var(--color-gold)] px-2 py-0.5 rounded">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"} leading-relaxed`}>
                          Nuansa terang, bersih, dan mewah dengan latar paper/linen (#f8f7f4), kartu putih bersih, dan aksen emas hangat.
                        </p>
                      </div>

                      <div className="mt-6 flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-[#f8f7f4] border border-[#e2e0d8]" />
                        <div className="w-5 h-5 rounded-full bg-[#ffffff] border border-[#e2e0d8]" />
                        <div className="w-5 h-5 rounded-full bg-[#cfa15c]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accent Color Section (Gold Customization) */}
                <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 transition-colors duration-300`}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>Warna Aksen Website (Gold #eabe7c)</h2>
                      <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                        Kustomisasi seluruh elemen berwarna emas di website (tombol, link aktif, garis judul, badge, ambient glow, dan hover) secara instan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateAccentColor("#eabe7c")}
                      className={`text-xs tracking-wider uppercase text-[var(--color-gold)] hover:brightness-110 px-3.5 py-1.5 rounded border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-colors cursor-pointer`}
                      title="Kembalikan warna aksen ke standar Luther Gold (#eabe7c)"
                    >
                      ↺ Reset ke Default (#eabe7c)
                    </button>
                  </div>

                  <div className={`space-y-6 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                    {/* Color Input Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-6 space-y-3">
                        <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} font-medium`}>
                          Pilih Warna Kustom / Kode HEX
                        </label>
                        <div className="flex items-center space-x-3">
                          {/* HTML5 Native Color Picker */}
                          <div className={`relative w-12 h-11 rounded border ${isLight ? "border-[#dcd8cf]" : "border-[#2c2c2d]"} overflow-hidden cursor-pointer flex-shrink-0`}>
                            <input
                              type="color"
                              value={formData.accentColor || "#eabe7c"}
                              onChange={(e) => updateAccentColor(e.target.value)}
                              className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 bg-transparent"
                              title="Klik untuk memilih warna kustom dari color picker"
                            />
                          </div>

                          {/* Hex Text Input */}
                          <input
                            type="text"
                            value={formData.accentColor || "#eabe7c"}
                            onChange={(e) => updateAccentColor(e.target.value)}
                            placeholder="#eabe7c"
                            maxLength={7}
                            className={`flex-1 ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                          />
                        </div>
                      </div>

                      {/* Live Preview Demonstration Box */}
                      <div className="md:col-span-6">
                        <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                          Live Preview Warna Aksen
                        </label>
                        <div className={`${isLight ? "bg-[#f8f7f4] border-[#e2e0d8]" : "bg-[#101112] border-[#2c2c2d]"} border rounded p-4 flex flex-wrap items-center justify-between gap-3`}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: formData.accentColor || "#eabe7c" }}
                            />
                            <span
                              className="text-xs font-serif font-semibold"
                              style={{ color: formData.accentColor || "#eabe7c" }}
                            >
                              Accent Text
                            </span>
                          </div>

                          <div
                            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold"
                            style={{
                              backgroundColor: `${formData.accentColor || "#eabe7c"}25`,
                              color: formData.accentColor || "#eabe7c",
                            }}
                          >
                            Tag Badge
                          </div>

                          <button
                            type="button"
                            className="text-xs uppercase font-semibold px-4 py-1.5 rounded-sm text-[#101112] transition-all cursor-pointer shadow-sm"
                            style={{ backgroundColor: formData.accentColor || "#eabe7c" }}
                          >
                            Contoh Tombol
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Curated Preset Swatches */}
                    <div>
                      <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-3 font-medium`}>
                        Pilihan Palet Warna Populer (Klik untuk Menerapkan)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { name: "Luther Gold", hex: "#eabe7c", desc: "Default Hangat" },
                          { name: "Emerald Teal", hex: "#23967f", desc: "Zamrud Modern" },
                          { name: "Electric Sky", hex: "#38bdf8", desc: "Biru Langit" },
                          { name: "Royal Purple", hex: "#a855f7", desc: "Ungu Mewah" },
                          { name: "Rose Gold", hex: "#fb7185", desc: "Merah Muda Mewah" },
                          { name: "Amber Sunset", hex: "#f59e0b", desc: "Oranye Senja" },
                          { name: "Ruby Crimson", hex: "#f43f5e", desc: "Merah Tegas" },
                          { name: "Modern Silver", hex: "#94a3b8", desc: "Perak Minimalis" },
                        ].map((preset) => {
                          const isCurrent =
                            (formData.accentColor || "#eabe7c").toLowerCase() === preset.hex.toLowerCase();
                          return (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => updateAccentColor(preset.hex)}
                              className={`p-3 rounded border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                                isCurrent
                                  ? isLight
                                    ? "border-[var(--color-gold)] bg-[#ffffff] ring-2 ring-[var(--color-gold)]"
                                    : "border-white bg-[#1a1c1e] ring-1 ring-white"
                                  : isLight
                                  ? "border-[#e2e0d8] bg-[#f8f7f4] hover:border-[var(--color-gold)]"
                                  : "border-[#2c2c2d] bg-[#101112] hover:border-[#8a8a8b]"
                              }`}
                            >
                              <div
                                className="w-6 h-6 rounded-full flex-shrink-0 shadow-sm flex items-center justify-center text-xs text-[#101112] font-bold"
                                style={{ backgroundColor: preset.hex }}
                              >
                                {isCurrent ? "✓" : ""}
                              </div>
                              <div className="overflow-hidden">
                                <div className={`text-xs font-medium ${isLight ? "text-[#141516]" : "text-white"} truncate`}>{preset.name}</div>
                                <div className={`text-[10px] ${isLight ? "text-[#77777a]" : "text-[#8a8a8b]"} font-mono`}>{preset.hex}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className={`${isLight ? "bg-[#ffffff] border-[#e2e0d8] shadow-md" : "bg-[#141516] border-[#2c2c2d] shadow-xl"} border rounded-sm p-6 sm:p-8 space-y-6 transition-colors duration-300`}>
                  <div>
                    <h2 className={`text-xl font-serif ${isLight ? "text-[#141516]" : "text-white"} mb-1`}>Ubah Password Admin</h2>
                    <p className={`text-xs ${isLight ? "text-[#666668]" : "text-[#8a8a8b]"}`}>
                      Perbarui password login admin Firebase Anda secara berkala untuk menjaga keamanan website.
                    </p>
                  </div>

                  {passwordChangeStatus === "success" && (
                    <div className="p-4 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs animate-fade-in-down">
                      {passwordChangeMsg}
                    </div>
                  )}

                  {passwordChangeStatus === "error" && (
                    <div className="p-4 rounded bg-red-950/60 border border-red-700/60 text-red-200 text-xs animate-fade-in-down">
                      {passwordChangeMsg}
                    </div>
                  )}

                  <form onSubmit={handleChangePasswordSubmit} className={`space-y-4 pt-4 border-t ${isLight ? "border-[#e2e0d8]" : "border-[#2c2c2d]"}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                          Password Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? "text-[#77777a] hover:text-[#141516]" : "text-[#8a8a8b] hover:text-white"} p-1 transition-colors cursor-pointer`}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                          >
                            {showNewPassword ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs uppercase tracking-wider ${isLight ? "text-[#555558]" : "text-[#8a8a8b]"} mb-2 font-medium`}>
                          Konfirmasi Password Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            className={`w-full ${isLight ? "bg-[#ffffff] border-[#dcd8cf] text-[#141516]" : "bg-[#101112] border-[#2c2c2d] text-white"} border rounded px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? "text-[#77777a] hover:text-[#141516]" : "text-[#8a8a8b] hover:text-white"} p-1 transition-colors cursor-pointer`}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordChangeStatus === "loading"}
                        className="py-2.5 px-6 rounded text-xs uppercase tracking-widest font-semibold text-[#101112] bg-[var(--color-gold)] hover:brightness-110 transition-all disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
                      >
                        {passwordChangeStatus === "loading" ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[#101112] border-t-transparent rounded-full animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <span>Perbarui Password</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Save Action Bar */}
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center space-x-2 sm:space-x-3 ${isLight ? "bg-[#ffffff]/95 border-[#e2e0d8]" : "bg-[#141516]/90 border-[#2c2c2d]"} backdrop-blur-lg border p-2 sm:p-3 rounded-sm shadow-2xl transition-colors duration-300`}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="text-[11px] sm:text-xs tracking-widest uppercase font-semibold text-[#101112] bg-[var(--color-gold)] hover:brightness-110 px-4 sm:px-6 py-2.5 sm:py-3 rounded-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer whitespace-nowrap"
        >
          {saveStatus === "saving" ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[#101112] border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : saveStatus === "saved" ? (
            <span>✓ Berhasil Disimpan!</span>
          ) : (
            <span>Simpan Semua Perubahan</span>
          )}
        </button>
      </div>
    </div>
  );
}
