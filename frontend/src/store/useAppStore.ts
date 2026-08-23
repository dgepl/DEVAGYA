import { create } from "zustand";
import { GeneratedPaperResponse } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "super_admin" | "student" | "parent" | "management";
  schoolName: string;
  schoolLogo?: string;
  board: string;
  subject?: string;
  classes?: string;
  isProfileComplete?: boolean;
  xp?: number;
  streak?: number;
  level?: number;
  coins?: number;
}

interface AppState {
  user: UserProfile;
  activePaper: GeneratedPaperResponse | null;
  savedPapers: GeneratedPaperResponse[];
  ocrDraftText: string;
  activeChildId: string;
  setUser: (user: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  switchRole: (role: "teacher" | "student" | "parent" | "super_admin") => void;
  setActivePaper: (paper: GeneratedPaperResponse | null) => void;
  savePaper: (paper: GeneratedPaperResponse) => void;
  deleteSavedPaper: (index: number) => void;
  setOcrDraftText: (text: string) => void;
  setActiveChildId: (childId: string) => void;
  initSession: () => void;
  logout: () => void;
}

const defaultUser: UserProfile = {
  id: "usr-guest",
  name: "Guest User",
  email: "",
  role: "student",
  schoolName: "",
  board: "CBSE",
  subject: "",
  classes: "Class 10",
  isProfileComplete: false,
  xp: 0,
  streak: 0,
  level: 1,
  coins: 0
};

const getInitialUser = (): UserProfile => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("devgya_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {
      console.error("Error reading stored user session", e);
    }
  }
  return defaultUser;
};

const getInitialSavedPapers = (email?: string): GeneratedPaperResponse[] => {
  if (typeof window !== "undefined") {
    try {
      const userKey = email ? `devgya_saved_papers_${email.trim().toLowerCase()}` : "devgya_saved_papers";
      const stored = localStorage.getItem(userKey) || localStorage.getItem("devgya_saved_papers");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
  }
  return [];
};

export const useAppStore = create<AppState>((set, get) => {
  const initialUser = getInitialUser();
  const initialPapers = getInitialSavedPapers(initialUser.email);

  return {
    user: initialUser,
    activePaper: null,
    savedPapers: initialPapers,
    ocrDraftText: "",
    activeChildId: "",
    setUser: (user) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("devgya_user", JSON.stringify(user));
        } catch (e) {}
      }
      // Load user-specific papers
      const userPapers = getInitialSavedPapers(user.email);
      set({ user, savedPapers: userPapers.length > 0 ? userPapers : get().savedPapers });

      // Fetch server history in background
      if (user.email && typeof window !== "undefined") {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        fetch(`${baseUrl}/generator/history?email=${encodeURIComponent(user.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.papers && Array.isArray(data.papers) && data.papers.length > 0) {
              const merged = [...data.papers];
              set({ savedPapers: merged });
              try {
                localStorage.setItem(`devgya_saved_papers_${user.email.trim().toLowerCase()}`, JSON.stringify(merged));
                localStorage.setItem("devgya_saved_papers", JSON.stringify(merged));
              } catch (e) {}
            }
          })
          .catch(() => {});
      }
    },
    updateUserProfile: (updates) => {
      set((state) => {
        const updatedUser = { ...state.user, ...updates };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("devgya_user", JSON.stringify(updatedUser));
          } catch (e) {}
        }
        return { user: updatedUser };
      });
    },
    initSession: () => {
      const user = getInitialUser();
      const userPapers = getInitialSavedPapers(user.email);
      set({ user, savedPapers: userPapers });
    },
    switchRole: (role) => set((state) => ({ user: { ...state.user, role } })),
    setActivePaper: (paper) => set({ activePaper: paper }),
    savePaper: (paper) => set((state) => {
      const filtered = state.savedPapers.filter(p => !(p.title === paper.title && p.class_name === paper.class_name));
      const updated = [paper, ...filtered];
      if (typeof window !== "undefined") {
        try {
          const emailKey = state.user?.email ? `devgya_saved_papers_${state.user.email.trim().toLowerCase()}` : "devgya_saved_papers";
          localStorage.setItem(emailKey, JSON.stringify(updated));
          localStorage.setItem("devgya_saved_papers", JSON.stringify(updated));

          // Sync to backend history in background
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
          fetch(`${baseUrl}/generator/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: state.user?.email || "guest@devgya.com", paper })
          }).catch(() => {});
        } catch (e) {}
      }
      return { savedPapers: updated };
    }),
    deleteSavedPaper: (index) => set((state) => {
      const paperToDelete = state.savedPapers[index];
      const updated = state.savedPapers.filter((_, i) => i !== index);
      if (typeof window !== "undefined") {
        try {
          const emailKey = state.user?.email ? `devgya_saved_papers_${state.user.email.trim().toLowerCase()}` : "devgya_saved_papers";
          localStorage.setItem(emailKey, JSON.stringify(updated));
          localStorage.setItem("devgya_saved_papers", JSON.stringify(updated));

          if (paperToDelete && state.user?.email) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
            fetch(`${baseUrl}/generator/history?title=${encodeURIComponent(paperToDelete.title)}&class_name=${encodeURIComponent(paperToDelete.class_name)}&email=${encodeURIComponent(state.user.email)}`, {
              method: "DELETE"
            }).catch(() => {});
          }
        } catch (e) {}
      }
      return { savedPapers: updated };
    }),
    setOcrDraftText: (ocrDraftText) => set({ ocrDraftText }),
    setActiveChildId: (activeChildId) => set({ activeChildId }),
    logout: () => {
      if (typeof window !== "undefined") {
        try {
          // Clear active session only, preserving user-keyed paper history in local & backend stores!
          localStorage.removeItem("devgya_user");
        } catch (e) {}
      }
      set({ user: defaultUser, activePaper: null, savedPapers: [] });
    }
  };
});
