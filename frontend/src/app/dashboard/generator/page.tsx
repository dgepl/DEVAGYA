"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Edit3, 
  Trash2, 
  BookOpen, 
  AlertCircle,
  Calculator,
  Check,
  Eye,
  Sliders,
  Layers,
  Upload,
  X,
  Plus,
  Save,
  GraduationCap,
  Award,
  Clock,
  Building,
  HelpCircle,
  FileCheck,
  History,
  RotateCcw,
  Send,
  FileSpreadsheet
} from "lucide-react";
import { 
  generateQuestionPaper,
  generateQuestionPaperFromFile, 
  GeneratedPaperResponse, 
  QuestionItem, 
  downloadPDF 
} from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";
import { CBSE_NCERT_CURRICULUM } from "@/lib/cbseNcertCurriculum";

export default function GeneratorPage() {
  const router = useRouter();
  const { user, ocrDraftText, savedPapers, savePaper, deleteSavedPaper, setOcrDraftText } = useAppStore();

  // Dynamic NCERT Curriculum Lookups
  const availableClasses = Object.keys(CBSE_NCERT_CURRICULUM);
  
  // Clean Form State (Auto-Prefills from Teacher Profile)
  const [schoolName, setSchoolName] = useState(user.schoolName || "");
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState(user.classes || "Class 10");
  const [subject, setSubject] = useState(user.subject || "Science");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [totalMarks, setTotalMarks] = useState<string>("");
  const [timeMins, setTimeMins] = useState<string>("");
  const [numMcqs, setNumMcqs] = useState<string>("4");
  const [numShort, setNumShort] = useState<string>("2");
  const [numLong, setNumLong] = useState<string>("1");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  // Dynamic Subject and Chapter derivations
  const currentClassData = CBSE_NCERT_CURRICULUM[className] || CBSE_NCERT_CURRICULUM["Class 10"];
  const availableSubjects = Object.keys(currentClassData?.subjects || {});
  const availableChapters = currentClassData?.subjects?.[subject] || [];

  // Handle Class Change -> Auto-select first valid Subject & Chapter
  const handleClassChange = (newClass: string) => {
    setClassName(newClass);
    const subjs = Object.keys(CBSE_NCERT_CURRICULUM[newClass]?.subjects || {});
    const nextSubj = subjs.includes(subject) ? subject : (subjs[0] || "Science");
    setSubject(nextSubj);
    const chaps = CBSE_NCERT_CURRICULUM[newClass]?.subjects?.[nextSubj] || [];
    setChapter(chaps[0] || "");
  };

  // Handle Subject Change -> Auto-select first valid Chapter
  const handleSubjectChange = (newSubj: string) => {
    setSubject(newSubj);
    const chaps = CBSE_NCERT_CURRICULUM[className]?.subjects?.[newSubj] || [];
    setChapter(chaps[0] || "");
  };

  // Auto-update from user profile on login/profile updates
  useEffect(() => {
    if (user) {
      if (user.schoolName && !schoolName) setSchoolName(user.schoolName);
      if (user.classes && !className) {
        setClassName(user.classes);
        const subjs = Object.keys(CBSE_NCERT_CURRICULUM[user.classes]?.subjects || {});
        if (user.subject && subjs.includes(user.subject)) {
          setSubject(user.subject);
        } else if (subjs.length > 0) {
          setSubject(subjs[0]);
        }
      } else if (user.subject && !subject) {
        setSubject(user.subject);
      }
    }
  }, [user]);

  // File Attachment State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Paper, History Modal & Mobile View State
  const [paper, setPaper] = useState<GeneratedPaperResponse | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showMobilePaperModal, setShowMobilePaperModal] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Execution State
  const [loading, setLoading] = useState(false);
  const [downloadingStudent, setDownloadingStudent] = useState(false);
  const [downloadingTeacher, setDownloadingTeacher] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  // Real-time Mark Breakdown Tally Calculator
  const parsedMcqs = parseInt(numMcqs) || 0;
  const parsedShort = parseInt(numShort) || 0;
  const parsedLong = parseInt(numLong) || 0;
  const calculatedTotal = (parsedMcqs * 1) + (parsedShort * 3) + (parsedLong * 5);
  const requestedTotal = parseInt(totalMarks) || 0;

  useEffect(() => {
    if (ocrDraftText) {
      setCustomPrompt(`Based on OCR scanned textbook extract:\n${ocrDraftText}`);
    }
  }, [ocrDraftText]);

  // Clean form when leaving page
  useEffect(() => {
    return () => {
      setOcrDraftText("");
    };
  }, [setOcrDraftText]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartNewPaper = () => {
    setPaper(null);
    setTitle("");
    setClassName("");
    setSubject("");
    setChapter("");
    setTotalMarks("");
    setTimeMins("");
    setCustomPrompt("");
    removeFile();
    setShowMobilePaperModal(false);
  };

  const handleGenerate = async (forceSyllabus: boolean = false) => {
    setError(null);

    // 1. Mandatory Fields Validation Check
    if (!schoolName.trim()) {
      setError("Custom Institution Name is compulsory. Please enter your school or institution name.");
      return;
    }
    if (!title.trim()) {
      setError("Assessment Title is compulsory. Please enter an exam/assessment title.");
      return;
    }
    if (!className.trim()) {
      setError("Grade / Class is compulsory. Please select a class.");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is compulsory. Please select a subject from the CBSE/NCERT curriculum.");
      return;
    }
    if (!chapter.trim()) {
      setError("Topic / Chapter is compulsory. Please select or enter a chapter/topic.");
      return;
    }

    const hasOcrContext = Boolean(ocrDraftText || (customPrompt && customPrompt.includes("Based on OCR scanned textbook extract:")));

    // If no file and no OCR context, and user hasn't explicitly chosen direct syllabus generation
    if (!hasOcrContext && !selectedFile && !forceSyllabus) {
      setError("Reference Document Recommended: Please attach a textbook photo or PDF above, or click 'Generate from CBSE Syllabus' to synthesize directly from curriculum.");
      if (fileInputRef.current?.parentElement) {
        fileInputRef.current.parentElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);

    const targetSchoolName = schoolName.trim();
    const targetTitle = title.trim();
    const targetClass = className.trim();
    const targetSubject = subject.trim();
    const targetChapter = chapter.trim();
    const finalMarks = requestedTotal > 0 ? requestedTotal : (calculatedTotal > 0 ? calculatedTotal : 25);
    const finalTime = parseInt(timeMins) || (finalMarks <= 25 ? 45 : (finalMarks <= 50 ? 90 : 180));

    try {
      let res: GeneratedPaperResponse;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("school_name", targetSchoolName);
        formData.append("school_logo", user.schoolLogo || "");
        formData.append("title", targetTitle);
        formData.append("class_name", targetClass);
        formData.append("subject", targetSubject);
        formData.append("chapter", targetChapter);
        formData.append("difficulty", difficulty);
        formData.append("total_marks", finalMarks.toString());
        formData.append("time_allowed_mins", finalTime.toString());
        formData.append("num_mcqs", parsedMcqs.toString());
        formData.append("num_short", parsedShort.toString());
        formData.append("num_long", parsedLong.toString());
        formData.append("custom_instructions", customPrompt);
        formData.append("user_email", user.email || "");

        res = await generateQuestionPaperFromFile(formData);
      } else {
        res = await generateQuestionPaper({
          school_name: targetSchoolName,
          school_logo: user.schoolLogo,
          title: targetTitle,
          class_name: targetClass,
          subject: targetSubject,
          chapter: targetChapter,
          difficulty,
          total_marks: finalMarks,
          time_allowed_mins: finalTime,
          num_mcqs: parsedMcqs,
          num_short: parsedShort,
          num_long: parsedLong,
          custom_instructions: customPrompt,
          user_email: user.email || ""
        });
      }

      if (user.schoolLogo && !res.school_logo) {
        res.school_logo = user.schoolLogo;
      }
      setPaper(res);
      savePaper(res);
      setShowMobilePaperModal(true);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate AI paper. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Edit Header (Total Marks, Title, School Name, Time) After Paper Creation
  const handleUpdatePaperHeader = (fields: Partial<GeneratedPaperResponse>) => {
    if (!paper) return;
    const updated = { ...paper, ...fields };
    setPaper(updated);
    savePaper(updated);
  };

  // Inline Question Editing
  const handleUpdateQuestion = (id: number, updatedFields: Partial<QuestionItem>) => {
    if (!paper) return;
    const updatedQuestions = paper.questions.map((q) => {
      if (q.id === id) {
        return { ...q, ...updatedFields };
      }
      return q;
    });

    const updated = { ...paper, questions: updatedQuestions };
    setPaper(updated);
    savePaper(updated);
  };

  const handleDeleteQuestion = (id: number) => {
    if (!paper) return;
    const updatedQuestions = paper.questions.filter((q) => q.id !== id);
    const updated = { ...paper, questions: updatedQuestions };
    setPaper(updated);
    savePaper(updated);
  };

  const handleAddQuestion = () => {
    if (!paper) return;
    const newId = (paper.questions.length > 0 ? Math.max(...paper.questions.map(q => q.id)) : 0) + 1;
    const newQ: QuestionItem = {
      id: newId,
      question_number: newId,
      question_type: "mcq",
      question_text: "New custom question added by teacher...",
      marks: 1,
      options: ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
      answer: "(A) Option 1",
      explanation: "Step-by-step teacher explanation."
    };
    const updated = {
      ...paper,
      questions: [...paper.questions, newQ]
    };
    setPaper(updated);
    savePaper(updated);
    setEditingQuestionId(newId);
  };

  const handleSelectFromHistory = (selected: GeneratedPaperResponse) => {
    setPaper(selected);
    setShowHistory(false);
    setShowMobilePaperModal(true);
  };

  const handleDownloadStudentPDF = async () => {
    if (!paper) return;
    setDownloadingStudent(true);
    try {
      const paperWithLogo = {
        ...paper,
        school_name: paper.school_name || schoolName || user.schoolName || "DEVGYA GLOBAL ACADEMY",
        school_logo: (paper as any).school_logo || user.schoolLogo || ""
      };
      await downloadPDF(paperWithLogo, false);
    } catch (err) {
      console.error(err);
      alert("Error generating Student Question Paper PDF.");
    } finally {
      setDownloadingStudent(false);
    }
  };

  const handleDownloadTeacherPDF = async () => {
    if (!paper) return;
    setDownloadingTeacher(true);
    try {
      const paperWithLogo = {
        ...paper,
        school_name: paper.school_name || schoolName || user.schoolName || "DEVGYA GLOBAL ACADEMY",
        school_logo: (paper as any).school_logo || user.schoolLogo || ""
      };
      await downloadPDF(paperWithLogo, true);
    } catch (err) {
      console.error(err);
      alert("Error generating Teacher Answer Key PDF.");
    } finally {
      setDownloadingTeacher(false);
    }
  };

  // Reusable Paper Studio Content Component
  const renderPaperStudioContent = (isModal: boolean = false) => {
    if (!paper) return null;

    return (
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7 space-y-6 animate-in fade-in ${isModal ? "h-full overflow-y-auto" : ""}`}>
        
        {/* EDITABLE PAPER HEADER */}
        <div className="border-b border-slate-200 pb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-black uppercase">
                {paper.class_name || "Class 10"} • {paper.subject || "General"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setIsEditingHeader(!isEditingHeader)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                title="Edit Paper Details & Total Marks"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isEditingHeader ? "Save Details" : "Edit Details"}</span>
              </button>

              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  showAnswerKey ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showAnswerKey ? "Hide Solutions" : "Show Solutions"}</span>
              </button>

              <button
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* DISPLAY OR EDIT HEADER DETAILS */}
          {isEditingHeader ? (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Exam Title</label>
                  <input
                    type="text"
                    value={paper.title}
                    onChange={(e) => handleUpdatePaperHeader({ title: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">School Name</label>
                  <input
                    type="text"
                    value={paper.school_name}
                    onChange={(e) => handleUpdatePaperHeader({ school_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Total Marks (Editable)</label>
                  <input
                    type="number"
                    value={paper.total_marks}
                    onChange={(e) => handleUpdatePaperHeader({ total_marks: Number(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Time Allowed (Mins)</label>
                  <input
                    type="number"
                    value={paper.time_allowed_mins}
                    onChange={(e) => handleUpdatePaperHeader({ time_allowed_mins: Number(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{paper.title}</h2>
              <p className="text-xs text-slate-600 font-bold mt-0.5">
                {paper.school_name} • <span className="text-indigo-700 font-extrabold">{paper.total_marks} Total Marks</span> • {paper.time_allowed_mins} Mins
              </p>
            </div>
          )}
        </div>

        {/* PDF DOWNLOAD QUICK BAR */}
        <div className="flex flex-wrap items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mr-auto">
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            PDF Exports:
          </span>

          <button
            onClick={handleDownloadStudentPDF}
            disabled={downloadingStudent}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{downloadingStudent ? "Building..." : "Student PDF"}</span>
          </button>

          <button
            onClick={handleDownloadTeacherPDF}
            disabled={downloadingTeacher}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{downloadingTeacher ? "Building..." : "Teacher Key PDF"}</span>
          </button>
        </div>

        {/* QUESTIONS LIST WITH INLINE EDITING */}
        <div className="space-y-4">
          {paper.questions.map((q, index) => {
            const isEditing = editingQuestionId === q.id;
            return (
              <div
                key={q.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isEditing ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-400" : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-indigo-700">
                      <span>Q{index + 1}. ({q.question_type.toUpperCase()})</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleUpdateQuestion(q.id, { marks: Number(e.target.value) || 1 })}
                          className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900"
                          title="Edit Question Marks"
                        />
                      ) : (
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-[10px]">
                          {q.marks} Mark{q.marks > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* QUESTION TEXT */}
                    {isEditing ? (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Question Text</label>
                        <textarea
                          rows={3}
                          value={q.question_text}
                          onChange={(e) => handleUpdateQuestion(q.id, { question_text: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        <Markdown content={q.question_text} />
                      </div>
                    )}

                    {/* OPTIONS FOR MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...q.options!];
                                  newOpts[optIdx] = e.target.value;
                                  handleUpdateQuestion(q.id, { options: newOpts });
                                }}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                              />
                            ) : (
                              <div className="text-xs font-semibold text-slate-700 block bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                <Markdown content={opt} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ANSWER & EXPLANATION */}
                    {showAnswerKey && (
                      <div className="mt-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-emerald-800 flex-wrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Correct Answer:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={q.answer}
                              onChange={(e) => handleUpdateQuestion(q.id, { answer: e.target.value })}
                              className="flex-1 bg-white border border-emerald-300 rounded px-2 py-0.5 text-xs font-bold text-slate-900"
                            />
                          ) : (
                            <span className="font-bold text-slate-900"><Markdown content={q.answer} /></span>
                          )}
                        </div>

                        {q.explanation && (
                          <div className="text-[11px] text-emerald-800 font-medium italic pt-1 flex items-start gap-1">
                            <span>💡</span>
                            <div className="flex-1">
                              <Markdown content={q.explanation} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <button
                        onClick={() => setEditingQuestionId(null)}
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                        title="Done Editing"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingQuestionId(q.id)}
                        className="p-2 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer"
                        title="Edit Question"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-24 sm:pb-8">
      
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-700/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black">AI Question Paper Studio</h1>
              <p className="text-indigo-200 text-xs sm:text-sm">
                Full-control assessment builder with custom file uploads, inline question editing, and clean watermark-free PDF exports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          
          {/* PAPER HISTORY BUTTON */}
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            title="View Paper History"
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>Paper History</span>
            {savedPapers.length > 0 && (
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                {savedPapers.length}
              </span>
            )}
          </button>

          {paper && (
            <>
              <button
                onClick={handleStartNewPaper}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Paper</span>
              </button>

              <button
                onClick={() => setShowMobilePaperModal(true)}
                className="lg:hidden px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-300" />
                <span>View Paper Studio</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* STICKY BOTTOM BAR FOR MOBILE WHEN A PAPER IS ACTIVE */}
      {paper && (
        <div className="lg:hidden fixed bottom-18 left-4 right-4 z-40 animate-in slide-in-from-bottom-5">
          <button
            onClick={() => setShowMobilePaperModal(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center justify-between border border-white/20 cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">View Paper: {paper.title}</span>
            </span>
            <span className="bg-white/20 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0">Open Pop-up ↗</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM PANEL (LEFT) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Assessment Configuration Form
            </h2>
            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full">
              * Mandatory Fields
            </span>
          </div>

          {/* ACTIVE SCHOOL BRANDING STATUS CARD */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                {user.schoolLogo ? (
                  <img src={user.schoolLogo} alt="School Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                  Active School Branding
                </span>
                <p className="text-xs font-black text-slate-900 truncate">
                  {schoolName || user.schoolName || "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {user.board || "CBSE"} &bull; {user.subject || "All Subjects"} &bull; {user.classes || "Class 10"}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline shrink-0 cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* 1. School Name & Title */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Institution Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. St. Xavier's Senior Secondary School"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assessment Title <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Term-1 Periodic Unit Test"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* 2. Class & Subject (Dynamic CBSE/NCERT Dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grade / Class <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={className}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="">Select Class</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject (for {className || "Class"}) <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="">Select Subject</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Chapter & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Topic / Chapter (CBSE / NCERT) <span className="text-rose-500 font-bold">*</span>
              </label>
              {availableChapters.length > 0 ? (
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                >
                  <option value="">Select Chapter / Topic</option>
                  {availableChapters.map((ch) => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="e.g. Acids, Bases & Salts"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize cursor-pointer transition"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* 4. Marks & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="40"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" /> Time (Mins)
              </label>
              <input
                type="number"
                value={timeMins}
                onChange={(e) => setTimeMins(e.target.value)}
                placeholder="90"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 5. Question Breakdown Controls */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-extrabold text-slate-900">Section Breakdown</span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                calculatedTotal === requestedTotal ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                Tally: {calculatedTotal} / {requestedTotal || calculatedTotal} Marks
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1">MCQs (1M)</label>
                <input
                  type="number"
                  min={0}
                  value={numMcqs}
                  onChange={(e) => setNumMcqs(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 text-xs font-black text-center text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1">Short (3M)</label>
                <input
                  type="number"
                  min={0}
                  value={numShort}
                  onChange={(e) => setNumShort(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 text-xs font-black text-center text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1">Long (5M)</label>
                <input
                  type="number"
                  min={0}
                  value={numLong}
                  onChange={(e) => setNumLong(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 text-xs font-black text-center text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 6. Custom File Attachment (OCR / Syllabus Extract) */}
          <div className="space-y-2">
            {(() => {
              const hasOcr = Boolean(ocrDraftText || (customPrompt && customPrompt.includes("Based on OCR scanned textbook extract:")));
              return (
                <label className="block text-xs font-bold text-slate-700 flex flex-wrap items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Attach Reference Document / Image</span>
                    {hasOcr ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                        ✓ Provided via OCR Scanner (Optional)
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-amber-850 bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-md">
                        Compulsory *
                      </span>
                    )}
                  </span>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-[10px] text-rose-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </label>
              );
            })()}

            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.docx,.txt"
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">Click to upload textbook photo or PDF</p>
                <p className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, PDF (Up to 15MB)</p>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-indigo-200 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 7. Custom Prompt Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-500" /> Custom Teacher Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Include 2 numerical problems on Ohm's Law and emphasize NCERT HOTS questions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ERROR & ACTION DISPLAY */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5">
              <p className="text-xs text-rose-700 font-bold flex items-start gap-1.5">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100/50 text-rose-800 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-600" />
                  <span>Attach Document / Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate from CBSE Syllabus Directly</span>
                </button>
              </div>
            </div>
          )}

          {/* GENERATE BUTTON */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Question Paper...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Question Paper</span>
              </>
            )}
          </button>

        </div>

        {/* PAPER PREVIEW & EDIT STUDIO (RIGHT - DESKTOP ONLY) */}
        <div className="hidden lg:block lg:col-span-7 space-y-6">
          {!paper ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">No Active Paper Loaded</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                Fill out the configuration form on the left or click <b>Paper History (🕒)</b> to load a saved exam paper.
              </p>
            </div>
          ) : (
            renderPaperStudioContent(false)
          )}
        </div>

      </div>

      {/* FULL-SCREEN MOBILE PAPER STUDIO POP-UP MODAL */}
      {showMobilePaperModal && paper && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col p-2 sm:p-4 pb-24 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-200">
            
            {/* MODAL TOP BAR */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black truncate">{paper.title}</h3>
                  <p className="text-[11px] text-indigo-200 font-medium truncate">
                    {paper.class_name} • {paper.subject} • {paper.total_marks} Marks
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

            {/* MODAL BODY (PAPER STUDIO) */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              {renderPaperStudioContent(true)}
            </div>

          </div>
        </div>
      )}

      {/* PAPER HISTORY DRAWER / MODAL (CLOCK ICON 🕒) */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-end p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg h-full max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* DRAWER HEADER */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black">Question Paper History</h3>
                  <p className="text-indigo-200 text-xs font-semibold">{savedPapers.length} Saved Exam Papers</p>
                </div>
              </div>

              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PAPERS LIST */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {savedPapers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <History className="w-10 h-10 mx-auto opacity-50 text-indigo-400" />
                  <p className="text-xs font-bold">No saved question papers in history yet.</p>
                </div>
              ) : (
                savedPapers.map((saved, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/50 transition-all flex items-start justify-between gap-3 group"
                  >
                    <button
                      onClick={() => handleSelectFromHistory(saved)}
                      className="text-left flex-1 space-y-1 min-w-0 cursor-pointer"
                    >
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {saved.title}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        {saved.class_name} • {saved.subject} • {saved.total_marks} Marks ({saved.time_allowed_mins} Mins)
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {saved.questions?.length || 0} Questions included
                      </span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleSelectFromHistory(saved)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedPaper(idx)}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
