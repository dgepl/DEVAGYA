import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getApiBase } from "@/lib/api";

export interface ToolItem {
  id: string;
  name: string;
  role: "teacher" | "student" | "parent" | "admin" | "all";
  category: string;
  path: string;
  badge: string;
  description: string;
  greeting?: string;
  is_enabled: boolean; // Admin permission: true = allowed, false = hidden from sidebar & mobile and blocked
  icon_name: string;
  color: string;
}

export function isToolEnabled(val: unknown): boolean {
  if (val === false || val === 0 || val === "false" || val === "0") {
    return false;
  }
  if (val === true || val === 1 || val === "true" || val === "1") {
    return true;
  }
  return val !== undefined && val !== null ? Boolean(val) : true;
}

export const INITIAL_TOOLS: ToolItem[] = [
  // --- TEACHER TOOLS & SECTIONS ---
  {
    id: "ppt_generator",
    name: "AI PPT Generator",
    role: "teacher",
    category: "Lesson & Slides",
    path: "/dashboard/ppt-generator",
    badge: "SLIDE CREATOR",
    description: "Create interactive visual slide presentations with curriculum standards, topic summaries, and diagrams.",
    greeting: "Ready to create engaging presentation slides for your classroom.",
    is_enabled: true,
    icon_name: "Sliders",
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "question_generator",
    name: "Question Generator AI",
    role: "teacher",
    category: "Assessment & Exam",
    path: "/dashboard/generator",
    badge: "CORE STUDIO",
    description: "Generate 100% CBSE/NCERT-aligned exam question papers with Bloom's taxonomy & model answer keys from syllabus or attachments.",
    greeting: "Ready to synthesize official CBSE question papers from syllabus or uploaded photos & documents.",
    is_enabled: true,
    icon_name: "Sparkles",
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "assignments",
    name: "AI Assignment Maker",
    role: "teacher",
    category: "Homework & Worksheets",
    path: "/dashboard/assignments",
    badge: "PDF STUDIO",
    description: "Build custom homework assignments, chapter worksheets, and ruled-line submission sheets with QR code verification.",
    greeting: "Create structured chapter assignments with step-by-step rubrics and printable ruled-line sheets.",
    is_enabled: true,
    icon_name: "FileText",
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "teacher_mentor",
    name: "Teacher Mentor AI",
    role: "teacher",
    category: "Pedagogy & Classroom",
    path: "/dashboard/agents?agent=teacher_mentor",
    badge: "5-IN-1 SUPER AGENT",
    description: "Pedagogical advice, student analytics radars, parent communication drafts, and NCERT curriculum guidance.",
    greeting: "Namaste! I am your 5-in-1 Teacher Mentor AI companion. How can I assist your classroom today?",
    is_enabled: true,
    icon_name: "GraduationCap",
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "teacher_olympiad",
    name: "Skill Enhance Program",
    role: "teacher",
    category: "National Certification",
    path: "/dashboard/teacher-olympiad",
    badge: "CERTIFICATION",
    description: "National Educator Skills Olympiad evaluating pedagogy, leadership, Bloom's taxonomy, and modern NEP 2020 methodologies.",
    greeting: "Welcome to the National Teacher Skills Olympiad 2026. Test your pedagogical mastery and earn gold tier recognition.",
    is_enabled: true,
    icon_name: "Trophy",
    color: "from-amber-500 to-yellow-600"
  },
  {
    id: "teacher_olympiad_practice",
    name: "Skill Enhance Practice",
    role: "teacher",
    category: "Mock Tests & Quizzes",
    path: "/dashboard/teacher-olympiad/practice",
    badge: "PRACTICE LAB",
    description: "Unlimited timed mock papers and pedagogical skill quizzes to prepare for national certification.",
    greeting: "Practice real-time pedagogical assessment simulations to boost your speed and precision.",
    is_enabled: true,
    icon_name: "BookOpen",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "teacher_english_coach",
    name: "English Speaking Coach",
    role: "teacher",
    category: "Spoken Fluency",
    path: "/dashboard/english-coach",
    badge: "LIVE SPOKEN AI",
    description: "Live spoken English fluency, classroom instruction phrasing & PTM conversation practice with authentic Indian and Hindi accents.",
    greeting: "Start your live spoken English practice session with your AI Speech Coach.",
    is_enabled: true,
    icon_name: "Headphones",
    color: "from-rose-500 to-pink-600"
  },
  {
    id: "teacher_recruitment",
    name: "Teacher Recruitment Portal",
    role: "teacher",
    category: "Jobs & Opportunities",
    path: "/dashboard/recruitment",
    badge: "CAREER JOBS",
    description: "Explore verified school vacancies, apply directly to schools, and view school contact information.",
    greeting: "Explore teaching vacancies across verified partner schools.",
    is_enabled: true,
    icon_name: "Briefcase",
    color: "from-emerald-600 to-teal-700"
  },

  // --- STUDENT TOOLS & SECTIONS ---
  {
    id: "student_tutor",
    name: "Socratic AI Tutor",
    role: "student",
    category: "24/7 AI Learning",
    path: "/dashboard/agents?agent=student_tutor",
    badge: "SOCRATIC AI",
    description: "Guided conceptual tutor that asks probing questions and helps you discover answers step-by-step.",
    greeting: "Hello! I am your Socratic AI Tutor. What concept or problem are we exploring today?",
    is_enabled: true,
    icon_name: "Brain",
    color: "from-purple-500 to-pink-600"
  },
  {
    id: "student_exam_prep",
    name: "AI Exam Prep Studio",
    role: "student",
    category: "Board & Competitive Prep",
    path: "/dashboard/student/exam-prep",
    badge: "BOARD MASTERY",
    description: "Chapter-wise weightage radars, previous year question trends, and high-probability predicted tests.",
    greeting: "Target your highest-weightage topics and master CBSE exam patterns.",
    is_enabled: true,
    icon_name: "Trophy",
    color: "from-amber-500 to-red-600"
  },
  {
    id: "student_practice",
    name: "Practice & Quizzes",
    role: "student",
    category: "Active Recall",
    path: "/dashboard/student/practice",
    badge: "TIMED QUIZZES",
    description: "Fast-paced timed quizzes with immediate step-by-step explanations and score tracking.",
    greeting: "Choose a subject and topic to test your knowledge with interactive gamified quizzes.",
    is_enabled: true,
    icon_name: "Target",
    color: "from-emerald-500 to-green-600"
  },
  {
    id: "student_notes",
    name: "Notion Smart Notes",
    role: "student",
    category: "Summary & Synthesis",
    path: "/dashboard/student/notes",
    badge: "RICH NOTES",
    description: "Structured markdown study summaries, bulleted revision sheets, and key formula cheat-sheets.",
    greeting: "Access organized chapter notes with high-yield points highlighted for quick review.",
    is_enabled: true,
    icon_name: "FileText",
    color: "from-blue-500 to-violet-600"
  },
  {
    id: "student_timer",
    name: "Focus Pomodoro Timer",
    role: "student",
    category: "Study Productivity",
    path: "/dashboard/student/timer",
    badge: "FOCUS LAB",
    description: "Customizable 25-minute Pomodoro study cycles with ambient sounds and session tracking.",
    greeting: "Start your focused study session and eliminate digital distractions.",
    is_enabled: true,
    icon_name: "Clock",
    color: "from-rose-500 to-amber-600"
  },
  {
    id: "student_leaderboard",
    name: "Student Leaderboard",
    role: "student",
    category: "Gamification & Rank",
    path: "/dashboard/student/leaderboard",
    badge: "XP & RANKS",
    description: "Compare your weekly study streaks, quiz accuracy, and badges against students nationwide.",
    greeting: "See where you rank on the national student leaderboard.",
    is_enabled: true,
    icon_name: "Trophy",
    color: "from-yellow-500 to-amber-600"
  },

  // --- PARENT TOOLS & SECTIONS ---
  {
    id: "parent_coach",
    name: "Parenting Coach AI",
    role: "parent",
    category: "Parenting Guidance",
    path: "/dashboard/agents?agent=parent_coach",
    badge: "FAMILY AI",
    description: "Evidence-based parenting advice for screen-time balance, exam anxiety, and adolescent support.",
    greeting: "Namaste! I am your Parenting Coach AI. How can I support your child's learning journey today?",
    is_enabled: true,
    icon_name: "HeartHandshake",
    color: "from-rose-500 to-red-600"
  },
  {
    id: "parent_english_coach",
    name: "English Speaking Coach",
    role: "parent",
    category: "Spoken Fluency",
    path: "/dashboard/english-coach",
    badge: "SPOKEN COACH",
    description: "Practice spoken English communication and phrasing for school meetings and parent-teacher interactions.",
    greeting: "Practice your English speaking fluency and confidence.",
    is_enabled: true,
    icon_name: "Headphones",
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "parent_research_assistant",
    name: "Research Assistant AI",
    role: "parent",
    category: "Educational Research",
    path: "/dashboard/agents?agent=research_assistant",
    badge: "RESEARCH AI",
    description: "Find facts, verify educational curricula, compare school boards, and find college requirements.",
    greeting: "Ask any academic or institutional research question.",
    is_enabled: true,
    icon_name: "Search",
    color: "from-cyan-500 to-blue-600"
  }
];

interface ToolConfigState {
  tools: ToolItem[];
  initialized: boolean;
  
  // Actions
  updateTool: (id: string, updates: Partial<ToolItem>) => void;
  toggleFeatureAllowed: (id: string) => void;
  setAllFeaturesAllowed: (role: "all" | "teacher" | "student" | "parent", isAllowed: boolean) => void;
  isFeatureAllowed: (path: string, agentCode?: string) => boolean;
  getToolById: (id: string) => ToolItem | undefined;
  getToolByPath: (path: string, agentCode?: string) => ToolItem | undefined;
  resetToDefaults: () => void;
  fetchFromServer: () => Promise<void>;
  saveToServer: () => Promise<boolean>;
}

export const useToolConfigStore = create<ToolConfigState>()(
  persist(
    (set, get) => ({
      tools: INITIAL_TOOLS,
      initialized: true,

      updateTool: (id: string, updates: Partial<ToolItem>) => {
        set((state) => ({
          tools: state.tools.map((tool) =>
            tool.id === id ? { ...tool, ...updates } : tool
          )
        }));
        get().saveToServer();
      },

      toggleFeatureAllowed: (id: string) => {
        set((state) => ({
          tools: state.tools.map((tool) => {
            if (tool.id === id) {
              const currentlyAllowed = isToolEnabled(tool.is_enabled);
              return { ...tool, is_enabled: !currentlyAllowed };
            }
            return tool;
          })
        }));
        get().saveToServer();
      },

      setAllFeaturesAllowed: (role, isAllowed) => {
        set((state) => ({
          tools: state.tools.map((tool) => {
            if (role === "all" || tool.role === role) {
              return { ...tool, is_enabled: Boolean(isAllowed) };
            }
            return tool;
          })
        }));
        get().saveToServer();
      },

      isFeatureAllowed: (path: string, agentCode?: string) => {
        if (!path) return true;

        // Base dashboard, profile, and suggestion pages are always allowed
        if (
          path === "/dashboard" ||
          path === "/dashboard/student" ||
          path.startsWith("/dashboard/parent") ||
          path === "/dashboard/school" ||
          path === "/dashboard/profile" ||
          path === "/dashboard/suggestions" ||
          path.startsWith("/admin")
        ) {
          return true;
        }

        const { tools } = get();

        // 1. Resolve agentCode directly or from query parameters
        let resolvedAgent = agentCode;
        if (!resolvedAgent && path.includes("?")) {
          const parts = path.split("?");
          if (parts[1]) {
            try {
              const params = new URLSearchParams(parts[1]);
              resolvedAgent = params.get("agent") || undefined;
            } catch {}
          }
        }

        if (resolvedAgent) {
          const match = tools.find(
            (t) => t.id === resolvedAgent || t.path.includes(`agent=${resolvedAgent}`)
          );
          if (match) {
            return isToolEnabled(match.is_enabled);
          }
        }

        // 2. Check by exact path or clean path
        const cleanPath = path.split("?")[0];
        const match = tools.find((t) => {
          const tClean = t.path.split("?")[0];
          return t.path === path || tClean === cleanPath || (tClean.length > 11 && cleanPath.startsWith(tClean));
        });

        if (match) {
          return isToolEnabled(match.is_enabled);
        }

        return true;
      },

      getToolById: (id: string) => {
        return get().tools.find((t) => t.id === id);
      },

      getToolByPath: (path: string, agentCode?: string) => {
        const { tools } = get();
        if (agentCode) {
          const match = tools.find(
            (t) => t.id === agentCode || t.path.includes(`agent=${agentCode}`)
          );
          if (match) return match;
        }
        const cleanPath = path.split("?")[0];
        return tools.find((t) => t.path === path || t.path.split("?")[0] === cleanPath);
      },

      resetToDefaults: () => {
        set({ tools: INITIAL_TOOLS });
        get().saveToServer();
      },

      fetchFromServer: async () => {
        try {
          const baseUrl = typeof window !== "undefined" ? getApiBase() : "/api/v1";
          let res: Response | null = null;
          try {
            res = await fetch(`${baseUrl}/admin/tools`);
          } catch {
            try {
              res = await fetch("/api/v1/admin/tools");
            } catch {}
          }

          if (res && res.ok) {
            const data = await res.json();
            if (Array.isArray(data.tools) && data.tools.length > 0) {
              const serverToolsMap = new Map(data.tools.map((t: any) => [t.id, t]));
              const merged = INITIAL_TOOLS.map((def) => {
                const serverItem = serverToolsMap.get(def.id) as Partial<ToolItem> | undefined;
                if (serverItem) {
                  const serverEnabled = serverItem.is_enabled !== undefined 
                    ? isToolEnabled(serverItem.is_enabled)
                    : def.is_enabled;
                  return {
                    ...def,
                    ...serverItem,
                    is_enabled: serverEnabled
                  };
                }
                return def;
              });
              set({ tools: merged });
            }
          }
        } catch {
          // Graceful fallback to persistent local storage
        }
      },

      saveToServer: async () => {
        try {
          const { tools } = get();
          const normalizedTools = tools.map((t) => ({
            ...t,
            is_enabled: isToolEnabled(t.is_enabled)
          }));

          const baseUrl = typeof window !== "undefined" ? getApiBase() : "/api/v1";
          let success = false;
          try {
            const res = await fetch(`${baseUrl}/admin/tools`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tools: normalizedTools })
            });
            if (res.ok) success = true;
          } catch {}

          if (!success) {
            try {
              const res = await fetch("/api/v1/admin/tools", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tools: normalizedTools })
              });
              if (res.ok) success = true;
            } catch {}
          }
          return success;
        } catch {
          return false;
        }
      }
    }),
    {
      name: "devgya_tool_config_store_v4",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
