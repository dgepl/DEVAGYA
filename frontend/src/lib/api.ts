const getApiBase = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
};

const API_BASE = getApiBase();

export interface GeneratePaperPayload {
  title: string;
  class_name: string;
  subject: string;
  chapter: string;
  difficulty: string;
  total_marks: number;
  time_allowed_mins: number;
  num_mcqs: number;
  num_short: number;
  num_long: number;
  school_name: string;
  custom_instructions?: string;
}

export interface QuestionItem {
  id: number;
  question_number: number;
  question_type: string;
  question_text: string;
  marks: number;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface GeneratedPaperResponse {
  title: string;
  class_name: string;
  subject: string;
  chapter: string;
  difficulty: string;
  total_marks: number;
  time_allowed_mins: number;
  instructions: string[];
  questions: QuestionItem[];
  school_name: string;
}

export async function generateQuestionPaper(payload: GeneratePaperPayload): Promise<GeneratedPaperResponse> {
  const res = await fetch(`${getApiBase()}/generator/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to generate question paper");
  }
  return res.json();
}

export async function generateQuestionPaperFromFile(formData: FormData): Promise<GeneratedPaperResponse> {
  const res = await fetch(`${getApiBase()}/generator/generate-from-file`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Unable to read attached file or generate question paper");
  }
  return res.json();
}

export async function getNCERTChapters(className: string = "Class 10", subject: string = "Science") {
  const res = await fetch(`${getApiBase()}/generator/ncert-chapters?class_name=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}`);
  if (!res.ok) throw new Error("Failed to fetch chapters");
  return res.json();
}

export async function scanOCRPage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/ocr/scan`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("OCR Scan failed");
  return res.json();
}

export async function downloadPDF(paper: GeneratedPaperResponse, includeAnswers: boolean = false) {
  const res = await fetch(`${getApiBase()}/pdf/generate?include_answers=${includeAnswers}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paper)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("PDF API Error:", res.status, errText);
    throw new Error(`Failed to generate PDF (${res.status}): ${errText || 'Server Error'}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${paper.subject}_${paper.class_name}_${includeAnswers ? 'AnswerKey' : 'Paper'}.pdf`.replace(/\s+/g, "_");
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return res.json();
}

/* =========================================================
   PHASE 3 API CLIENT EXTENSIONS
   ========================================================= */

// 1. Student Portal APIs
export async function getStudentDashboard(studentId: string = "std-1") {
  const res = await fetch(`${API_BASE}/student/dashboard?student_id=${studentId}`);
  if (!res.ok) throw new Error("Failed to fetch student dashboard");
  return res.json();
}

export async function askSocraticTutor(payload: {
  student_id?: string;
  subject: string;
  topic: string;
  message: string;
  socratic_mode: boolean;
  context_text?: string;
  image_url?: string;
}) {
  const res = await fetch(`${API_BASE}/student/socratic-tutor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Socratic tutor query failed");
  return res.json();
}

export async function generateStudyPlanner(payload: {
  student_id?: string;
  available_hours_per_day: number;
  weak_subjects: string[];
  target_period: string;
}) {
  const res = await fetch(`${API_BASE}/student/generate-planner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Study planner generation failed");
  return res.json();
}

export async function getLeaderboard(scope: string = "class", period: string = "weekly") {
  const res = await fetch(`${API_BASE}/student/leaderboard?scope=${scope}&period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function handleNoteAIAction(payload: { note_id: string; content: string; action: string }) {
  const res = await fetch(`${API_BASE}/student/notes/ai-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Note AI action failed");
  return res.json();
}

export async function logPomodoroSession(payload: { duration_seconds: number; focus_rating: number }) {
  const res = await fetch(`${API_BASE}/student/pomodoro/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to log pomodoro session");
  return res.json();
}

export async function generatePracticeQuizFromFile(formData: FormData) {
  const res = await fetch(`${API_BASE}/student/practice-quiz-from-file`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("Quiz generation failed");
  return res.json();
}

export async function submitQuizAnswers(payload: {
  subject: string;
  chapter: string;
  answers: Record<string, string>;
}) {
  const res = await fetch(`${API_BASE}/quizzes/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Quiz evaluation failed");
  return res.json();
}

export async function generateFlashcards(payload: { subject: string; topic: string; num_cards: number }) {
  const res = await fetch(`${API_BASE}/revision/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Flashcards generation failed");
  return res.json();
}

export async function generateFlashcardsFromFile(formData: FormData) {
  const res = await fetch(`${API_BASE}/revision/flashcards-from-file`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("Flashcards generation failed");
  return res.json();
}

export async function generateRevisionMaterial(payload: { subject: string; topic: string; revision_type: string }) {
  const res = await fetch(`${API_BASE}/revision/material`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Revision material generation failed");
  return res.json();
}

export async function generateExamPrep(payload: { exam_name: string; subject: string; days_remaining: number }) {
  const res = await fetch(`${API_BASE}/revision/exam-prep`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Exam prep generation failed");
  return res.json();
}

// 4. Parent Portal APIs
export async function getParentDashboard(parentId: string = "prt-1", childId: string = "std-1") {
  const res = await fetch(`${API_BASE}/parent/dashboard?parent_id=${parentId}&child_id=${childId}`);
  if (!res.ok) throw new Error("Failed to fetch parent dashboard");
  return res.json();
}

export async function askParentingCoach(question: string) {
  const res = await fetch(`${API_BASE}/parent/coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  if (!res.ok) throw new Error("Parenting coach query failed");
  return res.json();
}

export async function getParentNotifications(parentId: string = "prt-1") {
  const res = await fetch(`${API_BASE}/parent/notifications?parent_id=${parentId}`);
  if (!res.ok) throw new Error("Failed to fetch parent notifications");
  return res.json();
}

/* =========================================================
   PHASE 4 API CLIENT EXTENSIONS (AI OPERATING SYSTEM)
   ========================================================= */

// 1. Agent Marketplace APIs
export async function getAIAgents(roleScope: string = "all") {
  const res = await fetch(`${API_BASE}/agents/list?role_scope=${roleScope}`);
  if (!res.ok) throw new Error("Failed to fetch AI agents list");
  return res.json();
}

export async function executeAgent(payload: { agent_code: string; query: string }) {
  const res = await fetch(`${API_BASE}/agents/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Agent execution failed");
  return res.json();
}

// Agent OS Chat History APIs
export async function getAgentConversations(userId: string, agentCode?: string) {
  let url = `${API_BASE}/agents/conversations?user_id=${encodeURIComponent(userId)}`;
  if (agentCode) url += `&agent_code=${encodeURIComponent(agentCode)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch agent conversations");
  return res.json();
}

export async function getAgentConversation(conversationId: string, userId: string) {
  const res = await fetch(`${API_BASE}/agents/conversations/${conversationId}?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch agent conversation");
  return res.json();
}

export async function deleteAgentConversation(conversationId: string, userId: string) {
  const res = await fetch(`${API_BASE}/agents/conversations/${conversationId}?user_id=${encodeURIComponent(userId)}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete agent conversation");
  return res.json();
}

// 2. Knowledge Base & Document AI APIs
export async function getKnowledgeDocuments() {
  const res = await fetch(`${API_BASE}/knowledge/documents`);
  if (!res.ok) throw new Error("Failed to fetch knowledge documents");
  return res.json();
}

export async function searchKnowledgeRAG(query: string) {
  const res = await fetch(`${API_BASE}/knowledge/rag-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error("RAG search failed");
  return res.json();
}

export async function runDocumentAI(payload: { doc_id?: string; text_content: string; action: string }) {
  const res = await fetch(`${API_BASE}/knowledge/document-ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Document AI failed");
  return res.json();
}

// 3. AI Workflows APIs
export async function getWorkflowTemplates() {
  const res = await fetch(`${API_BASE}/workflows/templates`);
  if (!res.ok) throw new Error("Failed to fetch workflow templates");
  return res.json();
}

export async function runWorkflow(payload: { workflow_id: string; input_text: string }) {
  const res = await fetch(`${API_BASE}/workflows/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Workflow execution failed");
  return res.json();
}

// 4. Prompt Studio APIs
export async function getPromptTemplates() {
  const res = await fetch(`${API_BASE}/prompt-studio/templates`);
  if (!res.ok) throw new Error("Failed to fetch prompt templates");
  return res.json();
}

export async function testPromptTemplate(payload: { prompt_text: string; variable_values: Record<string, string> }) {
  const res = await fetch(`${API_BASE}/prompt-studio/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Prompt test failed");
  return res.json();
}

// 5. Memory 2.0 APIs
export async function getUserMemories(userId: string = "usr-1") {
  const res = await fetch(`${API_BASE}/memory-v2/list?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch memory items");
  return res.json();
}

export async function addUserMemory(payload: { memory_type: string; memory_key: string; memory_value: string; importance_score: number; tags: string[] }) {
  const res = await fetch(`${API_BASE}/memory-v2/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to add memory item");
  return res.json();
}

// 6. AI Model Settings & Cost Analytics APIs
export async function getAIModelConfig() {
  const res = await fetch(`${API_BASE}/models/config`);
  if (!res.ok) throw new Error("Failed to fetch AI model config");
  return res.json();
}

export async function getAICostAnalytics() {
  const res = await fetch(`${API_BASE}/models/cost-analytics`);
  if (!res.ok) throw new Error("Failed to fetch cost analytics");
  return res.json();
}
