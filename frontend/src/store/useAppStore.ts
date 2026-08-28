import { create } from "zustand";
import { GeneratedPaperResponse, AssignmentData } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "super_admin" | "student" | "parent" | "management";
  schoolName: string;
  schoolLogo?: string;
  avatarUrl?: string;
  board: string;
  subject?: string;
  classes?: string;
  isProfileComplete?: boolean;
  xp?: number;
  streak?: number;
  level?: number;
  coins?: number;

  // Student Specific
  targetExam?: string;
  strongSubject?: string;
  weakSubject?: string;
  dailyGoalHours?: string;
  studyMotto?: string;
  preferredLanguage?: string;

  phone?: string;
  state?: string;
  district?: string;
  highestQualification?: string;
  totalExperience?: string;
  teachingGradeLevel?: string;
  tsoJoined?: boolean;
  tsoSubject?: string;
  tsoCategoryLevel?: string;
  tsoMedium?: string;
  trialActivated?: boolean;

  // Parent Specific
  childName?: string;
  childSchool?: string;
  childClass?: string;
  childBoard?: string;
  parentRelation?: string;
  parentingFocus?: string;
  weeklyReportAlerts?: boolean;
}

interface AppState {
  user: UserProfile;
  activePaper: GeneratedPaperResponse | null;
  savedPapers: GeneratedPaperResponse[];
  activeAssignment: AssignmentData | null;
  savedAssignments: AssignmentData[];
  ocrDraftText: string;
  activeChildId: string;
  setUser: (user: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  switchRole: (role: "teacher" | "student" | "parent" | "super_admin") => void;
  setActivePaper: (paper: GeneratedPaperResponse | null) => void;
  savePaper: (paper: GeneratedPaperResponse) => void;
  deleteSavedPaper: (index: number) => void;
  setActiveAssignment: (assignment: AssignmentData | null) => void;
  saveAssignment: (assignment: AssignmentData) => void;
  deleteSavedAssignment: (index: number) => void;
  setOcrDraftText: (text: string) => void;
  setActiveChildId: (childId: string) => void;
  dismissedNotificationIds: string[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: (ids?: string[]) => void;
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  syncProfileFromServer: (email?: string) => Promise<void>;
  fetchSavedPapers: (email?: string) => Promise<void>;
  fetchSavedAssignments: (email?: string) => Promise<void>;
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

const isMockItem = (item: any): boolean => {
  if (!item || typeof item !== "object") return true;
  const title = (item.title || "").toLowerCase();
  if (title.includes("mock") || title.includes("sample paper 1") || title.includes("sample demo") || title.includes("test dummy")) return true;
  return false;
};

const getInitialSavedPapers = (email?: string): GeneratedPaperResponse[] => {
  if (typeof window !== "undefined") {
    try {
      const userKey = email ? `devgya_saved_papers_${email.trim().toLowerCase()}` : "devgya_saved_papers";
      const stored = localStorage.getItem(userKey) || localStorage.getItem("devgya_saved_papers");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => !isMockItem(p));
        }
      }
    } catch (e) {}
  }
  return [];
};

const getInitialSavedAssignments = (email?: string): AssignmentData[] => {
  if (typeof window !== "undefined") {
    try {
      const userKey = email ? `devgya_saved_assignments_${email.trim().toLowerCase()}` : "devgya_saved_assignments";
      const stored = localStorage.getItem(userKey) || localStorage.getItem("devgya_saved_assignments");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(a => !isMockItem(a));
        }
      }
    } catch (e) {}
  }
  return [];
};

const getInitialDismissedNotificationIds = (email?: string): string[] => {
  if (typeof window !== "undefined") {
    try {
      const key = email ? `devgya_dismissed_notifs_${email.trim().toLowerCase()}` : "devgya_dismissed_notifs";
      const stored = localStorage.getItem(key);
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
  const initialAssignments = getInitialSavedAssignments(initialUser.email);
  const initialDismissed = getInitialDismissedNotificationIds(initialUser.email);

  return {
    user: initialUser,
    activePaper: null,
    savedPapers: initialPapers,
    activeAssignment: null,
    savedAssignments: initialAssignments,
    ocrDraftText: "",
    activeChildId: "",
    dismissedNotificationIds: initialDismissed,
    isMobileDrawerOpen: false,
    setMobileDrawerOpen: (open: boolean) => set({ isMobileDrawerOpen: open }),
    dismissNotification: (id: string) => set((state) => {
      if (state.dismissedNotificationIds.includes(id)) return state;
      const updated = [...state.dismissedNotificationIds, id];
      if (typeof window !== "undefined") {
        try {
          const key = state.user?.email ? `devgya_dismissed_notifs_${state.user.email.trim().toLowerCase()}` : "devgya_dismissed_notifs";
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {}
      }
      return { dismissedNotificationIds: updated };
    }),
    clearAllNotifications: (ids?: string[]) => set((state) => {
      const toAdd = ids && ids.length > 0 ? ids : ["ALL_CLEARED"];
      const updated = Array.from(new Set([...state.dismissedNotificationIds, ...toAdd]));
      if (typeof window !== "undefined") {
        try {
          const key = state.user?.email ? `devgya_dismissed_notifs_${state.user.email.trim().toLowerCase()}` : "devgya_dismissed_notifs";
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {}
      }
      return { dismissedNotificationIds: updated };
    }),
    fetchSavedPapers: async (targetEmail?: string) => {
      const emailToFetch = targetEmail || get().user?.email;
      if (!emailToFetch || emailToFetch === "" || emailToFetch.includes("guest") || typeof window === "undefined") {
        return;
      }
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        const res = await fetch(`${baseUrl}/generator/history?email=${encodeURIComponent(emailToFetch.trim().toLowerCase())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.papers && Array.isArray(data.papers)) {
            set({ savedPapers: data.papers });
            try {
              localStorage.setItem(`devgya_saved_papers_${emailToFetch.trim().toLowerCase()}`, JSON.stringify(data.papers));
              localStorage.setItem("devgya_saved_papers", JSON.stringify(data.papers));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn("Paper history sync notice:", err);
      }
    },
    fetchSavedAssignments: async (targetEmail?: string) => {
      const emailToFetch = targetEmail || get().user?.email;
      if (!emailToFetch || emailToFetch === "" || emailToFetch.includes("guest") || typeof window === "undefined") {
        return;
      }
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        const res = await fetch(`${baseUrl}/assignment/history?email=${encodeURIComponent(emailToFetch.trim().toLowerCase())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assignments && Array.isArray(data.assignments)) {
            set({ savedAssignments: data.assignments });
            try {
              localStorage.setItem(`devgya_saved_assignments_${emailToFetch.trim().toLowerCase()}`, JSON.stringify(data.assignments));
              localStorage.setItem("devgya_saved_assignments", JSON.stringify(data.assignments));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn("Assignment history sync notice:", err);
      }
    },
    syncProfileFromServer: async (targetEmail?: string) => {
      const emailToSync = targetEmail || get().user?.email;
      if (!emailToSync || emailToSync === "" || emailToSync.includes("guest") || typeof window === "undefined") {
        return;
      }
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        const res = await fetch(`${baseUrl}/auth/profile?email=${encodeURIComponent(emailToSync.trim().toLowerCase())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.user) {
            const current = get().user;
            // Preserve valid local avatar and logo if server response is blank
            const mergedAvatar = data.user.avatarUrl || current.avatarUrl;
            const mergedLogo = data.user.schoolLogo || current.schoolLogo;
            const updatedUser: UserProfile = { ...current, ...data.user, avatarUrl: mergedAvatar, schoolLogo: mergedLogo };
            set({ user: updatedUser });
            try {
              localStorage.setItem("devgya_user", JSON.stringify(updatedUser));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn("Real-time profile server sync notice:", err);
      }
    },
    setUser: (user) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("devgya_user", JSON.stringify(user));
        } catch (e) {}
      }
      // Load user-specific papers, assignments and dismissed notifications
      const userPapers = getInitialSavedPapers(user.email);
      const userAssignments = getInitialSavedAssignments(user.email);
      const userDismissed = getInitialDismissedNotificationIds(user.email);
      set({ 
        user, 
        savedPapers: userPapers.length > 0 ? userPapers : get().savedPapers,
        savedAssignments: userAssignments.length > 0 ? userAssignments : get().savedAssignments,
        dismissedNotificationIds: userDismissed
      });

      // Fetch latest profile, papers and assignments from server for multi-device sync
      if (user.email) {
        get().syncProfileFromServer(user.email);
        get().fetchSavedPapers(user.email);
        get().fetchSavedAssignments(user.email);
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
      const userAssignments = getInitialSavedAssignments(user.email);
      const userDismissed = getInitialDismissedNotificationIds(user.email);
      set({ 
        user, 
        savedPapers: userPapers, 
        savedAssignments: userAssignments,
        dismissedNotificationIds: userDismissed 
      });
      if (user.email) {
        get().syncProfileFromServer(user.email);
        get().fetchSavedPapers(user.email);
        get().fetchSavedAssignments(user.email);
      }
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
      const userEmail = state.user?.email || "guest@devgya.com";

      if (typeof window !== "undefined") {
        try {
          const emailKey = state.user?.email ? `devgya_saved_papers_${state.user.email.trim().toLowerCase()}` : "devgya_saved_papers";
          localStorage.setItem(emailKey, JSON.stringify(updated));
          localStorage.setItem("devgya_saved_papers", JSON.stringify(updated));

          if (paperToDelete) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
            fetch(`${baseUrl}/generator/history?title=${encodeURIComponent(paperToDelete.title)}&class_name=${encodeURIComponent(paperToDelete.class_name)}&email=${encodeURIComponent(userEmail)}`, {
              method: "DELETE"
            }).catch(() => {});
          }
        } catch (e) {}
      }

      const shouldClearActive = state.activePaper && paperToDelete && state.activePaper.title === paperToDelete.title && state.activePaper.class_name === paperToDelete.class_name;
      return { 
        savedPapers: updated,
        activePaper: shouldClearActive ? null : state.activePaper
      };
    }),
    setActiveAssignment: (assignment) => set({ activeAssignment: assignment }),
    saveAssignment: (assignment) => set((state) => {
      const filtered = state.savedAssignments.filter(a => !(
        (assignment.id && a.id === assignment.id) ||
        (a.title === assignment.title && a.class_name === assignment.class_name)
      ));
      const updated = [assignment, ...filtered];
      if (typeof window !== "undefined") {
        try {
          const emailKey = state.user?.email ? `devgya_saved_assignments_${state.user.email.trim().toLowerCase()}` : "devgya_saved_assignments";
          localStorage.setItem(emailKey, JSON.stringify(updated));
          localStorage.setItem("devgya_saved_assignments", JSON.stringify(updated));

          // Sync to backend assignment history in background
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
          fetch(`${baseUrl}/assignment/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: state.user?.email || "guest@devgya.com", assignment })
          }).catch(() => {});
        } catch (e) {}
      }
      return { savedAssignments: updated };
    }),
    deleteSavedAssignment: (index) => set((state) => {
      const asgToDelete = state.savedAssignments[index];
      const updated = state.savedAssignments.filter((_, i) => i !== index);
      const userEmail = state.user?.email || "guest@devgya.com";

      if (typeof window !== "undefined") {
        try {
          const emailKey = state.user?.email ? `devgya_saved_assignments_${state.user.email.trim().toLowerCase()}` : "devgya_saved_assignments";
          localStorage.setItem(emailKey, JSON.stringify(updated));
          localStorage.setItem("devgya_saved_assignments", JSON.stringify(updated));

          if (asgToDelete) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
            let url = `${baseUrl}/assignment/history?email=${encodeURIComponent(userEmail)}`;
            if (asgToDelete.id) url += `&id=${encodeURIComponent(asgToDelete.id)}`;
            if (asgToDelete.title) url += `&title=${encodeURIComponent(asgToDelete.title)}`;
            if (asgToDelete.class_name) url += `&class_name=${encodeURIComponent(asgToDelete.class_name)}`;

            fetch(url, { method: "DELETE" }).catch(() => {});
          }
        } catch (e) {}
      }

      const shouldClearActive = state.activeAssignment && asgToDelete && (
        (asgToDelete.id && state.activeAssignment.id === asgToDelete.id) ||
        (state.activeAssignment.title === asgToDelete.title && state.activeAssignment.class_name === asgToDelete.class_name)
      );
      return { 
        savedAssignments: updated,
        activeAssignment: shouldClearActive ? null : state.activeAssignment
      };
    }),
    setOcrDraftText: (ocrDraftText) => set({ ocrDraftText }),
    setActiveChildId: (activeChildId) => set({ activeChildId }),
    logout: () => {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("devgya_user");
          localStorage.removeItem("devgya_saved_papers");
          localStorage.removeItem("devgya_saved_assignments");
          sessionStorage.clear();
        } catch (e) {}
      }
      set({ 
        user: defaultUser, 
        activePaper: null, 
        savedPapers: [], 
        activeAssignment: null, 
        savedAssignments: [],
        dismissedNotificationIds: []
      });
    }
  };
});
