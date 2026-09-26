"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Building2, 
  Sparkles, 
  Download, 
  Printer, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Clock, 
  ChevronRight, 
  Sliders, 
  Compass, 
  BookOpen, 
  DollarSign,
  Atom,
  History,
  Trash2,
  Calendar,
  AlertTriangle,
  Search,
  Check,
  X,
  GraduationCap,
  Layers,
  Lightbulb
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { 
  getApiBase,
  generateStreamAssessment, 
  downloadStreamAssessmentPDF, 
  fetchPaperHistory,
  deletePaperFromHistory,
  StreamAssessmentResponse, 
  StreamAssessmentPayload
} from "@/lib/api";

interface NepStageConfig {
  stage: string;
  name: string;
  subtitle: string;
  classes: string[];
  focus: string;
  approach: string;
  domains: [string, string, string];
  defaultTime: number;
  badgeColor: string;
  accentBg: string;
  borderAccent: string;
}

const NEP_STAGES: Record<string, NepStageConfig> = {
  foundational: {
    stage: "foundational",
    name: "Foundational Stage (Class 1–2)",
    subtitle: "Ages 3–8 • FLN & Experiential Play",
    classes: ["Class 1", "Class 2"],
    focus: "Foundational literacy and numeracy (FLN), language, physical/socio-emotional",
    approach: "Play, picture, oral activity, observation",
    domains: ["Foundational Literacy", "Foundational Numeracy", "World Observation & Play"],
    defaultTime: 45,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    accentBg: "bg-amber-50/70",
    borderAccent: "border-amber-200"
  },
  preparatory: {
    stage: "preparatory",
    name: "Preparatory Stage (Class 3–5)",
    subtitle: "Ages 8–11 • Discovery & Conceptual Worksheets",
    classes: ["Class 3", "Class 4", "Class 5"],
    focus: "Language, mathematics, world around us (EVS), learning habits",
    approach: "Activity, worksheet, oral response, project/portfolio",
    domains: ["Language & Reading", "Mathematics & Logic", "World Around Us (EVS)"],
    defaultTime: 60,
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    accentBg: "bg-emerald-50/70",
    borderAccent: "border-emerald-200"
  },
  middle: {
    stage: "middle",
    name: "Middle Stage (Class 6–8)",
    subtitle: "Ages 11–14 • Subject Understanding & Experimentation",
    classes: ["Class 6", "Class 7", "Class 8"],
    focus: "Subject understanding, reasoning, experimentation, digital/vocational",
    approach: "Competency question, practical, project, reflection",
    domains: ["Science & Discovery", "Mathematics & Reasoning", "Social & Vocational Skills"],
    defaultTime: 75,
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    accentBg: "bg-blue-50/70",
    borderAccent: "border-blue-200"
  },
  secondary: {
    stage: "secondary",
    name: "Secondary Stage (Class 9–10)",
    subtitle: "Ages 14–16 • Multidisciplinary Depth & Case Studies",
    classes: ["Class 9", "Class 10"],
    focus: "Deeper knowledge, analysis, application, career readiness",
    approach: "Case study, problem solving, written assessment",
    domains: ["Core Science & Analytical Logic", "Quantitative & Commerce Acumen", "Humanities & Critical Inquiry"],
    defaultTime: 90,
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    accentBg: "bg-indigo-50/70",
    borderAccent: "border-indigo-200"
  },
  senior_secondary: {
    stage: "senior_secondary",
    name: "Senior Secondary (Class 11–12)",
    subtitle: "Ages 16–18 • Stream Aptitude & Counseling Allocation",
    classes: ["Class 11", "Class 12", "Class 11-12"],
    focus: "Stream selection & diagnostic aptitude assessment",
    approach: "Stream diagnostic aptitude assessment (Science, Commerce, Humanities)",
    domains: ["Science (STEM)", "Commerce & Finance", "Humanities & Social Sciences"],
    defaultTime: 90,
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    accentBg: "bg-purple-50/70",
    borderAccent: "border-purple-200"
  }
};

function getStageForClass(cls: string): NepStageConfig {
  const c = String(cls || "").toLowerCase().trim();
  if (c === "class 1" || c === "class 2" || c.includes("foundational")) return NEP_STAGES.foundational;
  if (c === "class 3" || c === "class 4" || c === "class 5" || c.includes("prep")) return NEP_STAGES.preparatory;
  if (c === "class 6" || c === "class 7" || c === "class 8" || c.includes("middle")) return NEP_STAGES.middle;
  if (c === "class 9" || c === "class 10" || (c.includes("secondary") && !c.includes("senior"))) return NEP_STAGES.secondary;
  return NEP_STAGES.senior_secondary;
}

export default function SchoolStreamAssessmentPage() {
  const { user, schoolProfile, setSchoolProfile, setUser } = useAppStore();

  // Form State — Class selector configured across NEP 2020 Stages (Class 1 to 12)
  const [schoolName, setSchoolName] = useState(
    schoolProfile?.school_name || user?.schoolName || ""
  );
  const [schoolLogo, setSchoolLogo] = useState(
    schoolProfile?.logo_url || user?.schoolLogo || ""
  );
  const [className, setClassName] = useState<string>("Class 10");
  const [showMobilePaperModal, setShowMobilePaperModal] = useState<boolean>(false);
  const activeStage = getStageForClass(className);
  const isStreamAssessment = activeStage.stage === "senior_secondary";

  const getDefaultSubjectForClass = (cls: string): string => {
    const stage = getStageForClass(cls);
    if (stage.stage === "senior_secondary") {
      return "Stream Aptitude Assessment (Science, Commerce, Humanities)";
    }
    if (stage.stage === "secondary") {
      return `${cls} Multidisciplinary & Competency Assessment`;
    }
    if (stage.stage === "middle") {
      return `${cls} Middle Stage Core Assessment`;
    }
    if (stage.stage === "preparatory") {
      return `${cls} Preparatory Stage Conceptual Assessment`;
    }
    return `${cls} Foundational Stage FLN Assessment`;
  };

  const [title, setTitle] = useState("Class 10 Secondary Stage Competency & Diagnostic Assessment");
  const [timeAllowedMins, setTimeAllowedMins] = useState<number>(90);
  const [difficulty, setDifficulty] = useState<"foundation" | "balanced" | "advanced">("balanced");
  
  // Stream Mode (Class 11-12) question counts per domain
  const [numMcqsPerStream, setNumMcqsPerStream] = useState<number>(4);
  const [numShortPerStream, setNumShortPerStream] = useState<number>(2);
  const [numLongPerStream, setNumLongPerStream] = useState<number>(1);

  // Standard Class Mode (Class 1 to 10) direct question counts
  const [numSectionA, setNumSectionA] = useState<number>(10);
  const [numSectionB, setNumSectionB] = useState<number>(5);
  const [numSectionC, setNumSectionC] = useState<number>(3);

  const [customInstructions, setCustomInstructions] = useState("");

  // Stage-specific section configurations
  const getSectionConfig = (stageKey: string) => {
    switch (stageKey) {
      case "foundational":
        return {
          secAName: "Section A: Visual & Objective Questions",
          secBName: "Section B: Short Activity & Tracing Prompts",
          secCName: "Section C: Observation & Good Habits Scenario",
          secAMarks: 1,
          secBMarks: 2,
          secCMarks: 5,
          secADesc: "Picture matching, sounds & counting",
          secBDesc: "Fill in blanks, missing letters & tracing",
          secCDesc: "Scene interpretation & hygiene habits"
        };
      case "preparatory":
        return {
          secAName: "Section A: Objective & Mental Math MCQs",
          secBName: "Section B: Short Answer & Worksheet Tasks",
          secCName: "Section C: Real-World Scenario / Discovery",
          secAMarks: 1,
          secBMarks: 3,
          secCMarks: 5,
          secADesc: "Reading comprehension & mental math",
          secBDesc: "Step-by-step problem solving & facts",
          secCDesc: "Environmental & practical situations"
        };
      case "middle":
        return {
          secAName: "Section A: Objective & Conceptual MCQs",
          secBName: "Section B: Short Analytical & Reasoning",
          secCName: "Section C: Long Conceptual / Experiment Problem",
          secAMarks: 1,
          secBMarks: 3,
          secCMarks: 5,
          secADesc: "Core principles & concept check",
          secBDesc: "Scientific reasons & mathematical proofs",
          secCDesc: "Experiment deductions & case questions"
        };
      case "secondary":
        return {
          secAName: "Section A: Objective & Competency MCQs",
          secBName: "Section B: Short Answer & Application Questions",
          secCName: "Section C: CBSE Case Study / Long Analytical",
          secAMarks: 1,
          secBMarks: 3,
          secCMarks: 5,
          secADesc: "Competency MCQs & assertions",
          secBDesc: "Multi-step analytical application",
          secCDesc: "CBSE Case study scenario & sub-questions"
        };
      default:
        return {
          secAName: "Section A: Objective & Aptitude MCQs",
          secBName: "Section B: Short Analytical Questions",
          secCName: "Section C: Long Scenario & Case-Based",
          secAMarks: 1,
          secBMarks: 3,
          secCMarks: 5,
          secADesc: "Science, Commerce & Humanities mix",
          secBDesc: "Domain problem solving & reasoning",
          secCDesc: "Real-world trade-off & case analysis"
        };
    }
  };

  const secConfig = getSectionConfig(activeStage.stage);

  const handleClassChange = (newCls: string) => {
    setClassName(newCls);
    const newStage = getStageForClass(newCls);
    setTimeAllowedMins(newStage.defaultTime);
    const isStream = newStage.stage === "senior_secondary";
    if (isStream) {
      setTitle(`${newCls} Stream Allocation & Aptitude Diagnostic Assessment`);
    } else {
      setTitle(`${newCls} NEP 2020 Competency Assessment Paper`);
      if (newStage.stage === "foundational") {
        setNumSectionA(5);
        setNumSectionB(3);
        setNumSectionC(2);
      } else if (newStage.stage === "preparatory") {
        setNumSectionA(8);
        setNumSectionB(4);
        setNumSectionC(2);
      } else if (newStage.stage === "middle") {
        setNumSectionA(10);
        setNumSectionB(5);
        setNumSectionC(3);
      } else {
        setNumSectionA(10);
        setNumSectionB(6);
        setNumSectionC(3);
      }
    }
  };

  // Sync state from profile or pre-fetch school details from backend once
  const fetchedProfileRef = useRef(false);
  useEffect(() => {
    const activeLogo = schoolProfile?.logo_url || user?.schoolLogo;
    if (activeLogo && !schoolLogo) {
      setSchoolLogo(activeLogo);
    }
    const activeName = schoolProfile?.school_name || user?.schoolName;
    if (activeName && (!schoolName || schoolName === "Apex International School")) {
      setSchoolName(activeName);
    }

    // Only pre-fetch if missing and not yet fetched in this session
    if (user?.email && !schoolProfile && !user?.schoolLogo && !fetchedProfileRef.current) {
      fetchedProfileRef.current = true;
      const email = user.email.trim().toLowerCase();
      fetch(`${getApiBase()}/recruitment/schools/me?email=${encodeURIComponent(email)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.school) {
            setSchoolProfile(data.school);
            if (data.school.logo_url) {
              setSchoolLogo(data.school.logo_url);
            }
            if (data.school.school_name && (!schoolName || schoolName === "Apex International School")) {
              setSchoolName(data.school.school_name);
            }
          }
        })
        .catch((e) => console.warn("Could not pre-fetch school profile:", e));
    }
  }, [user?.email, user?.schoolLogo, user?.schoolName, schoolProfile?.logo_url, schoolProfile?.school_name]);

  // Generation & View State
  const [isGenerating, setIsGenerating] = useState(false);
  const [assessmentPaper, setAssessmentPaper] = useState<StreamAssessmentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"paper" | "key" | "counseling">("paper");
  const [viewMode, setViewMode] = useState<"generator" | "history">("generator");
  const [downloadingStudentPdf, setDownloadingStudentPdf] = useState(false);
  const [downloadingTeacherPdf, setDownloadingTeacherPdf] = useState(false);
  
  // Supabase Cloud History State
  const [cloudHistory, setCloudHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [paperToDelete, setPaperToDelete] = useState<{ id?: string; title: string; class_name?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync school name from profile
  useEffect(() => {
    const profileName = schoolProfile?.school_name || user?.schoolName;
    if (profileName && (!schoolName || schoolName === "Apex International School")) {
      setSchoolName(profileName);
    }
  }, [user?.schoolName, schoolProfile?.school_name]);

  // Load history from Supabase Cloud on mount & email change
  const loadCloudHistory = async () => {
    if (!user?.email) return;
    setLoadingHistory(true);
    try {
      const papers = await fetchPaperHistory(user.email);
      setCloudHistory(papers);
    } catch (e) {
      console.warn("Failed to load paper history from Supabase:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadCloudHistory();
  }, [user?.email]);

  // Live calculations (Stream Mode)
  const totalMcqs = numMcqsPerStream * 3;
  const totalShort = numShortPerStream * 3;
  const totalLong = numLongPerStream * 3;
  const streamTotalQuestions = totalMcqs + totalShort + totalLong;
  const marksPerStream = (numMcqsPerStream * 1) + (numShortPerStream * 3) + (numLongPerStream * 5);
  const streamTotalCalculatedMarks = marksPerStream * 3;

  // Live calculations (Class Mode)
  const classTotalQuestions = numSectionA + numSectionB + numSectionC;
  const classTotalCalculatedMarks = (numSectionA * secConfig.secAMarks) + (numSectionB * secConfig.secBMarks) + (numSectionC * secConfig.secCMarks);

  const effectiveTotalQuestions = isStreamAssessment ? streamTotalQuestions : classTotalQuestions;
  const effectiveTotalMarks = isStreamAssessment ? streamTotalCalculatedMarks : classTotalCalculatedMarks;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const effectiveSchoolName = schoolName || schoolProfile?.school_name || user?.schoolName || "";
      const effectiveSchoolLogo = schoolLogo || schoolProfile?.logo_url || user?.schoolLogo || "";

      const defaultSubject = getDefaultSubjectForClass(className);

      const payload: StreamAssessmentPayload = {
        title,
        class_name: className,
        nep_stage: activeStage.stage,
        subject: defaultSubject,
        school_name: effectiveSchoolName,
        school_logo: effectiveSchoolLogo,
        time_allowed_mins: Number(timeAllowedMins),
        difficulty,
        is_stream_assessment: isStreamAssessment,
        num_mcqs_per_stream: Number(numMcqsPerStream),
        num_short_per_stream: Number(numShortPerStream),
        num_long_per_stream: Number(numLongPerStream),
        total_mcqs: isStreamAssessment ? undefined : Number(numSectionA),
        total_short: isStreamAssessment ? undefined : Number(numSectionB),
        total_long: isStreamAssessment ? undefined : Number(numSectionC),
        section_a_name: secConfig.secAName,
        section_b_name: secConfig.secBName,
        section_c_name: secConfig.secCName,
        section_a_marks: secConfig.secAMarks,
        section_b_marks: secConfig.secBMarks,
        section_c_marks: secConfig.secCMarks,
        custom_instructions: customInstructions,
        user_email: user?.email || schoolProfile?.email || ""
      };

      const result = await generateStreamAssessment(payload);
      if (result && !result.school_logo && (effectiveSchoolLogo)) {
        result.school_logo = effectiveSchoolLogo;
      }
      if (result && (!result.school_name || result.school_name === "Apex International School") && effectiveSchoolName) {
        result.school_name = effectiveSchoolName;
      }
      setAssessmentPaper(result);
      setShowMobilePaperModal(true);
      setViewMode("generator");
      setActiveTab("paper");
      // Refresh cloud history after saving to Supabase
      loadCloudHistory();
    } catch (err: any) {
      console.error("Stream Assessment Generation failed:", err);
      setErrorMsg(err.message || "Failed to generate assessment. Please verify backend service and retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async (paperObj: any, includeAnswers: boolean) => {
    if (!paperObj) return;
    if (includeAnswers) setDownloadingTeacherPdf(true);
    else setDownloadingStudentPdf(true);

    try {
      const isDefaultOrGeneric = (name: string) => !name || name === "Apex International School" || name === "DEVGYA GLOBAL ACADEMY" || name === "School";
      const resolvedProfileName = schoolProfile?.school_name || user?.schoolName || schoolName || "";
      const nameToUse = (paperObj.school_name && !isDefaultOrGeneric(paperObj.school_name))
        ? paperObj.school_name
        : (resolvedProfileName || paperObj.school_name || "");

      const resolvedProfileLogo = schoolProfile?.logo_url || user?.schoolLogo || schoolLogo || "";
      const logoToUse = paperObj.school_logo || resolvedProfileLogo || "";

      const paperWithLogo = {
        ...paperObj,
        school_logo: logoToUse,
        school_name: nameToUse,
        user_email: user?.email || ""
      };
      await downloadStreamAssessmentPDF(paperWithLogo, includeAnswers);
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      if (includeAnswers) setDownloadingTeacherPdf(false);
      else setDownloadingStudentPdf(false);
    }
  };

  const confirmDeletePaper = async () => {
    if (!paperToDelete || !user?.email) return;
    setIsDeleting(true);
    try {
      const ok = await deletePaperFromHistory(user.email, paperToDelete);
      if (ok) {
        setCloudHistory(prev => prev.filter(p => !(
          (paperToDelete.id && p.id === paperToDelete.id) ||
          (p.title === paperToDelete.title && p.class_name === paperToDelete.class_name)
        )));
        if (assessmentPaper && assessmentPaper.title === paperToDelete.title) {
          setAssessmentPaper(null);
        }
        setDeleteSuccessNotice(`Paper "${paperToDelete.title}" permanently deleted from Supabase database.`);
        setTimeout(() => setDeleteSuccessNotice(null), 4000);
      } else {
        alert("Failed to delete paper from database. Please try again.");
      }
    } catch (e: any) {
      alert(`Delete error: ${e.message}`);
    } finally {
      setIsDeleting(false);
      setPaperToDelete(null);
    }
  };

  // Filter history
  const filteredHistory = cloudHistory.filter(p => {
    if (!historySearch.trim()) return true;
    const term = historySearch.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.subject && p.subject.toLowerCase().includes(term)) ||
      (p.class_name && p.class_name.toLowerCase().includes(term))
    );
  });

  const renderPaperWorkspace = (isModal: boolean = false) => {
    if (!assessmentPaper) return null;
    const paperIsStream = assessmentPaper.nep_stage === "senior_secondary" || assessmentPaper.class_name?.includes("11") || assessmentPaper.class_name?.includes("12");

    return (
      <div className="space-y-6">
        
        {/* ACTION & DOWNLOAD BAR */}
        <div className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl ${isModal ? 'p-4' : 'p-5'} text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg`}>
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Saved to Supabase Database &bull; Ready for Print
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">{assessmentPaper.title}</h2>
            <p className="text-xs text-slate-300">
              {assessmentPaper.total_marks} Marks &bull; {assessmentPaper.time_allowed_mins} Mins &bull; {assessmentPaper.questions?.length || 0} Questions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Student Paper PDF */}
            <button
              onClick={() => handleDownloadPDF(assessmentPaper, false)}
              disabled={downloadingStudentPdf}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 active:scale-98 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {downloadingStudentPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>Download Student Paper (PDF)</span>
            </button>

            {/* Download Teacher Key & Counseling Matrix PDF */}
            <button
              onClick={() => handleDownloadPDF(assessmentPaper, true)}
              disabled={downloadingTeacherPdf}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-500 active:scale-98 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {downloadingTeacherPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>Download Teacher Key & Rubric (PDF)</span>
            </button>

            {/* Quick Print */}
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              title="Print Paper"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setAssessmentPaper(null);
                setShowMobilePaperModal(false);
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              + New Paper
            </button>
          </div>
        </div>

        {/* 3 NEP STAGE DOMAIN SUMMARY TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {assessmentPaper.stream_breakdown && assessmentPaper.stream_breakdown.length >= 3 ? (
            assessmentPaper.stream_breakdown.slice(0, 3).map((b, bIdx) => {
              const tileThemes = [
                { bg: "bg-blue-50/70", border: "border-blue-200/80", text: "text-blue-900", badge: "bg-blue-600", desc: "text-blue-800", icon: Atom },
                { bg: "bg-emerald-50/70", border: "border-emerald-200/80", text: "text-emerald-900", badge: "bg-emerald-600", desc: "text-emerald-800", icon: DollarSign },
                { bg: "bg-purple-50/70", border: "border-purple-200/80", text: "text-purple-900", badge: "bg-purple-600", desc: "text-purple-800", icon: BookOpen }
              ];
              const theme = tileThemes[bIdx % 3];
              const Icon = theme.icon;
              return (
                <div key={bIdx} className={`p-4 rounded-3xl ${theme.bg} border ${theme.border} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${theme.text} flex items-center gap-1.5 uppercase tracking-wide line-clamp-1`}>
                      <Icon className="w-4 h-4 shrink-0" /> {b.stream_name || b.stream}
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${theme.badge} text-white shrink-0`}>
                      {b.total_marks} Marks
                    </span>
                  </div>
                  <p className={`text-[11px] ${theme.desc} leading-relaxed`}>
                    {b.key_competencies && b.key_competencies.length > 0
                      ? b.key_competencies.join(" • ")
                      : "Core domain competency, reasoning, and conceptual mastery."}
                  </p>
                </div>
              );
            })
          ) : (
            <>
              <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Atom className="w-4 h-4 text-blue-600" /> Science (STEM)
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {marksPerStream} Marks
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Physics mechanics, chemical kinetics, biology systems & mathematical logic.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Commerce & Finance
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    {marksPerStream} Marks
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Market dynamics, price elasticity, balance sheet logic & managerial trade-offs.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-purple-50/70 border border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <BookOpen className="w-4 h-4 text-purple-600" /> Humanities & Social
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-600 text-white">
                    {marksPerStream} Marks
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Constitutional rights, ethical evaluation, historical perspective & critical rhetoric.
                </p>
              </div>
            </>
          )}
        </div>

        {/* VIEW SWITCHER TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("paper")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "paper" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Student Question Paper
          </button>
          <button
            onClick={() => setActiveTab("key")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "key" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Teacher Answer Key & Scoring Guide
          </button>
          <button
            onClick={() => setActiveTab("counseling")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "counseling" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {(assessmentPaper?.nep_stage === "senior_secondary" || assessmentPaper?.class_name?.includes("11") || assessmentPaper?.class_name?.includes("12"))
              ? "School Counseling & Stream Matrix"
              : "Competency & Learning Rubric"}
          </button>
        </div>

        {/* TAB CONTENT 1: STUDENT QUESTION PAPER */}
        {activeTab === "paper" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            
            {/* Paper Top Branding */}
            <div className="text-center space-y-1.5 border-b border-slate-200 pb-5">
              {(assessmentPaper.school_logo || schoolLogo || user.schoolLogo) && (
                <div className="flex justify-center mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assessmentPaper.school_logo || schoolLogo || user.schoolLogo}
                    alt="School Logo"
                    className="w-14 h-14 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-2xs"
                  />
                </div>
              )}
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {assessmentPaper.school_name}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {assessmentPaper.title}
              </h3>
              <p className="text-xs font-bold text-indigo-700">
                {assessmentPaper.stream_breakdown && assessmentPaper.stream_breakdown.length > 0
                  ? assessmentPaper.stream_breakdown.map(b => b.stream_name || b.stream).join(" • ")
                  : "Science (STEM) • Commerce & Finance • Humanities & Social Sciences"}
              </p>
            </div>

            {/* STUDENT INFO BOX: ONLY NAME OF STUDENT, MAX TIME, MAX MARKS */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-bold">
              <div className="flex-1">
                Name of Student: ____________________________________________________
              </div>
              <div className="shrink-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                Max Marks: {assessmentPaper.total_marks}
              </div>
              <div className="shrink-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                Max Time: {assessmentPaper.time_allowed_mins} Minutes
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="font-bold text-slate-800">General Instructions:</div>
              {(assessmentPaper.instructions || [
                "All questions are compulsory across Science, Commerce, and Humanities sections.",
                "Section A consists of Objective MCQs (1 Mark each). Select the single most appropriate option.",
                "Section B consists of Short Analytical Questions (3 Marks each). Write concise, structured explanations.",
                "Section C consists of Long Scenario & Case-Based Questions (5 Marks each). Demonstrate analytical depth."
              ]).map((inst, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">&bull;</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <hr className="border-slate-200" />

            {/* Questions List */}
            <div className="space-y-6">
              {(assessmentPaper.questions || []).map((q: any) => {
                const streamObj = assessmentPaper.stream_breakdown?.find(s => s.stream === q.stream);
                const domainName = streamObj?.stream_name || `${q.stream} Domain`;

                const streamIdx = assessmentPaper.stream_breakdown?.findIndex(s => s.stream === q.stream);
                const badgeClass = streamIdx === 0 
                  ? "bg-blue-100 text-blue-800 border-blue-200" 
                  : streamIdx === 1 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                    : "bg-purple-100 text-purple-800 border-purple-200";

                return (
                  <div key={q.id || q.question_number} className="space-y-2 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80">
                    
                    {/* Question Header & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">Q{q.question_number}.</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${badgeClass}`}>
                          {domainName}
                        </span>
                        {q.competency && (
                          <span className="text-[10.5px] font-semibold text-slate-500 italic">
                            &bull; {q.competency}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        {q.marks} Mark{q.marks > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Case Passage if present */}
                    {q.case_passage && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                        <div className="font-bold text-slate-900 mb-1">CASE SCENARIO / CONTEXT:</div>
                        {q.case_passage}
                      </div>
                    )}

                    {/* Question Text */}
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.question_text}
                    </p>

                    {/* MCQ Options */}
                    {q.question_type === "mcq" && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2">
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Blank writing guide */}
                    {q.question_type === "short" && (
                      <div className="pt-1 text-[11px] text-slate-400 font-mono select-none">
                        Answer: ...........................................................................................................................................................
                      </div>
                    )}

                    {q.question_type === "long" && (
                      <div className="pt-1 text-[11px] text-slate-400 font-mono select-none space-y-1">
                        <div>Solution / Rationale: ............................................................................................................................................</div>
                        <div>..................................................................................................................................................................</div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB CONTENT 2: TEACHER ANSWER KEY */}
        {activeTab === "key" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            
            <div className="border-b border-slate-200 pb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                Teacher Evaluation Key
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Complete Model Answers & Marking Rubrics</h3>
              <p className="text-xs text-slate-500">Step-by-step scoring guidance and diagnostic competence notes for school evaluators.</p>
            </div>

            <div className="space-y-6">
              {(assessmentPaper.questions || []).map((q: any) => (
                <div key={q.id || q.question_number} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">Q{q.question_number}.</span>
                      <span className="text-xs font-bold text-indigo-700">
                        [{assessmentPaper.stream_breakdown?.find(s => s.stream === q.stream)?.stream_name || `${q.stream} Domain`}]
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{q.marks} Marks</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{q.question_text}</p>

                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5 text-xs">
                    <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Model Solution / Marking Key:</span>
                    </div>
                    <p className="text-emerald-950 font-medium whitespace-pre-line">{q.answer}</p>

                    {q.explanation && (
                      <div className="pt-1.5 text-[11px] text-emerald-800 border-t border-emerald-200/60">
                        <span className="font-bold">Aptitude Insight: </span>{q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB CONTENT 3: COUNSELING MATRIX */}
        {activeTab === "counseling" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            
            <div className="border-b border-slate-200 pb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                {paperIsStream ? "Diagnostic Counseling & Stream Allocation Guide" : "Competency & Learning Outcomes Rubric"}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {assessmentPaper.class_name || "Student"} {paperIsStream ? "Stream Diagnostic Rubric" : "Evaluation Matrix"}
              </h3>
              <p className="text-xs text-slate-500">
                {paperIsStream
                  ? "Framework for educators and academic advisors to evaluate student readiness and stream domain strengths."
                  : "Framework for teachers to evaluate learning outcomes, conceptual clarity, application depth, and problem-solving mastery."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Domain 1 / Section A Scorecard */}
              <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                  <Atom className="w-5 h-5 text-blue-600" />
                  <span>{assessmentPaper.stream_breakdown?.[0]?.stream_name || "Section A / Domain 1"}</span>
                </div>
                <div className="text-xs text-blue-950 leading-relaxed">
                  {assessmentPaper.diagnostic_matrix?.domain_1_indicators || assessmentPaper.diagnostic_matrix?.science_indicators || "Score >= 75%: High proficiency in foundational concepts and factual recall."}
                </div>
                <div className="pt-2 border-t border-blue-200 text-[11px] font-bold text-blue-800">
                  {paperIsStream
                    ? "Core Pathway: Advanced STEM, Engineering, Research, Analytics & Logic."
                    : "Competency Focus: Core concept comprehension, definition accuracy & objective reasoning."}
                </div>
              </div>

              {/* Domain 2 / Section B Scorecard */}
              <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>{assessmentPaper.stream_breakdown?.[1]?.stream_name || "Section B / Domain 2"}</span>
                </div>
                <div className="text-xs text-emerald-950 leading-relaxed">
                  {assessmentPaper.diagnostic_matrix?.domain_2_indicators || assessmentPaper.diagnostic_matrix?.commerce_indicators || "Score >= 75%: Strong acumen for structured step-by-step problem solving and application."}
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[11px] font-bold text-emerald-800">
                  {paperIsStream
                    ? "Core Pathway: Finance, Commerce, Enterprise Systems, Economics & Planning."
                    : "Competency Focus: Multi-step calculation, scientific explanation & procedural clarity."}
                </div>
              </div>

              {/* Domain 3 / Section C Scorecard */}
              <div className="p-5 rounded-3xl bg-purple-50/80 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span>{assessmentPaper.stream_breakdown?.[2]?.stream_name || "Section C / Domain 3"}</span>
                </div>
                <div className="text-xs text-purple-950 leading-relaxed">
                  {assessmentPaper.diagnostic_matrix?.domain_3_indicators || assessmentPaper.diagnostic_matrix?.humanities_indicators || "Score >= 75%: Outstanding higher-order synthesis and case-based problem solving."}
                </div>
                <div className="pt-2 border-t border-purple-200 text-[11px] font-bold text-purple-800">
                  {paperIsStream
                    ? "Core Pathway: Social Sciences, Law, Civil Policy, Humanities & Communications."
                    : "Competency Focus: Critical evaluation, case interpretation & real-world application."}
                </div>
              </div>
            </div>

            {/* Summary & Recommendations */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                {paperIsStream ? "Cross-Disciplinary & Counseling Advice" : "Pedagogical Recommendations & Next Steps"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {assessmentPaper.diagnostic_matrix?.balanced_recommendation ||
                  (paperIsStream
                    ? "Candidates demonstrating balanced performance across multiple streams should consider interdisciplinary combinations such as Economics with Mathematics, Legal Studies, or Cognitive Computing."
                    : "Students should focus on bridging any conceptual gaps in multi-step problem solving while continuing to reinforce foundational definitions and regular application practice.")}
              </p>
            </div>

          </div>
        )}

      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/dashboard/school" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>School Portal</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-indigo-600 font-extrabold">Stream Selection Assessment AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Class 11 - 12 Stream Suitability Assessment</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
              AI Powered
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Generate authentic diagnostic papers across <span className="font-semibold text-blue-600">Science</span>, <span className="font-semibold text-emerald-600">Commerce</span>, and <span className="font-semibold text-purple-600">Humanities</span>. Download ready-to-print student question papers and school evaluation rubrics.
          </p>
        </div>

        {/* View Switcher: Generator vs Cloud History (Desktop/Tablet only) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setViewMode("generator"); }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              viewMode === "generator" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paper Studio</span>
          </button>

          <button
            onClick={() => { setViewMode("history"); loadCloudHistory(); }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              viewMode === "history" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Paper History</span>
            {cloudHistory.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                viewMode === "history" ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                {cloudHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE QUICK ACTION: ACTIVE GENERATED PAPER MODAL BANNER */}
      {assessmentPaper && (
        <div className="lg:hidden p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-900 text-white flex items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black truncate">{assessmentPaper.title}</h4>
              <p className="text-[10px] text-indigo-200 font-medium truncate">
                {assessmentPaper.class_name} • {assessmentPaper.total_marks} Marks • Ready
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMobilePaperModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-900 font-extrabold text-xs shadow-xs hover:bg-slate-100 transition-colors shrink-0 cursor-pointer active:scale-95"
          >
            View Paper
          </button>
        </div>
      )}

      {deleteSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deleteSuccessNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {isGenerating ? "Retrying..." : "Retry Now"}
          </button>
        </div>
      )}

      {/* VIEW MODE 1: FULL SUPABASE CLOUD PAPER HISTORY */}
      {viewMode === "history" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Saved Assessments in Supabase Database</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Cloud Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All generated papers are permanently saved in cloud PostgreSQL. You can load, download PDFs, or delete anytime.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search saved papers..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 sm:w-56"
                />
              </div>
              <button
                onClick={loadCloudHistory}
                disabled={loadingHistory}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Refresh Cloud Database"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
          </div>

          {loadingHistory ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading assessments from Supabase Cloud...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Assessment Papers Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {historySearch ? "No papers match your search term." : "Generate your first Class 11-12 stream assessment paper to see it securely stored here in Supabase."}
              </p>
              <button
                onClick={() => setViewMode("generator")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Create New Assessment Paper
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((paper, idx) => (
                <div 
                  key={paper.id || idx}
                  className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {paper.class_name || "Class 11-12"}
                        </span>
                        <span className="text-[10.5px] font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {paper.created_at ? new Date(paper.created_at).toLocaleDateString() : "Saved"}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-1">{paper.title}</h3>
                    </div>

                    {/* Delete from Supabase Database button */}
                    <button
                      onClick={() => setPaperToDelete({ id: paper.id, title: paper.title, class_name: paper.class_name })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Permanently Delete from Database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600 py-1 border-y border-slate-100">
                    <span>{paper.total_marks || 45} Marks</span>
                    <span>&bull;</span>
                    <span>{paper.time_allowed_mins || 90} Mins</span>
                    <span>&bull;</span>
                    <span>{Array.isArray(paper.questions) ? paper.questions.length : 0} Questions</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setAssessmentPaper(paper);
                        setViewMode("generator");
                        setActiveTab("paper");
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors text-center cursor-pointer"
                    >
                      Open in Studio
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(paper, false)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download Student Paper PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Student PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(paper, true)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download Teacher Key & Rubric PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Key PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (

        /* VIEW MODE 2: GENERATOR & ACTIVE PAPER PREVIEW */
        !assessmentPaper ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLUMNS: CONFIGURATION FORM (NO CLASS SELECTOR ASKED) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
                
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Paper Configuration</h2>
                    <p className="text-xs text-slate-500">Configure institutional details, duration, difficulty, and question distribution.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* School Name & Logo Branding */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>School / Institution Name</span>
                        </label>
                        <input
                          type="text"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="e.g. Delhi Public School, R.K. Puram"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">School Logo</label>
                          {schoolLogo && (
                            <button
                              type="button"
                              onClick={() => setSchoolLogo("")}
                              className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {schoolLogo ? (
                            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )}
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === "string") {
                                      setSchoolLogo(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div className="px-3 py-2 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{schoolLogo ? "Change" : "Upload Logo"}</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. Target Class (NEP 2020 Structure - Syllabus & Domains Automatically Attached) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Target Class (Class 1 to 12)</span>
                      </label>
                      <span className="text-[11px] font-semibold text-indigo-600">
                        Paper Syllabus & Domains Automatically Attached
                      </span>
                    </div>
                    <select
                      value={className}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    >
                      <optgroup label="Foundational Stage (Class 1–2)">
                        <option value="Class 1">Class 1 (Foundational FLN & Play)</option>
                        <option value="Class 2">Class 2 (Foundational FLN & Picture Activity)</option>
                      </optgroup>
                      <optgroup label="Preparatory Stage (Class 3–5)">
                        <option value="Class 3">Class 3 (Preparatory Worksheet & EVS)</option>
                        <option value="Class 4">Class 4 (Preparatory Math & Discovery)</option>
                        <option value="Class 5">Class 5 (Preparatory Activity & Portfolio)</option>
                      </optgroup>
                      <optgroup label="Middle Stage (Class 6–8)">
                        <option value="Class 6">Class 6 (Middle Subject Understanding)</option>
                        <option value="Class 7">Class 7 (Middle Reasoning & Experimentation)</option>
                        <option value="Class 8">Class 8 (Middle Vocational & Science)</option>
                      </optgroup>
                      <optgroup label="Secondary Stage (Class 9–10)">
                        <option value="Class 9">Class 9 (Secondary Analysis & Problem Solving)</option>
                        <option value="Class 10">Class 10 (Secondary Case Study & Career Readiness)</option>
                      </optgroup>
                      <optgroup label="Senior Secondary (Class 11–12)">
                        <option value="Class 11">Class 11 (Stream Aptitude & Diagnostics)</option>
                        <option value="Class 12">Class 12 (Advanced Stream Assessment)</option>
                        <option value="Class 11-12">Class 11–12 (Full Stream Allocation Assessment)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* NEP 2020 Stage Architecture Guidance Banner */}
                  <div className={`sm:col-span-2 p-4 rounded-2xl border ${activeStage.borderAccent} ${activeStage.accentBg} space-y-2.5`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${activeStage.badgeColor}`}>
                          {activeStage.name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">{activeStage.subtitle}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">CBSE &bull; NEP 2020 Aligned</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                          Primary Focus (NEP 2020)
                        </div>
                        <div className="font-semibold text-slate-800 leading-snug">
                          {activeStage.focus}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                          Assessment Approach
                        </div>
                        <div className="font-semibold text-slate-800 leading-snug">
                          {activeStage.approach}
                        </div>
                      </div>
                    </div>

                    {isStreamAssessment ? (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/40">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                          3 Diagnostic Streams:
                        </span>
                        {activeStage.domains.map((d, dIdx) => (
                          <span key={dIdx} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs">
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/40">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                          Curriculum Mode:
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs">
                          {className} Subject Paper
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-indigo-700 shadow-2xs">
                          Custom Question Counts & Direct Scoring
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Assessment Title (Full width) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Paper Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Class 10 Secondary Stage Competency & Diagnostic Assessment"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Max Time Allowed (Minutes)</label>
                    <select
                      value={timeAllowedMins}
                      onChange={(e) => setTimeAllowedMins(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    >
                      <option value={30}>30 Minutes (Quick Quiz)</option>
                      <option value={45}>45 Minutes (Foundational Standard)</option>
                      <option value={60}>60 Minutes (Preparatory Standard)</option>
                      <option value={75}>75 Minutes (Middle Stage Standard)</option>
                      <option value={90}>90 Minutes (Secondary Standard - Recommended)</option>
                      <option value={120}>120 Minutes (2 Hours Mock)</option>
                      <option value={180}>180 Minutes (3 Hours Full Assessment)</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Difficulty Standard</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    >
                      <option value="foundation">Foundation (Core Concept Identification & Observation)</option>
                      <option value="balanced">Balanced (CBSE & NEP 2020 Standard - Recommended)</option>
                      <option value="advanced">Advanced (Higher-Order Thinking & Problem Solving)</option>
                    </select>
                  </div>
                </div>

                {/* QUESTION MIX & STRUCTURE MATRIX */}
                {isStreamAssessment ? (
                  /* 11th - 12th STREAM ASSESSMENT CONFIGURATION (Science, Commerce, Humanities) */
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-800">
                        Stream Aptitude Mix across 3 Streams ({activeStage.domains.join(" • ")})
                      </label>
                      <span className="text-[11px] font-bold text-indigo-600">
                        Equal 3-Way Domain Weight
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* MCQs per stream */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Section A: Objective</span>
                          <span className="text-[10px] font-extrabold text-slate-500">1 Mark each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={2}
                            max={8}
                            value={numMcqsPerStream}
                            onChange={(e) => setNumMcqsPerStream(Math.max(2, Math.min(8, Number(e.target.value))))}
                            className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold">per stream</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Total: {totalMcqs} Objective Qs ({totalMcqs} Marks)</p>
                      </div>

                      {/* Short per stream */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Section B: Short / Work</span>
                          <span className="text-[10px] font-extrabold text-slate-500">3 Marks each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={4}
                            value={numShortPerStream}
                            onChange={(e) => setNumShortPerStream(Math.max(1, Math.min(4, Number(e.target.value))))}
                            className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold">per stream</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Total: {totalShort} Short Qs ({totalShort * 3} Marks)</p>
                      </div>

                      {/* Long per stream */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Section C: Long / Case</span>
                          <span className="text-[10px] font-extrabold text-slate-500">5 Marks each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={2}
                            value={numLongPerStream}
                            onChange={(e) => setNumLongPerStream(Math.max(1, Math.min(2, Number(e.target.value))))}
                            className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold">per stream</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Total: {totalLong} Long/Case Qs ({totalLong * 5} Marks)</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CLASS 1 TO 10 QUESTION PAPER STRUCTURE (Direct Section Counts) */
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-800">
                        Question Paper Structure ({className} &bull; {activeStage.name.split(" (")[0]})
                      </label>
                      <span className="text-[11px] font-bold text-indigo-600">
                        {classTotalQuestions} Questions &bull; {classTotalCalculatedMarks} Total Marks
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Section A */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 line-clamp-1">{secConfig.secAName.split(":")[1] || "Objective"}</span>
                          <span className="text-[10px] font-extrabold text-slate-500">{secConfig.secAMarks} Mark each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={numSectionA}
                            onChange={(e) => setNumSectionA(Math.max(1, Math.min(30, Number(e.target.value))))}
                            className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold">questions</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{secConfig.secADesc} ({numSectionA * secConfig.secAMarks} Marks)</p>
                      </div>

                      {/* Section B */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 line-clamp-1">{secConfig.secBName.split(":")[1] || "Short Answer"}</span>
                          <span className="text-[10px] font-extrabold text-slate-500">{secConfig.secBMarks} Marks each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={numSectionB}
                            onChange={(e) => setNumSectionB(Math.max(1, Math.min(20, Number(e.target.value))))}
                            className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold">questions</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{secConfig.secBDesc} ({numSectionB * secConfig.secBMarks} Marks)</p>
                      </div>

                      {/* Section C */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 line-clamp-1">{secConfig.secCName.split(":")[1] || "Long / Case"}</span>
                          <span className="text-[10px] font-extrabold text-slate-500">{secConfig.secCMarks} Marks each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={numSectionC}
                            onChange={(e) => setNumSectionC(Math.max(1, Math.min(10, Number(e.target.value))))}
                            className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold">questions</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{secConfig.secCDesc} ({numSectionC * secConfig.secCMarks} Marks)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Guidance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Custom School Instructions / Focus Notes (Optional)
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder={
                      isStreamAssessment
                        ? "e.g. Focus on practical real-world applications, NEP 2020 competency-based reasoning, and financial literacy."
                        : "e.g. Focus on core syllabus chapters, real-world examples, step-by-step problem solving, and CBSE competency patterns."
                    }
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 active:scale-98 transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Authentic Question Paper with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        Generate {className} ({isStreamAssessment ? "Stream Assessment" : activeStage.name.split(" (")[0]}) Paper
                      </span>
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* RIGHT 1 COLUMN: LIVE SUMMARY & CLOUD SYNCED PAPERS (DESKTOP ONLY - HIDDEN ON MOBILE) */}
            <div className="hidden lg:block space-y-6">
              
              {/* Real-time Paper Summary Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 rounded-3xl border border-indigo-100 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Live Paper Metrics</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase border ${activeStage.badgeColor}`}>
                    {className}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-600">Total Questions</span>
                    <span className="text-sm font-black text-slate-900">{effectiveTotalQuestions} Questions</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-600">Total Marks</span>
                    <span className="text-sm font-black text-indigo-600">{effectiveTotalMarks} Marks</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-600">{isStreamAssessment ? "Weight Per Domain" : "Section Structure"}</span>
                    <span className="text-xs font-black text-slate-900">
                      {isStreamAssessment ? `${marksPerStream} Marks each (33.3%)` : "3 Structured Sections"}
                    </span>
                  </div>
                </div>

                {/* Stage Domain or Section Breakdown Bars */}
                {isStreamAssessment ? (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-700 flex items-center gap-1.5 line-clamp-1">
                        <Atom className="w-3.5 h-3.5 shrink-0" /> {activeStage.domains[0]}
                      </span>
                      <span className="shrink-0">{marksPerStream} M</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-full rounded-full" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                      <span className="text-emerald-700 flex items-center gap-1.5 line-clamp-1">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" /> {activeStage.domains[1]}
                      </span>
                      <span className="shrink-0">{marksPerStream} M</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full w-full rounded-full" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                      <span className="text-purple-700 flex items-center gap-1.5 line-clamp-1">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" /> {activeStage.domains[2]}
                      </span>
                      <span className="shrink-0">{marksPerStream} M</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full w-full rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-indigo-700 flex items-center gap-1.5 line-clamp-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" /> {secConfig.secAName.split(":")[1] || "Section A"}
                      </span>
                      <span className="shrink-0">{numSectionA * secConfig.secAMarks} M ({numSectionA} Qs)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.round(((numSectionA * secConfig.secAMarks) / Math.max(1, classTotalCalculatedMarks)) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                      <span className="text-emerald-700 flex items-center gap-1.5 line-clamp-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" /> {secConfig.secBName.split(":")[1] || "Section B"}
                      </span>
                      <span className="shrink-0">{numSectionB * secConfig.secBMarks} M ({numSectionB} Qs)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.round(((numSectionB * secConfig.secBMarks) / Math.max(1, classTotalCalculatedMarks)) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                      <span className="text-purple-700 flex items-center gap-1.5 line-clamp-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" /> {secConfig.secCName.split(":")[1] || "Section C"}
                      </span>
                      <span className="shrink-0">{numSectionC * secConfig.secCMarks} M ({numSectionC} Qs)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.round(((numSectionC * secConfig.secCMarks) / Math.max(1, classTotalCalculatedMarks)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Supabase Cloud Synced Papers Widget */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Supabase Cloud History</span>
                  </h3>
                  <button 
                    onClick={() => setViewMode("history")}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    View All ({cloudHistory.length})
                  </button>
                </div>

                {cloudHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No papers saved yet. Generated papers persist in Supabase automatically.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cloudHistory.slice(0, 3).map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-2 group"
                      >
                        <div 
                          onClick={() => {
                            setAssessmentPaper(item);
                            setActiveTab("paper");
                          }}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{item.total_marks || 45} Marks</span>
                            <span>&bull;</span>
                            <span>{item.time_allowed_mins || 90} Mins</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setPaperToDelete({ id: item.id, title: item.title, class_name: item.class_name })}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete from Database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          
          /* 3. GENERATED PAPER WORKSPACE & PDF DOWNLOADS */
          <div>
            {/* Desktop Full Workspace */}
            <div className="hidden lg:block">
              {renderPaperWorkspace(false)}
            </div>

            {/* Mobile View: Alert Banner + Pop-up Modal Re-open Button */}
            <div className="lg:hidden space-y-4">
              <div className="bg-white rounded-3xl border border-indigo-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Saved to Supabase Database
                  </span>
                  <button
                    onClick={() => { setAssessmentPaper(null); setShowMobilePaperModal(false); }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    + New Paper
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2">{assessmentPaper.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {assessmentPaper.total_marks} Marks &bull; {assessmentPaper.time_allowed_mins} Mins &bull; {assessmentPaper.questions?.length || 0} Questions
                  </p>
                </div>

                <button
                  onClick={() => setShowMobilePaperModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Open Question Paper in Pop-up Modal</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadPDF(assessmentPaper, false)}
                    disabled={downloadingStudentPdf}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {downloadingStudentPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <Download className="w-3.5 h-3.5 text-indigo-600" />}
                    <span>Student PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(assessmentPaper, true)}
                    disabled={downloadingTeacherPdf}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {downloadingTeacherPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-indigo-600" />}
                    <span>Teacher Key</span>
                  </button>
                </div>
              </div>

              {/* Render paper content underneath on mobile as well */}
              <div className="pt-2">
                {renderPaperWorkspace(false)}
              </div>
            </div>
          </div>

        )
      )}

      {/* FULL-SCREEN MOBILE QUESTION PAPER POP-UP MODAL */}
      {showMobilePaperModal && assessmentPaper && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col p-2 sm:p-4 pb-20 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-200">
            
            {/* MODAL TOP BAR */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black truncate">{assessmentPaper.title}</h3>
                  <p className="text-[11px] text-indigo-200 font-medium truncate">
                    {assessmentPaper.class_name} • {assessmentPaper.total_marks} Marks • {assessmentPaper.time_allowed_mins} Mins
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMobilePaperModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY (PAPER WORKSPACE) */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 overscroll-contain">
              {renderPaperWorkspace(true)}
            </div>

          </div>
        </div>
      )}

      {/* PERMANENT DATABASE DELETE CONFIRMATION MODAL */}
      {paperToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Paper from Database?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-slate-800">&quot;{paperToDelete.title}&quot;</span>? This will remove the paper permanently from the Supabase database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPaperToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePaper}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from Cloud...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete from Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
