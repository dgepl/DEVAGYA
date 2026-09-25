import { create } from "zustand";
import { GeneratedPaperResponse, AssignmentData, getApiBase } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "super_admin" | "student" | "parent" | "management" | "school";
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

  // School Specific
  schoolId?: string;
  verificationStatus?: "pending_verification" | "verified" | "rejected";
  affiliationBoard?: string;
  schoolCity?: string;
  schoolState?: string;
  contactPerson?: string;

  // Student Specific
  username?: string;
  parentEmail?: string;
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
  switchRole: (role: "teacher" | "student" | "parent" | "super_admin" | "school") => void;
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
  // School Portal Cached State
  schoolProfile: any | null;
  schoolVacancies: any[];
  schoolApplications: any[];
  setSchoolProfile: (profile: any) => void;
  setSchoolVacancies: (vacancies: any[]) => void;
  setSchoolApplications: (applications: any[]) => void;
  setSchoolOverview: (school: any, vacancies: any[], applications: any[]) => void;

  initSession: () => void;
  logout: () => void;
}

/**
 * Recursively strips oversized base64 data URLs (> 25KB) from objects
 * before JSON stringification to prevent localStorage QuotaExceededError.
 */
function sanitizeForStorage(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForStorage(item));
  }
  const copy: any = { ...obj };
  for (const k of Object.keys(copy)) {
    const val = copy[k];
    if (typeof val === "string" && val.startsWith("data:image") && val.length > 25000) {
      delete copy[k];
    } else if (val && typeof val === "object") {
      copy[k] = sanitizeForStorage(val);
    }
  }
  return copy;
}

/**
 * Safely writes to localStorage and sessionStorage with automatic pruning and fallback.
 */
export function safeSetLocalStorage(key: string, value: any): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stringified = JSON.stringify(value);
    localStorage.setItem(key, stringified);
    try { sessionStorage.setItem(key, stringified); } catch (e) {}
    return true;
  } catch (err) {
    console.warn(`localStorage.setItem failed for "${key}", applying storage sanitizer:`, err);
    try {
      const sanitized = sanitizeForStorage(value);
      const sanitizedStr = JSON.stringify(sanitized);
      localStorage.setItem(key, sanitizedStr);
      try { sessionStorage.setItem(key, sanitizedStr); } catch (e) {}
      return true;
    } catch (retryErr) {
      console.error(`localStorage.setItem sanitized retry failed for "${key}":`, retryErr);
      try {
        sessionStorage.setItem(key, JSON.stringify(sanitizeForStorage(value)));
        return true;
      } catch (sessionErr) {}
    }
  }
  return false;
}

const defaultUser: UserProfile = {
  id: "usr-guest",
  name: "Guest User",
  email: "",
  role: "teacher",
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
      const stored = localStorage.getItem("devgya_user") || sessionStorage.getItem("devgya_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          if (parsed.role === "management") {
            parsed.role = "school";
          }
          return parsed;
        }
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

const getInitialSchoolProfile = (email?: string): any | null => {
  if (typeof window !== "undefined") {
    try {
      const key = email ? `devgya_school_profile_${email.trim().toLowerCase()}` : "devgya_school_profile";
      const stored = localStorage.getItem(key) || localStorage.getItem("devgya_school_profile");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
  }
  return null;
};

const getInitialSchoolVacancies = (email?: string): any[] => {
  if (typeof window !== "undefined") {
    try {
      const key = email ? `devgya_school_vacancies_${email.trim().toLowerCase()}` : "devgya_school_vacancies";
      const stored = localStorage.getItem(key) || localStorage.getItem("devgya_school_vacancies");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
  }
  return [];
};

const getInitialSchoolApplications = (email?: string): any[] => {
  if (typeof window !== "undefined") {
    try {
      const key = email ? `devgya_school_apps_${email.trim().toLowerCase()}` : "devgya_school_apps";
      const stored = localStorage.getItem(key) || localStorage.getItem("devgya_school_apps");
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
  const initialSchool = getInitialSchoolProfile(initialUser.email);
  const initialVacancies = getInitialSchoolVacancies(initialUser.email);
  const initialApplications = getInitialSchoolApplications(initialUser.email);

  // If school profile cached, ensure user object reflects school name & logo
  if (initialSchool && initialUser.role === "school") {
    if (initialSchool.school_name && !initialUser.schoolName) {
      initialUser.schoolName = initialSchool.school_name;
    }
    if (initialSchool.logo_url && !initialUser.schoolLogo) {
      initialUser.schoolLogo = initialSchool.logo_url;
    }
  }

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

    // School Portal Cached State & Actions
    schoolProfile: initialSchool,
    schoolVacancies: initialVacancies,
    schoolApplications: initialApplications,
    setSchoolProfile: (profile: any) => {
      set({ schoolProfile: profile });
      if (typeof window !== "undefined" && profile) {
        const email = get().user?.email;
        if (email) safeSetLocalStorage(`devgya_school_profile_${email.trim().toLowerCase()}`, profile);
        safeSetLocalStorage("devgya_school_profile", profile);
      }
      if (profile?.school_name || profile?.logo_url) {
        const curUser = get().user;
        const updated = {
          ...curUser,
          schoolName: profile.school_name || curUser.schoolName,
          schoolLogo: profile.logo_url || curUser.schoolLogo
        };
        set({ user: updated });
        safeSetLocalStorage("devgya_user", updated);
      }
    },
    setSchoolVacancies: (vacancies: any[]) => {
      set({ schoolVacancies: vacancies });
      if (typeof window !== "undefined" && Array.isArray(vacancies)) {
        const email = get().user?.email;
        if (email) safeSetLocalStorage(`devgya_school_vacancies_${email.trim().toLowerCase()}`, vacancies);
        safeSetLocalStorage("devgya_school_vacancies", vacancies);
      }
    },
    setSchoolApplications: (applications: any[]) => {
      set({ schoolApplications: applications });
      if (typeof window !== "undefined" && Array.isArray(applications)) {
        const email = get().user?.email;
        if (email) safeSetLocalStorage(`devgya_school_apps_${email.trim().toLowerCase()}`, applications);
        safeSetLocalStorage("devgya_school_apps", applications);
      }
    },
    setSchoolOverview: (school: any, vacancies: any[], applications: any[]) => {
      set({
        schoolProfile: school,
        schoolVacancies: vacancies || [],
        schoolApplications: applications || []
      });
      if (typeof window !== "undefined") {
        const email = get().user?.email;
        if (school) {
          if (email) safeSetLocalStorage(`devgya_school_profile_${email.trim().toLowerCase()}`, school);
          safeSetLocalStorage("devgya_school_profile", school);
        }
        if (Array.isArray(vacancies)) {
          if (email) safeSetLocalStorage(`devgya_school_vacancies_${email.trim().toLowerCase()}`, vacancies);
          safeSetLocalStorage("devgya_school_vacancies", vacancies);
        }
        if (Array.isArray(applications)) {
          if (email) safeSetLocalStorage(`devgya_school_apps_${email.trim().toLowerCase()}`, applications);
          safeSetLocalStorage("devgya_school_apps", applications);
        }
      }
      if (school?.school_name || school?.logo_url) {
        const curUser = get().user;
        const updated = {
          ...curUser,
          schoolName: school.school_name || curUser.schoolName,
          schoolLogo: school.logo_url || curUser.schoolLogo
        };
        set({ user: updated });
        safeSetLocalStorage("devgya_user", updated);
      }
    },

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
        const baseUrl = getApiBase();
        const res = await fetch(`${baseUrl}/auth/profile?email=${encodeURIComponent(emailToSync.trim().toLowerCase())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.user) {
            const current = get().user;
            const normalizedRole = (data.user.role === "management" ? "school" : (data.user.role || current.role)) as any;
            const mergedAvatar = data.user.avatarUrl !== undefined ? data.user.avatarUrl : current.avatarUrl;
            const mergedLogo = data.user.schoolLogo !== undefined ? data.user.schoolLogo : current.schoolLogo;
            const updatedUser: UserProfile = { ...current, ...data.user, role: normalizedRole, avatarUrl: mergedAvatar, schoolLogo: mergedLogo };
            set({ user: updatedUser });
            safeSetLocalStorage("devgya_user", updatedUser);
            if (data.user.schoolProfile) {
              set({ schoolProfile: data.user.schoolProfile });
              safeSetLocalStorage("devgya_school_profile", data.user.schoolProfile);
              safeSetLocalStorage(`devgya_school_profile_${emailToSync.trim().toLowerCase()}`, data.user.schoolProfile);
            }
          }
        }
      } catch (err) {
        console.warn("Real-time profile server sync notice:", err);
      }
    },
    setUser: (user) => {
      const effectiveUser: UserProfile = {
        ...user,
        role: (user.role === "management" ? "school" : user.role) as any
      };
      safeSetLocalStorage("devgya_user", effectiveUser);

      // Load user-specific papers, assignments and dismissed notifications
      const userPapers = getInitialSavedPapers(effectiveUser.email);
      const userAssignments = getInitialSavedAssignments(effectiveUser.email);
      const userDismissed = getInitialDismissedNotificationIds(effectiveUser.email);
      const userSchool = getInitialSchoolProfile(effectiveUser.email);
      const userVacancies = getInitialSchoolVacancies(effectiveUser.email);
      const userApplications = getInitialSchoolApplications(effectiveUser.email);

      // Merge school name and logo into user object if school role
      if ((effectiveUser.role === "school" || (effectiveUser.role as any) === "management") && userSchool) {
        if (userSchool.school_name && !effectiveUser.schoolName) effectiveUser.schoolName = userSchool.school_name;
        if (userSchool.logo_url && !effectiveUser.schoolLogo) effectiveUser.schoolLogo = userSchool.logo_url;
      }

      set({ 
        user: effectiveUser, 
        savedPapers: userPapers.length > 0 ? userPapers : get().savedPapers,
        savedAssignments: userAssignments.length > 0 ? userAssignments : get().savedAssignments,
        dismissedNotificationIds: userDismissed,
        schoolProfile: userSchool || get().schoolProfile,
        schoolVacancies: userVacancies.length > 0 ? userVacancies : get().schoolVacancies,
        schoolApplications: userApplications.length > 0 ? userApplications : get().schoolApplications
      });

      // Fetch latest profile, papers and assignments from server for multi-device sync
      if (effectiveUser.email) {
        get().syncProfileFromServer(effectiveUser.email);
        get().fetchSavedPapers(effectiveUser.email);
        get().fetchSavedAssignments(effectiveUser.email);
      }
    },
    updateUserProfile: (updates) => {
      set((state) => {
        const updatedUser = { 
          ...state.user, 
          ...updates,
          role: (updates.role === "management" ? "school" : (updates.role || state.user.role)) as any
        };
        safeSetLocalStorage("devgya_user", updatedUser);
        return { user: updatedUser };
      });
    },
    initSession: () => {
      const user = getInitialUser();
      const userPapers = getInitialSavedPapers(user.email);
      const userAssignments = getInitialSavedAssignments(user.email);
      const userDismissed = getInitialDismissedNotificationIds(user.email);
      const userSchool = getInitialSchoolProfile(user.email);
      const userVacancies = getInitialSchoolVacancies(user.email);
      const userApplications = getInitialSchoolApplications(user.email);

      if ((user.role === "school" || (user.role as any) === "management") && userSchool) {
        if (userSchool.school_name && !user.schoolName) user.schoolName = userSchool.school_name;
        if (userSchool.logo_url && !user.schoolLogo) user.schoolLogo = userSchool.logo_url;
      }

      set({ 
        user, 
        savedPapers: userPapers, 
        savedAssignments: userAssignments,
        dismissedNotificationIds: userDismissed,
        schoolProfile: userSchool,
        schoolVacancies: userVacancies,
        schoolApplications: userApplications
      });
      if (user.email) {
        get().syncProfileFromServer(user.email);
        get().fetchSavedPapers(user.email);
        get().fetchSavedAssignments(user.email);
      }
    },
    switchRole: (role) => set((state) => {
      const targetRole = ((role as string) === "management" ? "school" : role) as any;
      const updatedUser = { ...state.user, role: targetRole };
      safeSetLocalStorage("devgya_user", updatedUser);
      return { user: updatedUser };
    }),
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
            let url = `${baseUrl}/generator/history?email=${encodeURIComponent(userEmail)}`;
            if (paperToDelete.id) url += `&id=${encodeURIComponent(paperToDelete.id)}`;
            if (paperToDelete.title) url += `&title=${encodeURIComponent(paperToDelete.title)}`;
            if (paperToDelete.class_name) url += `&class_name=${encodeURIComponent(paperToDelete.class_name)}`;

            fetch(url, { method: "DELETE" }).catch(() => {});
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
