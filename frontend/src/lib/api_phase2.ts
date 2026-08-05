const getApiBase = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
};

const API_BASE = getApiBase();

export async function askTeacherMentor(query: string, className: string = "Class 10", subject: string = "Science") {
  const res = await fetch(`${API_BASE}/mentor/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, class_name: className, subject })
  });
  if (!res.ok) throw new Error("Mentor query failed");
  return res.json();
}

export async function generateLessonPlan(payload: {
  title: string;
  class_name: string;
  subject: string;
  chapter: string;
  duration_mins: number;
  learning_goals: string[];
}) {
  const res = await fetch(`${API_BASE}/lesson-planner/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Lesson plan generation failed");
  return res.json();
}

export async function exportLessonPlanPDF(plan: any) {
  const res = await fetch(`${API_BASE}/lesson-planner/export-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plan)
  });
  if (!res.ok) throw new Error("Failed to export Lesson Plan PDF");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `LessonPlan_${plan.class_name}_${plan.subject}_${plan.chapter}.pdf`.replace(/\s+/g, '_');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function generateContent(payload: {
  content_type: string;
  topic: string;
  class_name: string;
  subject: string;
  custom_notes?: string;
}) {
  const res = await fetch(`${API_BASE}/content/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Content generation failed");
  return res.json();
}

export async function getPromptLibrary(category: string = "all") {
  const res = await fetch(`${API_BASE}/prompts/list?category=${category}`);
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

export async function analyzeVoiceSpeech(transcript: string, mode: string = "teaching") {
  const res = await fetch(`${API_BASE}/voice/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, mode })
  });
  if (!res.ok) throw new Error("Voice analysis failed");
  return res.json();
}

export async function smartSearch(query: string) {
  const res = await fetch(`${API_BASE}/search/query?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getTeacherAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/metrics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
