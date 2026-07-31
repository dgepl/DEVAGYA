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
  setOcrDraftText: (text: string) => void;
  setActiveChildId: (childId: string) => void;
  logout: () => void;
}

const defaultUser: UserProfile = {
  id: "usr-guest",
  name: "Guest User",
  email: "",
  role: "student",
  schoolName: "DEVAGYA GLOBAL PRIVATE LIMITED",
  board: "CBSE",
  xp: 0,
  streak: 0,
  level: 1,
  coins: 0
};

// Helper to get initial stored session
const getInitialUser = (): UserProfile => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("devagya_user");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading stored user session", e);
    }
  }
  return defaultUser;
};

export const useAppStore = create<AppState>((set) => ({
  user: defaultUser,
  activePaper: null,
  savedPapers: [],
  ocrDraftText: "",
  activeChildId: "",
  setUser: (user) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("devagya_user", JSON.stringify(user));
      } catch (e) {}
    }
    set({ user });
  },
  switchRole: (role) => set((state) => ({ user: { ...state.user, role } })),
  setActivePaper: (paper) => set({ activePaper: paper }),
  savePaper: (paper) => set((state) => ({ savedPapers: [paper, ...state.savedPapers] })),
  setOcrDraftText: (ocrDraftText) => set({ ocrDraftText }),
  setActiveChildId: (activeChildId) => set({ activeChildId }),
  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("devagya_user");
      } catch (e) {}
    }
    set({ user: defaultUser, activePaper: null, savedPapers: [] });
  }
}));
