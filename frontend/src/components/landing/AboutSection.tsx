"use client";

import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  HeartHandshake,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            About Devagya Global
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            ABOUT US
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Transforming K-12 Education through Integrated School Solutions, Smart Hardware, and Cutting-Edge AI Technology.
          </p>
        </div>

        {/* MAIN ABOUT US CONTENT CARD */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg space-y-8">
          
          <div className="space-y-4 text-slate-700 text-base leading-relaxed font-normal border-b border-slate-100 pb-8">
            <p className="text-slate-900 font-semibold text-lg leading-relaxed">
              At <span className="text-indigo-600 font-extrabold">Devagya Global Private Limited</span>, we are a comprehensive school solutions provider dedicated to transforming K-12 education. We combine physical school infrastructure—including curriculum-aligned textbooks, certified science laboratories, and smart classroom hardware—with a cutting-edge digital learning platform.
            </p>
            <p className="text-slate-600">
              Rather than acting merely as an equipment vendor, we serve as an end-to-end strategic educational partner for schools and study centers. Our all-in-one platform seamlessly supports every stakeholder in the learning journey:
            </p>
          </div>

          {/* 4 STAKEHOLDER CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>For Teachers & Educators</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                It simplifies lesson planning with instant worksheet and quiz generators, while offering dedicated practice tools to build spoken English fluency and classroom confidence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>For School Management & Study Centers</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                It provides structured teacher-observation tools and academic progress tracking to ensure consistent classroom quality and smooth operations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>For Students</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                It features an attractive self-study corner with interactive homework help, gamified lessons, and self-assessment tools designed to make learning intuitive and engaging.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <span>For Parents</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                It offers practical parenting guidance and proven screen-time management strategies, bridging home learning with school education for holistic child development.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
