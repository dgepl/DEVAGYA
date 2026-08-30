import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ToolItem {
  id: string;
  name: string;
  role: "teacher" | "student" | "parent" | "admin";
  category: string;
  path: string;
  badge: string;
  description: string;
  greeting?: string;
  is_coming_soon: boolean;
  coming_soon_title?: string;
  coming_soon_message?: string;
  coming_soon_eta?: string;
  coming_soon_badge?: string;
  icon_name: string;
  color: string;
}

export const INITIAL_TOOLS: ToolItem[] = [
  // --- TEACHER TOOLS ---
  {
    id: "question_generator",
    name: "Question Generator AI",
    role: "teacher",
    category: "Assessment & Exam",
    path: "/dashboard/generator",
    badge: "CORE STUDIO",
    description: "Generate 100% CBSE/NCERT-aligned exam question papers with Bloom's taxonomy & model answer keys from syllabus or attachments.",
    greeting: "Ready to synthesize official CBSE question papers from syllabus or uploaded photos & documents.",
    is_coming_soon: false,
    coming_soon_title: "Next-Gen Question Generator 3.0",
    coming_soon_message: "We are integrating instant multi-language bilingual rendering, automatic blueprint balancing, and ICSE/State Board schemas.",
    coming_soon_eta: "Launching Q2 2026",
    coming_soon_badge: "Under Upgrade",
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
    is_coming_soon: false,
    coming_soon_title: "Smart Assignment Auto-Grader",
    coming_soon_message: "Empowering educators with automated AI rubric grading from student photo submissions.",
    coming_soon_eta: "Releasing Next Month",
    coming_soon_badge: "In Development",
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
    is_coming_soon: false,
    coming_soon_title: "Teacher Mentor Voice Edition",
    coming_soon_message: "Real-time hands-free voice coaching during classroom preparation and lesson analysis.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Voice Beta",
    icon_name: "GraduationCap",
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "teacher_olympiad",
    name: "Skill Enhance Program",
    role: "teacher",
    category: "National Olympiad & Certification",
    path: "/dashboard/teacher-olympiad",
    badge: "OFFICIAL CERTIFICATE",
    description: "National Educator Skills Olympiad evaluating pedagogy, leadership, Bloom's taxonomy, and modern NEP 2020 methodologies.",
    greeting: "Welcome to the National Teacher Skills Olympiad 2026. Test your pedagogical mastery and earn gold tier recognition.",
    is_coming_soon: false,
    coming_soon_title: "Global Educator Olympiad 2026",
    coming_soon_message: "Registration for the upcoming Pan-India live round opens soon with national ranking and cash rewards.",
    coming_soon_eta: "Starting April 2026",
    coming_soon_badge: "Seasonal Event",
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
    is_coming_soon: false,
    coming_soon_title: "Adaptive Practice Simulator",
    coming_soon_message: "Dynamic difficulty scaling that identifies your specific pedagogical improvement areas.",
    coming_soon_eta: "Under Final Testing",
    coming_soon_badge: "Coming Soon",
    icon_name: "BookOpen",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "teacher_video_consultation",
    name: "Video Consultation",
    role: "teacher",
    category: "Expert Mentoring",
    path: "/dashboard/video-consultation",
    badge: "LIVE 1-ON-1",
    description: "Schedule face-to-face video sessions with Master Pedagogical Coaches and CBSE Curriculum Consultants.",
    greeting: "Connect 1-on-1 with senior education experts for personalized classroom audits.",
    is_coming_soon: false,
    coming_soon_title: "HD Video Conference Studio",
    coming_soon_message: "Interactive live whiteboard and collaborative real-time lesson planning during video sessions.",
    coming_soon_eta: "Deploying Soon",
    coming_soon_badge: "Upgrade in Progress",
    icon_name: "Video",
    color: "from-rose-500 to-pink-600"
  },
  {
    id: "teacher_analytics",
    name: "Class Analytics Assistant",
    role: "teacher",
    category: "Performance Radars",
    path: "/dashboard/agents?agent=analytics_assistant",
    badge: "ANALYTICS AI",
    description: "Analyze student marks distribution, identify weak topic clusters, and generate remediation plans.",
    greeting: "Share your grade book data or score CSVs, and I will generate comprehensive analytics charts and remediation strategies.",
    is_coming_soon: false,
    coming_soon_title: "Predictive Score AI",
    coming_soon_message: "Machine learning early-warning alerts for students needing timely interventions before board exams.",
    coming_soon_eta: "Beta Testing",
    coming_soon_badge: "Coming Soon",
    icon_name: "TrendingUp",
    color: "from-indigo-500 to-cyan-600"
  },
  {
    id: "teacher_english_coach",
    name: "English Pedagogy Coach",
    role: "teacher",
    category: "Communication & Fluency",
    path: "/dashboard/agents?agent=english_coach",
    badge: "FLUENCY AI",
    description: "Refine spoken English, polish parent communications, and generate interactive grammar exercises.",
    greeting: "Let's polish your academic communication and classroom presentation skills together.",
    is_coming_soon: false,
    coming_soon_title: "Accent & Speech AI Coach",
    coming_soon_message: "Real-time voice tone analysis and pronunciation coaching for classroom lectures.",
    coming_soon_eta: "In Lab",
    coming_soon_badge: "Coming Soon",
    icon_name: "MessageSquare",
    color: "from-violet-500 to-purple-600"
  },

  // --- STUDENT TOOLS ---
  {
    id: "student_tutor",
    name: "Socratic AI Tutor",
    role: "student",
    category: "24/7 AI Learning",
    path: "/dashboard/agents?agent=student_tutor",
    badge: "SOCRATIC AI",
    description: "Guided conceptual tutor that asks probing questions and helps you discover answers step-by-step.",
    greeting: "Hello! I am your Socratic AI Tutor. What concept or problem are we exploring today?",
    is_coming_soon: false,
    coming_soon_title: "Socratic Interactive Whiteboard",
    coming_soon_message: "Step-by-step visual mathematical equations and interactive chemistry formula drawings.",
    coming_soon_eta: "Launching Soon",
    coming_soon_badge: "Active Development",
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
    is_coming_soon: false,
    coming_soon_title: "JEE / NEET / Board Simulator 2026",
    coming_soon_message: "Full 3-hour computer-based mock exam simulator with all-India percentile benchmarking.",
    coming_soon_eta: "Coming in Summer 2026",
    coming_soon_badge: "Under Construction",
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
    is_coming_soon: false,
    coming_soon_title: "Multiplayer Quiz Arena",
    coming_soon_message: "Challenge your classmates and school peers in live real-time academic speed battles!",
    coming_soon_eta: "Releasing Soon",
    coming_soon_badge: "Coming Soon",
    icon_name: "Target",
    color: "from-emerald-500 to-green-600"
  },
  {
    id: "student_flashcards",
    name: "Smart Flashcards",
    role: "student",
    category: "Spaced Repetition",
    path: "/dashboard/student/flashcards",
    badge: "ANKI POWERED",
    description: "Smart Leitner-spaced repetition flashcards for rapid formula, vocabulary, and definition retention.",
    greeting: "Review your active decks and build strong long-term memory for exams.",
    is_coming_soon: false,
    coming_soon_title: "AI Auto-Deck Generator",
    coming_soon_message: "Automatically convert any textbook page photo into 20 smart flashcards in under 5 seconds.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Beta",
    icon_name: "BookOpen",
    color: "from-cyan-500 to-blue-600"
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
    is_coming_soon: false,
    coming_soon_title: "Interactive Mind-Map Visualizer",
    coming_soon_message: "Automatically transform written notes into visual concept mind-maps with one click.",
    coming_soon_eta: "In Design",
    coming_soon_badge: "Coming Soon",
    icon_name: "FileText",
    color: "from-blue-500 to-violet-600"
  },
  {
    id: "student_homework",
    name: "Homework Assistant AI",
    role: "student",
    category: "Assignment Help",
    path: "/dashboard/agents?agent=homework_assistant",
    badge: "STEP-BY-STEP",
    description: "Breaks complex homework questions into simple sub-problems and verifies steps with hints.",
    greeting: "Upload or type any tricky assignment problem, and I'll walk you through the logic step-by-step!",
    is_coming_soon: false,
    coming_soon_title: "Camera Snap & Solve 2.0",
    coming_soon_message: "Superfast handwritten math and diagram OCR with instant formula breakdowns.",
    coming_soon_eta: "Launching Soon",
    coming_soon_badge: "Vision AI",
    icon_name: "Bot",
    color: "from-teal-500 to-emerald-600"
  },
  {
    id: "student_career",
    name: "Career Counselor AI",
    role: "student",
    category: "Stream & College Guidance",
    path: "/dashboard/agents?agent=career_counselor",
    badge: "ROADMAP AI",
    description: "Personalized stream selection advice (Science, Commerce, Arts) and top university roadmaps.",
    greeting: "Let's explore your strengths and design a high-impact academic and career trajectory.",
    is_coming_soon: false,
    coming_soon_title: "CUET / College Fit Radar",
    coming_soon_message: "Direct cut-off analyzer and university course recommendation engine.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Advising Hub",
    icon_name: "Compass",
    color: "from-fuchsia-500 to-rose-600"
  },
  {
    id: "student_study_planner",
    name: "Study Planner AI",
    role: "student",
    category: "Routine & Timetable",
    path: "/dashboard/agents?agent=study_planner",
    badge: "ROUTINE AI",
    description: "Creates realistic daily revision timetables balanced with school, sports, and rest.",
    greeting: "Tell me your exam dates and weak subjects, and I will generate a balanced study schedule.",
    is_coming_soon: false,
    coming_soon_title: "Calendar Auto-Sync",
    coming_soon_message: "Direct Google Calendar and WhatsApp reminder integrations for your daily study blocks.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Integrations",
    icon_name: "Calendar",
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "student_timer",
    name: "Focus Pomodoro Timer",
    role: "student",
    category: "Productivity",
    path: "/dashboard/student/timer",
    badge: "FOCUS LAB",
    description: "25-minute deep focus cycles with lo-fi study ambient soundscapes and session logs.",
    greeting: "Start your focused study block and stay distraction-free.",
    is_coming_soon: false,
    coming_soon_title: "Study Beats AI Radio",
    coming_soon_message: "AI-generated binaural beats and custom alpha-wave study playlists.",
    coming_soon_eta: "In Production",
    coming_soon_badge: "Audio Lab",
    icon_name: "Clock",
    color: "from-slate-700 to-slate-900"
  },

  // --- PARENT TOOLS ---
  {
    id: "parent_coach",
    name: "Parenting & Habit Coach AI",
    role: "parent",
    category: "Home Mentoring",
    path: "/dashboard/agents?agent=parent_coach",
    badge: "FAMILY COACH",
    description: "Empathetic guidance on managing screen time, building focus routines, and stress-free exams.",
    greeting: "Namaste. I am here to help you foster healthy study habits, positive routines, and confident parenting.",
    is_coming_soon: false,
    coming_soon_title: "Daily Habit Micro-Tips",
    coming_soon_message: "Receive personalized 2-minute parenting audio tips tailored to your child's grade level.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Audio Tips",
    icon_name: "HeartHandshake",
    color: "from-rose-500 to-pink-600"
  },
  {
    id: "parent_radar",
    name: "Child Progress Radar",
    role: "parent",
    category: "Performance Insights",
    path: "/dashboard/parent",
    badge: "PROGRESS HUB",
    description: "Clear visualization of homework completion rates, test performance, and strengths.",
    greeting: "Review your child's latest learning milestones, completed quizzes, and attendance metrics.",
    is_coming_soon: false,
    coming_soon_title: "Weekly WhatsApp Report Card",
    coming_soon_message: "Automated weekly visual digest delivered directly to your WhatsApp with actionable praise points.",
    coming_soon_eta: "Releasing Next Month",
    coming_soon_badge: "Automated Sync",
    icon_name: "Activity",
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "parent_motivation",
    name: "Motivation & Mindset Coach",
    role: "parent",
    category: "Emotional Well-being",
    path: "/dashboard/agents?agent=motivation_coach",
    badge: "WELLNESS AI",
    description: "Positive affirmations, anti-anxiety breathing exercises, and confidence boosters for students.",
    greeting: "Helping families build resilience, reduce exam anxiety, and cultivate an unstoppable growth mindset.",
    is_coming_soon: false,
    coming_soon_title: "Mindfulness Audio Guided Sessions",
    coming_soon_message: "5-minute pre-exam relaxation audio exercises designed by child psychologists.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Wellness",
    icon_name: "Zap",
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "parent_video_consultation",
    name: "Expert Video Consultation",
    role: "parent",
    category: "1-on-1 Advisory",
    path: "/dashboard/video-consultation",
    badge: "EXPERT CALL",
    description: "Book 1-on-1 video sessions with senior academic counselors and child psychologists.",
    greeting: "Schedule a private consultation with licensed education and career advisors.",
    is_coming_soon: false,
    coming_soon_title: "Instant Video Hotline",
    coming_soon_message: "Direct on-demand video connect with available career and psychological counselors.",
    coming_soon_eta: "Coming in 2026",
    coming_soon_badge: "On Demand",
    icon_name: "Video",
    color: "from-rose-500 to-red-600"
  },

  // --- ADMIN TOOLS ---
  {
    id: "admin_tools_hub",
    name: "Platform & AI Tools Hub",
    role: "admin",
    category: "Feature Control",
    path: "/admin",
    badge: "CONTROL CENTER",
    description: "Centralized command center to rename tools, update descriptions, customize greetings, and toggle Coming Soon modes live.",
    greeting: "Manage and customize all 20+ platform tools across Teacher, Student, Parent, and Admin roles.",
    is_coming_soon: false,
    coming_soon_title: "Enterprise Multi-School Feature Toggles",
    coming_soon_message: "Per-school custom feature flags and white-label permissions management.",
    coming_soon_eta: "Q3 2026",
    coming_soon_badge: "Enterprise",
    icon_name: "Sliders",
    color: "from-indigo-600 to-blue-700"
  },
  {
    id: "admin_olympiad",
    name: "Skill Olympiad Hub",
    role: "admin",
    category: "Evaluations & Awards",
    path: "/admin",
    badge: "TSO ADMIN",
    description: "Manage national teacher assessments, review submission scripts, publish scores, and generate official certificates.",
    greeting: "Oversee live teacher submissions, grade answer scripts, and publish official rank lists.",
    is_coming_soon: false,
    coming_soon_title: "AI Auto-Evaluation 2.0",
    coming_soon_message: "Instant AI rubric evaluations and anomaly detection for online test submissions.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Auto Evaluator",
    icon_name: "Trophy",
    color: "from-amber-600 to-yellow-600"
  },
  {
    id: "admin_paper_studio",
    name: "Paper Studio 100-MCQ AI",
    role: "admin",
    category: "Curriculum Engine",
    path: "/admin",
    badge: "SYNTHESIZER",
    description: "Generate 100-question master assessment papers across Science, Math, and Pedagogy with live question editor.",
    greeting: "Create and publish comprehensive 100-question olympiad and term exam repositories.",
    is_coming_soon: false,
    coming_soon_title: "Multi-Subject Synthesizer 4.0",
    coming_soon_message: "Automated LaTeX diagram generation and multi-variant question scrambling.",
    coming_soon_eta: "In Development",
    coming_soon_badge: "Synthesizer",
    icon_name: "Wand2",
    color: "from-purple-600 to-indigo-700"
  },
  {
    id: "admin_user_directory",
    name: "User Management & RBAC",
    role: "admin",
    category: "Identity & Roles",
    path: "/admin",
    badge: "RBAC SECURITY",
    description: "Manage teachers, students, and parents, reassign roles, reset access passwords, and audit login activity.",
    greeting: "Search, filter, and audit verified school accounts across all regions.",
    is_coming_soon: false,
    coming_soon_title: "Single Sign-On (SSO) & SIS Sync",
    coming_soon_message: "Direct automatic synchronization with school ERP systems and Google Workspace for Education.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Enterprise SIS",
    icon_name: "Users",
    color: "from-teal-600 to-emerald-700"
  },
  {
    id: "admin_analytics",
    name: "Platform Metrics & Radar",
    role: "admin",
    category: "System Telemetry",
    path: "/admin",
    badge: "METRICS LAB",
    description: "Monitor active users, generated question papers, AI token consumption, and server health.",
    greeting: "Real-time infrastructure health and user engagement analytics.",
    is_coming_soon: false,
    coming_soon_title: "Real-time AI Cost & Latency Radar",
    coming_soon_message: "Detailed LLM token telemetry and automated regional caching optimization.",
    coming_soon_eta: "Coming Soon",
    coming_soon_badge: "Telemetry",
    icon_name: "Activity",
    color: "from-blue-600 to-indigo-800"
  }
];

interface ToolConfigState {
  tools: ToolItem[];
  initialized: boolean;
  
  // Actions
  updateTool: (id: string, updates: Partial<ToolItem>) => void;
  toggleComingSoon: (id: string) => void;
  setAllComingSoon: (role: "all" | "teacher" | "student" | "parent", isComingSoon: boolean) => void;
  getToolById: (id: string) => ToolItem | undefined;
  getToolByPath: (path: string, agentCode?: string) => ToolItem | undefined;
  isToolComingSoon: (pathOrId: string, agentCode?: string) => boolean;
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
        // Trigger background sync
        get().saveToServer();
      },

      toggleComingSoon: (id: string) => {
        set((state) => ({
          tools: state.tools.map((tool) =>
            tool.id === id ? { ...tool, is_coming_soon: !tool.is_coming_soon } : tool
          )
        }));
        // Trigger background sync
        get().saveToServer();
      },

      setAllComingSoon: (role, isComingSoon) => {
        set((state) => ({
          tools: state.tools.map((tool) => {
            if (role === "all" || tool.role === role) {
              return { ...tool, is_coming_soon: isComingSoon };
            }
            return tool;
          })
        }));
        get().saveToServer();
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
        return tools.find((t) => t.path === path);
      },

      isToolComingSoon: (pathOrId: string, agentCode?: string) => {
        const { tools } = get();
        if (agentCode) {
          const match = tools.find(
            (t) => t.id === agentCode || t.path.includes(`agent=${agentCode}`)
          );
          if (match) return match.is_coming_soon;
        }
        const byId = tools.find((t) => t.id === pathOrId);
        if (byId) return byId.is_coming_soon;

        const byPath = tools.find((t) => t.path === pathOrId);
        if (byPath) return byPath.is_coming_soon;

        return false;
      },

      resetToDefaults: () => {
        set({ tools: INITIAL_TOOLS });
        get().saveToServer();
      },

      fetchFromServer: async () => {
        try {
          const res = await fetch("/api/v1/admin/tools");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.tools) && data.tools.length > 0) {
              // Merge with local defaults
              const serverToolsMap = new Map(data.tools.map((t: ToolItem) => [t.id, t]));
              const merged = INITIAL_TOOLS.map((def) => {
                const serverItem = serverToolsMap.get(def.id) as Partial<ToolItem> | undefined;
                return serverItem ? { ...def, ...serverItem } : def;
              });
              set({ tools: merged });
            }
          }
        } catch (e) {
          // Graceful fallback to persistent local storage
        }
      },

      saveToServer: async () => {
        try {
          const { tools } = get();
          const res = await fetch("/api/v1/admin/tools", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tools })
          });
          return res.ok;
        } catch (e) {
          return false;
        }
      }
    }),
    {
      name: "devgya_tool_config_store_v2",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
