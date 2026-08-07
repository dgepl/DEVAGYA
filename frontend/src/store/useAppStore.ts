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
  schoolName: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  board: "CBSE",
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

const getInitialSavedPapers = (): GeneratedPaperResponse[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("devgya_saved_papers");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
  }
  return [];
};

export const useAppStore = create<AppState>((set) => ({
  user: getInitialUser(),
  activePaper: null,
  savedPapers: getInitialSavedPapers(),
  ocrDraftText: "",
  activeChildId: "",
  setUser: (user) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("devgya_user", JSON.stringify(user));
      } catch (e) {}
    }
    set({ user });
  },
  initSession: () => {
    const user = getInitialUser();
    set({ user });
  },
  switchRole: (role) => set((state) => ({ user: { ...state.user, role } })),
  setActivePaper: (paper) => set({ activePaper: paper }),
  savePaper: (paper) => set((state) => {
    const filtered = state.savedPapers.filter(p => !(p.title === paper.title && p.class_name === paper.class_name));
    const updated = [paper, ...filtered];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("devgya_saved_papers", JSON.stringify(updated));
      } catch (e) {}
    }
    return { savedPapers: updated };
  }),
  deleteSavedPaper: (index) => set((state) => {
    const updated = state.savedPapers.filter((_, i) => i !== index);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("devgya_saved_papers", JSON.stringify(updated));
      } catch (e) {}
    }
    return { savedPapers: updated };
  }),
  setOcrDraftText: (ocrDraftText) => set({ ocrDraftText }),
  setActiveChildId: (activeChildId) => set({ activeChildId }),
  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("devgya_user");
        localStorage.removeItem("devgya_saved_papers");
      } catch (e) {}
    }
    set({ user: defaultUser, activePaper: null, savedPapers: [] });
  }
}));
