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
}

const roleProfiles: Record<string, UserProfile> = {
  teacher: {
    id: "usr-1",
    name: "Prof. Ananya Roy",
    email: "ananya.roy@dgepltd.in",
    role: "teacher",
    schoolName: "DEVAGYA GLOBAL PRIVATE LIMITED",
    board: "CBSE"
  },
  student: {
    id: "usr-student-1",
    name: "Aarav Sharma",
    email: "aarav.student@dgepltd.in",
    role: "student",
    schoolName: "DEVAGYA GLOBAL PRIVATE LIMITED",
    board: "CBSE",
    xp: 1450,
    streak: 14,
    level: 6,
    coins: 380
  },
  parent: {
    id: "usr-parent-1",
    name: "Mr. Rajesh Sharma",
    email: "sharma.parent@dgepltd.in",
    role: "parent",
    schoolName: "DEVAGYA GLOBAL PRIVATE LIMITED",
    board: "CBSE"
  },
  super_admin: {
    id: "usr-admin-1",
    name: "System Administrator",
    email: "admin@dgepltd.in",
    role: "super_admin",
    schoolName: "DEVAGYA GLOBAL PRIVATE LIMITED",
    board: "CBSE"
  }
};

export const useAppStore = create<AppState>((set) => ({
  user: roleProfiles.student, // Default to student persona for Phase 3 exploration
  activePaper: null,
  savedPapers: [],
  ocrDraftText: "",
  activeChildId: "std-1",
  setUser: (user) => set({ user }),
  switchRole: (role) => set({ user: roleProfiles[role] || roleProfiles.student }),
  setActivePaper: (paper) => set({ activePaper: paper }),
  savePaper: (paper) => set((state) => ({ savedPapers: [paper, ...state.savedPapers] })),
  setOcrDraftText: (ocrDraftText) => set({ ocrDraftText }),
  setActiveChildId: (activeChildId) => set({ activeChildId }),
}));
