"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Briefcase,
  BookOpen, 
  Armchair, 
  Bot, 
  Tv, 
  Boxes, 
  Megaphone, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  Building2, 
  ShieldCheck, 
  HelpCircle,
  Truck,
  Cpu,
  Layers,
  Check,
  Home
} from "lucide-react";

export default function BusinessPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [inquiryProduct, setInquiryProduct] = useState<string>("All Products / Complete Turnkey");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    orgName: "",
    role: "school_principal",
    phone: "",
    email: "",
    city: "",
    message: ""
  });

  const products = [
    {
      id: "stationary-books",
      number: "01",
      title: "Stationary books",
      badge: "Educational Materials & Supplies",
      icon: BookOpen,
      gradient: "from-blue-600 via-indigo-600 to-sky-600",
      accentBg: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-600/10 text-blue-600",
      description:
        "Welcome to our stationery and books store, your one-stop destination for quality stationery, books, and everyday essentials. We offer a wide range of notebooks, pens, school and office supplies, educational materials, and books for students, professionals, and book lovers. Our goal is to provide quality products at reasonable prices along with friendly and reliable service. Whether you're shopping for school, work, creativity, or simply your next great read, we're here to make your shopping experience easy and convenient.",
      subPoints: [
        "Quality stationery, premium notebooks, writing instruments, and daily school essentials",
        "School and office supplies engineered for educational institutions and corporate workplaces",
        "Curated educational materials and curriculum-aligned books for students, teachers, and professionals",
        "Competitive institutional bulk pricing with friendly, dependable, and timely delivery services",
        "One-stop convenient procurement eliminating multi-vendor coordination hassles"
      ]
    },
    {
      id: "furniture",
      number: "02",
      title: "Furniture",
      badge: "Ergonomic & Classroom Solutions",
      icon: Armchair,
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-600/10 text-emerald-600",
      description:
        "Welcome to our furniture store, where quality, comfort, and style come together. We offer a wide range of furniture designed to suit modern homes, offices, and everyday spaces. From elegant designs to practical solutions, our goal is to provide durable, stylish, and affordable furniture that makes every space feel comfortable and inviting.",
      subPoints: [
        "Modern classroom desks, dual student benches, and ergonomic seating for healthy posture",
        "Staffroom, principal cabins, reception, and administrative office workstations",
        "Sturdy institutional library shelving, reading carrels, and collaborative conference tables",
        "Durable, scratch-resistant, high-grade finishes built for intensive institutional use",
        "Affordable and elegant furniture combinations that make every campus space welcoming and professional"
      ]
    },
    {
      id: "robotics-lab",
      number: "03",
      title: "Robotics Lab",
      badge: "Future-Ready STEM & Innovation",
      icon: Bot,
      gradient: "from-purple-600 via-violet-600 to-indigo-600",
      accentBg: "bg-purple-50 text-purple-700 border-purple-200",
      iconBg: "bg-purple-600/10 text-purple-600",
      description:
        "Welcome to our Robotics Lab, where innovation meets hands-on learning. We provide a creative space for students, educators, and technology enthusiasts to explore robotics, coding, electronics, and automation. Through practical projects and modern technology, we aim to inspire creativity, develop problem-solving skills, and turn ideas into real-world robotic solutions.",
      subPoints: [
        "Creative, interactive laboratory space equipped for students, educators, and young innovators",
        "Hands-on coding, microcontrollers, sensor integration, electronics, and automation kits",
        "Project-driven curriculum aligned with national STEM frameworks and CBSE skill modules",
        "Inspires lateral thinking, analytical problem-solving, and team-based engineering challenges",
        "Complete lab setup including workstations, toolsets, safety equipment, and comprehensive teacher training"
      ]
    },
    {
      id: "integrative-panel-projectors",
      number: "04",
      title: "Integrative Panel/ Projectors",
      badge: "Smart Classroom & Interactive Displays",
      icon: Tv,
      gradient: "from-cyan-600 via-blue-600 to-teal-600",
      accentBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
      iconBg: "bg-cyan-600/10 text-cyan-600",
      description:
        "Welcome to our Interactive Panels and Projectors solutions, where technology transforms the way people learn, work, and connect. We provide high-quality interactive displays, smart panels, and projectors designed for schools, offices, training centres, and institutions. Our goal is to deliver reliable, easy-to-use technology that creates engaging presentations, interactive classrooms, and smarter workspaces.",
      subPoints: [
        "Ultra HD 4K interactive flat panels with multi-touch annotation and anti-glare toughened glass",
        "Smart ultra-short throw and laser projectors tailored for classrooms, auditoriums, and seminar halls",
        "Seamless wireless multi-screen casting, cloud whiteboard software, and digital teaching suites",
        "Engineered for educational institutions, corporate conference rooms, and skill training centers",
        "Intuitive plug-and-play operation transforming passive lecturing into dynamic, collaborative learning"
      ]
    },
    {
      id: "steam-kit",
      number: "05",
      title: "Steam kit",
      badge: "Hands-On Experiential Kits",
      icon: Boxes,
      gradient: "from-amber-600 via-orange-600 to-rose-600",
      accentBg: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-600/10 text-amber-600",
      description:
        "Welcome to our STEAM Kits business, where creativity meets innovation! We provide engaging and educational kits that combine Science, Technology, Engineering, Arts, and Mathematics to inspire young minds. Our hands-on STEAM kits encourage curiosity, creativity, and problem-solving skills through fun and interactive learning experiences, helping students turn ideas into exciting real-world projects.",
      subPoints: [
        "Multi-disciplinary kits integrating Science, Technology, Engineering, Arts, and Mathematics",
        "Age-tailored experiential learning kits for primary, middle, and senior secondary grades",
        "Stimulates intellectual curiosity, observational skills, and systematic design thinking",
        "Packed with guided experiments, student activity workbooks, and instructor reference manuals",
        "Empowers students to convert theoretical textbook concepts into exciting, tangible physical models"
      ]
    },
    {
      id: "advertisement-equipment",
      number: "06",
      title: "Advertisement Equipment",
      badge: "Branding, Display & Marketing Essentials",
      icon: Megaphone,
      gradient: "from-rose-600 via-pink-600 to-red-600",
      accentBg: "bg-rose-50 text-rose-700 border-rose-200",
      iconBg: "bg-rose-600/10 text-rose-600",
      description:
        "We provide reliable and innovative advertising equipment designed to help businesses stand out and connect with their customers. From display solutions and promotional equipment to signage and branding essentials, we offer quality products for shops, offices, events, and marketing campaigns. Our goal is to deliver practical, durable, and cost-effective solutions that make your brand more visible and impactful.",
      subPoints: [
        "Dynamic digital display stands, LED information boards, and campus kiosk units",
        "Institutional signage, directional campus wayfinding, entrance arches, and notice boards",
        "Promotional exhibition equipment, roll-up standees, backdrop banners, and event branding kits",
        "Premium all-weather materials engineered for shops, corporate offices, public events, and campaigns",
        "Durable, cost-effective solutions that maximize visual impact and strengthen institutional prestige"
      ]
    }
  ];

  const handleSelectProductForInquiry = (productTitle: string) => {
    setInquiryProduct(productTitle);
    const element = document.getElementById("inquiry-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <PageTransition className="flex-1 pt-14 sm:pt-20 lg:pt-24">
        
        {/* ========================================================================= */}
        {/* TOP BREADCRUMB / ACCENT BAR                                              */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1528] text-white border-b border-indigo-950/60 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 text-xs font-bold font-[family-name:var(--font-jakarta)]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10 shrink-0"
              >
                <Home className="w-3.5 h-3.5 text-cyan-300" />
                <span>Home</span>
              </Link>
              
              <span className="text-white/30">•</span>

              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black shadow-md border border-amber-300/40 shrink-0 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span>DEVGYA for Business</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-slate-300 text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span>Institutional Hotline: +91 9467582441</span>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#111C38] to-[#0F172A] text-white py-16 sm:py-24 border-b border-indigo-950/50">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              
              {/* SPECIAL BADGE */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-orange-400/40 text-orange-300 text-xs font-black uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>B2B &amp; Educational Institution Solutions</span>
              </div>

              {/* HEADLINE */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-[family-name:var(--font-outfit)] tracking-tight text-white leading-tight">
                DEVGYA for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                  Business &amp; Institutions
                </span>
              </h1>

              {/* SUBTITLE */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Comprehensive physical and digital institutional supplies for schools, academies, colleges, and modern workplaces. From educational books and ergonomic furniture to state-of-the-art Robotics Labs and smart classroom displays.
              </p>

              {/* ACTION BUTTONS */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#inquiry-section"
                  className="px-7 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-orange-500/25 flex items-center gap-2 uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border border-amber-300/40"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Institutional Quote</span>
                </a>

                <a
                  href="#product-catalog"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs sm:text-sm rounded-2xl border border-white/20 flex items-center gap-2 transition-all hover:border-white/40 active:scale-95"
                >
                  <span>Explore 6 Product Divisions</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* STATS STRIP */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-[family-name:var(--font-outfit)]">6</div>
                  <div className="text-[10.5px] uppercase font-bold text-slate-300 tracking-wider mt-0.5">Product Divisions</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-[family-name:var(--font-outfit)]">100+</div>
                  <div className="text-[10.5px] uppercase font-bold text-slate-300 tracking-wider mt-0.5">Partner Schools</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-[family-name:var(--font-outfit)]">Turnkey</div>
                  <div className="text-[10.5px] uppercase font-bold text-slate-300 tracking-wider mt-0.5">Lab Setup &amp; Training</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-xl sm:text-2xl font-black text-rose-400 font-[family-name:var(--font-outfit)]">Direct</div>
                  <div className="text-[10.5px] uppercase font-bold text-slate-300 tracking-wider mt-0.5">Institutional Pricing</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* QUICK CATEGORY FILTER BAR                                                */}
        {/* ========================================================================= */}
        <section id="product-catalog" className="sticky top-14 sm:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-3 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-[family-name:var(--font-jakarta)] shrink-0 transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Divisions (6)
              </button>
              {products.map((p) => {
                const IconComp = p.icon;
                const isSelected = selectedCategory === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedCategory(p.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-[family-name:var(--font-jakarta)] shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span>{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6 PRODUCT DIVISIONS WITH COMPLETE CONTENT & SUB-POINTS                   */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Institutional Product Catalog
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-slate-900 tracking-tight">
              Six Specialized Product Verticals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Explore each specialized division with curated sub-points, specifications, and dedicated fulfillment for your institution.
            </p>
          </div>

          <div className="space-y-10">
            {filteredProducts.map((product) => {
              const IconComp = product.icon;

              return (
                <div 
                  key={product.id}
                  id={product.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden hover:border-orange-200 transition-all duration-300 group"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    
                    {/* LEFT HEADER / ICON PANEL */}
                    <div className={`lg:col-span-4 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br ${product.gradient} text-white relative overflow-hidden`}>
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black tracking-widest uppercase text-white/80 bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs">
                            VERTICAL {product.number}
                          </span>
                          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
                            <IconComp className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
                            {product.badge}
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-black font-[family-name:var(--font-outfit)] text-white tracking-tight mt-1">
                            {product.title}
                          </h3>
                        </div>
                      </div>

                      <div className="pt-8 relative z-10">
                        <button
                          onClick={() => handleSelectProductForInquiry(product.title)}
                          className="w-full py-3 px-4 bg-white text-slate-900 font-extrabold text-xs rounded-xl shadow-lg hover:bg-amber-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5 text-orange-600" />
                          <span>Inquire for {product.title}</span>
                        </button>
                      </div>
                    </div>

                    {/* RIGHT CONTENT & DETAILED SUB-POINTS PANEL */}
                    <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-white">
                      
                      {/* VERBATIM DESCRIPTION */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Overview &amp; Purpose
                          </span>
                        </div>
                        <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                          {product.description}
                        </p>
                      </div>

                      {/* KEY SUB-POINTS */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Key Offerings &amp; Sub-Points
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
                          {product.subPoints.map((point, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 hover:bg-orange-50/40 border border-slate-100 hover:border-orange-200 transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <span className="text-xs sm:text-[13px] text-slate-700 font-semibold leading-relaxed">
                                {point}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* BOTTOM SPECIFICATION QUICK BAR */}
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-slate-600 font-bold">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Pan-India Delivery</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quality Guaranteed</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handleSelectProductForInquiry(product.title)}
                          className="text-orange-600 hover:text-orange-700 font-black flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>Request Institutional Catalog &amp; Quote</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* WHY PARTNER WITH DEVGYA FOR BUSINESS                                     */}
        {/* ========================================================================= */}
        <section className="bg-[#0B1528] text-white py-16 sm:py-20 border-t border-b border-indigo-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Institutional Advantages
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-white tracking-tight">
                Why Schools &amp; Enterprises Trust DEVGYA
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                We bridge the gap between world-class modern school physical infrastructure and high-efficiency digital education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 hover:border-orange-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-white font-[family-name:var(--font-outfit)]">
                  Turnkey Infrastructure
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  End-to-end design, delivery, installation, and setup for robotics labs, smart classrooms, and library ecosystems.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 hover:border-orange-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-white font-[family-name:var(--font-outfit)]">
                  Teacher &amp; Staff Training
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  We don't just supply equipment; our educators provide certified training to empower your teachers with technology.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 hover:border-orange-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-white font-[family-name:var(--font-outfit)]">
                  Direct Institutional Pricing
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Avoid intermediary markup. Direct wholesale prices and flexible procurement terms customized for academic budgets.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 hover:border-orange-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-white font-[family-name:var(--font-outfit)]">
                  Single Point Accountability
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  One dedicated institutional account manager for your entire school lifecycle—procurement, delivery, warranty, and support.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* INQUIRY & QUOTATION FORM SECTION                                         */}
        {/* ========================================================================= */}
        <section id="inquiry-section" className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* LEFT COLUMN: CONTACT DETAILS & DIRECT HOTLINE */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    Get In Touch With Our Team
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-slate-900 tracking-tight">
                    Request an Institutional Quote
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Whether you need a full school supply setup, robotics lab, smart panels, or custom advertising equipment, our institutional team is ready to assist you.
                  </p>
                </div>

                {/* DIRECT CARDS */}
                <div className="space-y-3 pt-2">
                  
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Call Directly / WhatsApp
                      </div>
                      <a 
                        href="tel:+919467582441" 
                        className="text-sm font-extrabold text-slate-900 hover:text-orange-600 transition-colors"
                      >
                        +91 9467582441
                      </a>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Mon - Sat: 9:00 AM - 7:00 PM IST
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Institutional Email Desk
                      </div>
                      <a 
                        href="mailto:dgepl.info@gmail.com" 
                        className="text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        dgepl.info@gmail.com
                      </a>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Guaranteed response within 24 hours
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Corporate &amp; Operational HQ
                      </div>
                      <div className="text-xs font-bold text-slate-800 leading-relaxed">
                        DEVGYA GLOBAL EDUTECH PRIVATE LIMITED
                      </div>
                      <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        7759, W-3, Near Chhara Chungi, Jhajjar-124103, Haryana, India
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: INQUIRY FORM */}
              <div className="lg:col-span-7 bg-slate-50/90 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 font-[family-name:var(--font-outfit)]">
                      Inquiry Received!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you for choosing DEVGYA for Business. Our institutional relations team has received your requirement for <strong className="text-orange-600">{inquiryProduct}</strong> and will connect with you via phone and email within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          orgName: "",
                          role: "school_principal",
                          phone: "",
                          email: "",
                          city: "",
                          message: ""
                        });
                      }}
                      className="px-6 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Submit Another Requirement
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-lg font-black text-slate-900 font-[family-name:var(--font-outfit)]">
                        Institutional Quotation Request
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Fill out the details below and get a customized institutional catalog and quote.
                      </p>
                    </div>

                    {/* SELECT INTERESTED PRODUCT */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Selected Product Division <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={inquiryProduct}
                        onChange={(e) => setInquiryProduct(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="All Products / Complete Turnkey">All Products / Complete Turnkey Institution Setup</option>
                        <option value="Stationary books">Stationary books</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Robotics Lab">Robotics Lab</option>
                        <option value="Integrative Panel/ Projectors">Integrative Panel/ Projectors</option>
                        <option value="Steam kit">Steam kit</option>
                        <option value="Advertisement Equipment">Advertisement Equipment</option>
                      </select>
                    </div>

                    {/* NAME & ORG NAME */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Your Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Dr. Rajesh Sharma"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          School / Organization Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.orgName}
                          onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                          placeholder="e.g. DPS Public School / Horizon Institute"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* ROLE & MOBILE PHONE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Your Role / Designation
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="school_principal">School Principal / Director</option>
                          <option value="trustee">Trustee / Management</option>
                          <option value="lab_head">HOD / STEM Lab Incharge</option>
                          <option value="procurement_officer">Purchase / Procurement Officer</option>
                          <option value="business_owner">Business Owner / Distributor</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +91 9876543210"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* EMAIL & CITY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Official Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. principal@school.edu.in"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          City &amp; State <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Jhajjar, Haryana / New Delhi"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* MESSAGE / REQUIREMENTS */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Specific Requirements / Quantity Estimates
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your requirements, student strength, timeline, or any specific specifications..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        {submitting ? (
                          <span>Processing Request...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Quotation Request</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

      </PageTransition>

      <Footer />
    </div>
  );
}
