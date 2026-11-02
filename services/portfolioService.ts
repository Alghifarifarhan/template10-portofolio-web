import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FullPortfolioData } from "@/types";
import { emptyPortfolioData } from "@/data/portfolio-data";

const PORTFOLIO_DOC_PATH = "content/portfolio";
const LOCAL_STORAGE_KEY = "portfolio_content_cache";

/**
 * Retrieves the latest portfolio content from Firestore with instant localStorage fallback.
 */
export async function getPortfolioContent(): Promise<FullPortfolioData> {
  // 1. Read instant local cache if present
  let cachedData: FullPortfolioData | null = null;
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        cachedData = JSON.parse(local);
      } catch (e) {
        // invalid json
      }
    }
  }

  try {
    const docRef = doc(db, "content", "portfolio");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const firestoreData = docSnap.data() as Partial<FullPortfolioData>;
      const mergedData: FullPortfolioData = {
        ...emptyPortfolioData,
        ...firestoreData,
        nav: { ...emptyPortfolioData.nav, ...(firestoreData.nav || {}) },
        hero: { ...emptyPortfolioData.hero, ...(firestoreData.hero || {}) },
        socials: { ...emptyPortfolioData.socials, ...(firestoreData.socials || {}) },
        about: { ...emptyPortfolioData.about, ...(firestoreData.about || {}) },
        expertise: { ...emptyPortfolioData.expertise, ...(firestoreData.expertise || {}) },
        timeline: { ...emptyPortfolioData.timeline, ...(firestoreData.timeline || {}) },
        works: { ...emptyPortfolioData.works, ...(firestoreData.works || {}) },
        contact: { ...emptyPortfolioData.contact, ...(firestoreData.contact || {}) },
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
      }
      return mergedData;
    }
  } catch (error) {
    console.warn("Could not fetch from Firestore, relying on local cache:", error);
  }

  return cachedData || emptyPortfolioData;
}

/**
 * Saves updated portfolio content to Firestore and updates local cache.
 */
export async function savePortfolioContent(
  data: FullPortfolioData
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "content", "portfolio");
    await setDoc(docRef, data, { merge: true });

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save data to Firestore";
    console.error("Error saving portfolio data:", error);
    return { success: false, error: message };
  }
}

/**
 * Subscribes to realtime updates from Firestore for instant reactive updates.
 */
export function subscribePortfolioContent(
  callback: (data: FullPortfolioData) => void
): () => void {
  try {
    const docRef = doc(db, "content", "portfolio");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const firestoreData = docSnap.data() as Partial<FullPortfolioData>;
          const mergedData: FullPortfolioData = {
            ...emptyPortfolioData,
            ...firestoreData,
            nav: { ...emptyPortfolioData.nav, ...(firestoreData.nav || {}) },
            hero: { ...emptyPortfolioData.hero, ...(firestoreData.hero || {}) },
            socials: { ...emptyPortfolioData.socials, ...(firestoreData.socials || {}) },
            about: { ...emptyPortfolioData.about, ...(firestoreData.about || {}) },
            expertise: { ...emptyPortfolioData.expertise, ...(firestoreData.expertise || {}) },
            timeline: { ...emptyPortfolioData.timeline, ...(firestoreData.timeline || {}) },
            works: { ...emptyPortfolioData.works, ...(firestoreData.works || {}) },
            contact: { ...emptyPortfolioData.contact, ...(firestoreData.contact || {}) },
          };

          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
          }
          callback(mergedData);
        }
      },
      (error) => {
        console.warn("Firestore onSnapshot error:", error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Subscribe error:", err);
    return () => {};
  }
}
