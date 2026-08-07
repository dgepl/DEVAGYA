"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Edit3, 
  Send, 
  FileText, 
  Layers, 
  Award, 
  RefreshCw, 
  Zap, 
  Users, 
  Check, 
  AlertCircle,
  Eye,
  Plus
} from "lucide-react";

export default function TeachingAssistantPage() {
  const [contentType, setContentType] = useState("worksheet");
  const [topic, setTopic] = useState("Chemical Reactions and Equations");
  const [grade, setGrade] = useState("Class 10");
  const [subject, setSubject] = useState("Science");
  const [difficulty, setDifficulty] = useState("Medium");
  
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any | null>(null);
  const [editedText, setEditedText] = useState("");
  const [reviewStage, setReviewStage] = useState<"idle" | "generated" | "editing" | "approved" | "published">("idle");
  const [targetClass, setTargetClass] = useState("Class 10-A");

  // Assignment List State
  const [assignments, setAssignments] = useState<Array<{
    id: string;
    title: string;
    targetClass: string;
    dueDate: string;
    status: string;
    submissions: number;
    totalStudents: number;
  }>>([
    { id: "as-1", title: "Worksheet: Chemical Equations Practice", targetClass: "Class 10-A", dueDate: "Tomorrow, 5:00 PM", status: "Published", submissions: 28, totalStudents: 32 },
    { id: "as-2", title: "MCQ Quiz: Reflection Ray Diagrams", targetClass: "Class 10-B", dueDate: "2 Aug 2026", status: "Published", submissions: 15, totalStudents: 30 }
  ]);

  // Check for transferred paper from Question Paper Studio
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("devgya_transferred_worksheet");
      if (stored) {
        const paper = JSON.parse(stored);
        if (paper && paper.title) {
          setTopic(paper.chapter || paper.title);
          setGrade(paper.class_name || "Class 10");
          setSubject(paper.subject || "Science");
          setContentType("worksheet");

          let formattedText = `## WORKSHEET: ${paper.title.toUpperCase()}\n`;
          formattedText += `**School:** ${paper.school_name} | **Subject:** ${paper.subject} | **Class:** ${paper.class_name}\n`;
          formattedText += `**Total Marks:** ${paper.total_marks} | **Time:** ${paper.time_allowed_mins} Mins\n\n`;
          formattedText += `### General Instructions:\n`;
          (paper.instructions || []).forEach((inst: string) => {
            formattedText += `- ${inst}\n`;
          });
          formattedText += `\n---\n\n### Questions:\n`;

          (paper.questions || []).forEach((q: any, idx: number) => {
            formattedText += `**Q${idx + 1}. ${q.question_text}** [${q.marks} Mark${q.marks > 1 ? "s" : ""}]\n`;
            if (q.options && q.options.length > 0) {
              formattedText += `${q.options.join("    ")}\n`;
            }
            formattedText += `*Answer:* ___________________________________________________\n\n`;
          });

          setGeneratedContent({
            title: `Transferred Worksheet: ${paper.title}`,
            content: formattedText
          });
          setEditedText(formattedText);
          setReviewStage("generated");

          localStorage.removeItem("devgya_transferred_worksheet");
        }
      }
    } catch (e) {
      console.error("Error reading transferred worksheet:", e);
    }
  }, []);

  const handleGenerateContent = async () => {
    setLoading(true);
    setReviewStage("idle");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/generator/teaching-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          topic,
          grade,
          subject,
          difficulty
        })
      });
      const data = await res.json();
      const result = data.data || {};
      setGeneratedContent(result);
      setEditedText(typeof result.content === "string" ? result.content : JSON.stringify(result.content, null, 2));
      setReviewStage("generated");
    } catch (err) {
      console.error(err);
      const fallback = `## ${contentType.toUpperCase()}: ${topic}\n\n**Difficulty:** ${difficulty}\n\n1. Explain the primary principles of ${topic}.\n2. Solve the numerical problem step by step.\n3. State 2 real-world applications.`;
      setGeneratedContent({ title: `${contentType.toUpperCase()} - ${topic}`, content: fallback });
      setEditedText(fallback);
      setReviewStage("generated");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setReviewStage("approved");
  };

  const handlePublishAssignment = () => {
    if (!generatedContent) return;
    const newAssignment = {
      id: `as-${Date.now()}`,
      title: generatedContent.title || `${contentType.toUpperCase()}: ${topic}`,
      targetClass,
      dueDate: "3 Days",
      status: "Published",
      submissions: 0,
      totalStudents: 30
    };
    setAssignments([newAssignment, ...assignments]);
    setReviewStage("published");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Teaching Assistant & Content Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              Groq AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">Generate, Review, Edit, Approve & Publish NCERT Teaching Materials to Class</p>
        </div>
      </div>

      {/* CONTENT GENERATION FORM */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* 7 CONTENT TYPE SELECTOR TILES */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">1. Select Material Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { type: "mcqs", label: "Generate MCQs", icon: "❓" },
              { type: "worksheet", label: "Generate Worksheets", icon: "📄" },
              { type: "homework", label: "Generate Homework", icon: "🏠" },
              { type: "practice", label: "Practice Questions", icon: "🎯" },
              { type: "explain", label: "Explain Topics", icon: "💡" },
              { type: "activities", label: "Create Activities", icon: "🧪" },
              { type: "revision", label: "Revision Material", icon: "📚" }
            ].map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setContentType(tab.type)}
                className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all flex flex-col items-center gap-1.5 ${
                  contentType === tab.type
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-[11px] leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* INPUT PARAMETERS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Topic / Chapter Name</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Light Reflection & Refraction"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject & Class</label>
            <div className="flex gap-2">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
              >
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Social Science">Social Science</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            >
              <option value="Easy">Easy Level</option>
              <option value="Medium">Medium Level</option>
              <option value="Hard">Hard Level</option>
              <option value="HOTS">HOTS (Higher Order)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateContent}
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          Generate {contentType.toUpperCase()} with Groq AI
        </button>
      </div>

      {/* 5-STAGE CONTENT REVIEW & APPROVAL WORKFLOW */}
      {reviewStage !== "idle" && generatedContent && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          {/* REVIEW PIPELINE STEP INDICATOR */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900">{generatedContent.title}</h3>
              <p className="text-xs text-slate-500 font-medium">Review and edit before publishing to your students</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                reviewStage === "published" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                reviewStage === "approved" ? "bg-indigo-100 text-indigo-700 border border-indigo-300" : "bg-amber-100 text-amber-700 border border-amber-300"
              }`}>
                Stage: {reviewStage.toUpperCase()}
              </span>
            </div>
          </div>

          {/* EDITABLE CONTENT TEXTAREA */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                Teacher Content Review & Editor
              </label>
              <span className="text-[11px] text-slate-400 font-medium">You can edit any text directly below</span>
            </div>
            <textarea
              rows={12}
              value={editedText}
              onChange={(e) => {
                setEditedText(e.target.value);
                if (reviewStage === "generated" || reviewStage === "approved") setReviewStage("editing");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed shadow-inner"
            />
          </div>

          {/* APPROVE & PUBLISH ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 shrink-0">Assign to Class:</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="Class 10-A">Class 10-A (32 Students)</option>
                <option value="Class 10-B">Class 10-B (30 Students)</option>
                <option value="Class 9-A">Class 9-A (28 Students)</option>
                <option value="Class 12-C">Class 12-C (35 Students)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleApprove}
                disabled={reviewStage === "approved" || reviewStage === "published"}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4 text-indigo-600" />
                {reviewStage === "approved" || reviewStage === "published" ? "Approved" : "Approve Content"}
              </button>

              <button
                onClick={handlePublishAssignment}
                disabled={reviewStage === "published"}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-4 h-4" />
                {reviewStage === "published" ? "Published to Class!" : "Publish to Class"}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ASSIGNMENTS HUB & SUBMISSION TRACKER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Active Class Assignments</h3>
            <p className="text-xs text-slate-500 font-medium">Track student submissions & feedback</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
            {assignments.length} Active Tasks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3">Assignment Title</th>
                <th className="p-3">Target Class</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Submissions</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((as) => (
                <tr key={as.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{as.title}</td>
                  <td className="p-3 font-semibold text-slate-600">{as.targetClass}</td>
                  <td className="p-3 text-slate-500">{as.dueDate}</td>
                  <td className="p-3 font-bold text-indigo-600">{as.submissions} / {as.totalStudents} Submitted</td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {as.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
