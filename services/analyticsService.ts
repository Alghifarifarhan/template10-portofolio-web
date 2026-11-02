import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AnalyticsStats {
  pageviews: number;
  uniqueVisitors: number;
  cvDownloads: number;
  projectClicks: number;
  lastUpdated?: string;
}

const STATS_DOC_PATH = "stats/analytics";
const STATS_LOCAL_CACHE = "portfolio_analytics_cache";

export const defaultAnalyticsStats: AnalyticsStats = {
  pageviews: 0,
  uniqueVisitors: 0,
  cvDownloads: 0,
  projectClicks: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Tracks a pageview. Increments pageviews, and if it's a first-time visitor on this device/session, increments uniqueVisitors.
 */
export async function trackPageView(): Promise<void> {
  if (typeof window === "undefined") return;

  // Don't track admin page views
  if (window.location.pathname.startsWith("/admin")) return;

  const hasVisitedSession = sessionStorage.getItem("portfolio_session_tracked");
  const isNewVisitor = !localStorage.getItem("portfolio_unique_visitor_id");

  if (!hasVisitedSession) {
    sessionStorage.setItem("portfolio_session_tracked", "true");
  }

  if (isNewVisitor) {
    const newVisitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("portfolio_unique_visitor_id", newVisitorId);
  }

  try {
    const statsRef = doc(db, "stats", "analytics");
    const snap = await getDoc(statsRef);

    if (!snap.exists()) {
      await setDoc(statsRef, {
        pageviews: 1,
        uniqueVisitors: 1,
        cvDownloads: 0,
        projectClicks: 0,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      const updatePayload: Record<string, any> = {
        pageviews: increment(1),
        lastUpdated: new Date().toISOString(),
      };

      if (isNewVisitor) {
        updatePayload.uniqueVisitors = increment(1);
      }

      await updateDoc(statsRef, updatePayload);
    }
  } catch (err) {
    console.warn("Analytics tracking error (Firestore):", err);
  }
}

/**
 * Tracks a CV Download click.
 */
export async function trackCvDownload(): Promise<void> {
  try {
    const statsRef = doc(db, "stats", "analytics");
    await updateDoc(statsRef, {
      cvDownloads: increment(1),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Track CV download error:", err);
  }
}

/**
 * Tracks an external Project link click.
 */
export async function trackProjectClick(): Promise<void> {
  try {
    const statsRef = doc(db, "stats", "analytics");
    await updateDoc(statsRef, {
      projectClicks: increment(1),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Track project click error:", err);
  }
}

/**
 * Fetches current analytics statistics.
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(STATS_LOCAL_CACHE);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
  }

  try {
    const statsRef = doc(db, "stats", "analytics");
    const snap = await getDoc(statsRef);
    if (snap.exists()) {
      const data = snap.data() as AnalyticsStats;
      if (typeof window !== "undefined") {
        localStorage.setItem(STATS_LOCAL_CACHE, JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn("Error fetching analytics stats:", err);
  }

  return defaultAnalyticsStats;
}

/**
 * Subscribes to real-time analytics updates.
 */
export function subscribeAnalytics(callback: (stats: AnalyticsStats) => void): () => void {
  try {
    const statsRef = doc(db, "stats", "analytics");
    const unsubscribe = onSnapshot(
      statsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const stats = docSnap.data() as AnalyticsStats;
          if (typeof window !== "undefined") {
            localStorage.setItem(STATS_LOCAL_CACHE, JSON.stringify(stats));
          }
          callback(stats);
        } else {
          callback(defaultAnalyticsStats);
        }
      },
      (error) => {
        console.warn("Analytics onSnapshot error:", error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Subscribe analytics error:", err);
    return () => {};
  }
}
