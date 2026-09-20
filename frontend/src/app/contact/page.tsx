"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  Home, 
  Info, 
  CheckCircle, 
  HelpCircle,
  Copy,
  MessageSquare,
  ShieldCheck,
  Globe
} from "lucide-react";

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "school",
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const googleMapsUrl = "https://www.google.com/maps/place/Lotus+Enterprises/@28.6105495,76.6597718,20.5z/data=!4m6!3m5!1s0x390d7314d6805609:0x2166391ce623778f!8m2!3d28.6106212!4d76.6595522!16s%2Fg%2F11c6hwstxp?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("dgepl.info@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate immediate successful transmission
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <PageTransition className="flex-1 pt-20 sm:pt-24">
        
        {/* HERO & BREADCRUMB NAVIGATION BAR */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-[#09071B] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            
            {/* INTERACTIVE NAVIGATION PILL TABS */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold font-[family-name:var(--font-jakarta)]">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <Home className="w-3.5 h-3.5 text-cyan-300" />
                <span>Home</span>
              </Link>
              <span className="text-white/30">•</span>

              <Link 
                href="/about" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <Info className="w-3.5 h-3.5 text-purple-300" />
                <span>About Us</span>
              </Link>
              <span className="text-white/30">•</span>

              <Link 
                href="/why-choose-us" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>Why Choose Us</span>
              </Link>
              <span className="text-white/30">•</span>

              <Link 
                href="/faq" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>FAQ</span>
              </Link>
              <span className="text-white/30">•</span>

              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/40 border border-indigo-400/30">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>Contact Us</span>
              </span>
            </div>

            {/* HERO TITLE */}
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Direct Institutional Support</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-[family-name:var(--font-outfit)] leading-tight">
                Get in Touch with <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300">
                  DEVGYA GLOBAL EDUTECH
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
                Have questions about our AI Exam Paper Generator, teacher training workshops, school curriculum partnerships, or laboratory infrastructure? We are here to help educators, institutions, students, and parents nationwide.
              </p>
            </div>

          </div>
        </section>

        {/* MAIN CONTACT DETAILS & MAP SECTION */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
          
          {/* 3 HIGHLIGHT CONTACT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: EMAIL */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-xs">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                  Official Email Address
                </span>
                <h3 className="text-base font-black text-slate-900">dgepl.info@gmail.com</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  For school onboarding, partnerships, recruitment, and technical inquiries.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href="mailto:dgepl.info@gmail.com"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy email to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedEmail ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* CARD 2: PHONE & WHATSAPP */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-xs">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">
                  Helpline &amp; WhatsApp
                </span>
                <h3 className="text-base font-black text-slate-900">+91 8307224756</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Monday to Saturday: 9:00 AM – 6:30 PM IST. Direct educator &amp; principal desk.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href="tel:+918307224756"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <a
                  href="https://wa.me/918307224756"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* CARD 3: HEADQUARTERS LOCATION */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block">
                  Registered Headquarters
                </span>
                <h3 className="text-base font-black text-slate-900">Jhajjar, Haryana, India</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Lotus Enterprises, DEVGYA GLOBAL EDUTECH PRIVATE LIMITED, Jhajjar, Haryana 124103.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

          </div>

          {/* TWO-COLUMN SECTION: CONTACT FORM & GOOGLE MAPS EMBED */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN: INTERACTIVE INQUIRY FORM (5 COLS) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Quick Message</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Send an Inquiry</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Fill out the form below and our educational consultancy team will reach out within 24 hours.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black text-emerald-900">Message Received!</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      Thank you for contacting DEVGYA GLOBAL EDUTECH. Our team has dispatched your request to <span className="font-bold">dgepl.info@gmail.com</span> and will reply promptly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Ramesh Sharma"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="principal@school.edu"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Phone / Mobile</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">I Am A</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        <option value="school">School Principal / Management</option>
                        <option value="teacher">CBSE / ICSE Teacher</option>
                        <option value="student">Student / Aspirant</option>
                        <option value="parent">Parent</option>
                        <option value="partner">Academic Partner / Distributor</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Subject</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. CBSE Question Paper Generator Inquiry"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Message Details</label>
                      <textarea
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your school needs or queries..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      {sending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{sending ? "Transmitting..." : "Submit Inquiry to Support"}</span>
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
                Protected by DEVGYA privacy encryption. Never shared with third parties.
              </div>
            </div>

            {/* RIGHT COLUMN: GOOGLE MAPS EMBED & VISIT CARD (7 COLS) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-600">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Physical Campus &amp; Office</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Visit Our Jhajjar Headquarters</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Lotus Enterprises Building, Main Commercial Hub, Jhajjar, Haryana
                  </p>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* GOOGLE MAPS IFRAME EMBED */}
              <div className="w-full flex-1 min-h-[360px] sm:min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
                <iframe
                  src="https://maps.google.com/maps?q=28.6106212,76.6595522&hl=en&z=18&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full min-h-[360px] sm:min-h-[420px]"
                  title="DEVGYA GLOBAL EDUTECH Headquarters Google Map Location"
                />

                {/* OVERLAY BADGE IN MAP CORNER */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2 pointer-events-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Lotus Enterprises • DEVGYA Global HQ</span>
                </div>
              </div>

              {/* LOCATION DETAILS & HOURS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Operating Hours</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">Monday – Saturday: 9:00 AM to 6:30 PM IST</p>
                  <p className="text-[11px] text-slate-400">Sunday: Closed for physical visits (Email online)</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Serving Pan-India Schools</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">CBSE, ICSE, and State Board partner schools</p>
                  <p className="text-[11px] text-slate-400">Online workshops &amp; nationwide courier logistics</p>
                </div>
              </div>

            </div>

          </div>

        </section>

      </PageTransition>

      <Footer />
    </div>
  );
}
