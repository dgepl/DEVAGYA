"use client";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Select Curriculum or Scan Book",
      description: "Pick Class, Subject, and NCERT Chapter from our catalog, or upload a textbook photo using OCR scanner."
    },
    {
      step: "02",
      title: "Configure Exam Parameters",
      description: "Set total marks, time limit, difficulty curve, and exact split of MCQs, Short, Long, and Case Studies."
    },
    {
      step: "03",
      title: "Generate & Export Publication PDF",
      description: "AI synthesizes questions instantly. Preview, edit text if needed, and export formatted PDF with watermarks."
    }
  ];

  return (
    <section id="workflow" className="py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Simple 3-Step Workflow</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">How Teachers Generate Exam Papers in Seconds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-3xl border border-slate-200 relative space-y-4 shadow-sm">
              <span className="text-4xl font-black text-indigo-600/20 tracking-tighter">{s.step}</span>
              <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
