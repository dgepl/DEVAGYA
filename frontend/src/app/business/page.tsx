"use client";

import React from "react";
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
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight,
  Home
} from "lucide-react";

export default function BusinessPage() {
  const products = [
    {
      id: "stationary-books",
      title: "Stationary & books",
      icon: BookOpen,
      content:
        "Welcome to our stationery and books store, your one-stop destination for quality stationery, books, and everyday essentials. We offer a wide range of notebooks, pens, school and office supplies, educational materials, and books for students, professionals, and book lovers. Our goal is to provide quality products at reasonable prices along with friendly and reliable service. Whether you're shopping for school, work, creativity, or simply your next great read, we're here to make your shopping experience easy and convenient."
    },
    {
      id: "furniture",
      title: "Furniture",
      icon: Armchair,
      content:
        "Welcome to our furniture store, where quality, comfort, and style come together. We offer a wide range of furniture designed to suit modern homes, offices, and everyday spaces. From elegant designs to practical solutions, our goal is to provide durable, stylish, and affordable furniture that makes every space feel comfortable and inviting."
    },
    {
      id: "robotics-lab",
      title: "Robotics Lab",
      icon: Bot,
      content:
        "Welcome to our Robotics Lab, where innovation meets hands-on learning. We provide a creative space for students, educators, and technology enthusiasts to explore robotics, coding, electronics, and automation. Through practical projects and modern technology, we aim to inspire creativity, develop problem-solving skills, and turn ideas into real-world robotic solutions."
    },
    {
      id: "integrative-panel-projectors",
      title: "Integrative Panel/ Projectors",
      icon: Tv,
      content:
        "Welcome to our Interactive Panels and Projectors solutions, where technology transforms the way people learn, work, and connect. We provide high-quality interactive displays, smart panels, and projectors designed for schools, offices, training centres, and institutions. Our goal is to deliver reliable, easy-to-use technology that creates engaging presentations, interactive classrooms, and smarter workspaces."
    },
    {
      id: "steam-kit",
      title: "Steam kit",
      icon: Boxes,
      content:
        "Welcome to our STEAM Kits business, where creativity meets innovation! We provide engaging and educational kits that combine Science, Technology, Engineering, Arts, and Mathematics to inspire young minds. Our hands-on STEAM kits encourage curiosity, creativity, and problem-solving skills through fun and interactive learning experiences, helping students turn ideas into exciting real-world projects."
    },
    {
      id: "advertisement-equipment",
      title: "Advertisement Equipment",
      icon: Megaphone,
      content:
        "We provide reliable and innovative advertising equipment designed to help businesses stand out and connect with their customers. From display solutions and promotional equipment to signage and branding essentials, we offer quality products for shops, offices, events, and marketing campaigns. Our goal is to deliver practical, durable, and cost-effective solutions that make your brand more visible and impactful."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <PageTransition className="flex-1 pt-14 sm:pt-20 lg:pt-24">
        
        {/* BREADCRUMB HEADER */}
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
                <Briefcase className="w-3.5 h-3.5 text-amber-200" />
                <span>DEVGYA for Business</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-slate-300 text-xs">
              <a 
                href="tel:+919467582441"
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91 9467582441</span>
              </a>
            </div>
          </div>
        </div>

        {/* HERO TITLE & PRODUCT LIST */}
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                <span>DEVGYA for Business</span>
              </span>

              <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-outfit)] text-slate-900 tracking-tight">
                DEVGYA for Business - in Operational Soon
              </h1>
            </div>

            {/* PRODUCT BULLET LIST (AS IN IMAGE 1) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-xs">
              <ul className="space-y-2.5 text-sm sm:text-base font-bold text-slate-800 list-disc list-inside">
                {products.map((item) => (
                  <li key={item.id} className="hover:text-orange-600 transition-colors">
                    <a href={`#${item.id}`} className="hover:underline">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* PRODUCT DETAILS (EXACT TEXT FROM IMAGES) */}
        <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {products.map((product) => {
            const IconComp = product.icon;

            return (
              <div 
                key={product.id}
                id={product.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 hover:border-orange-200 transition-all scroll-mt-24"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-outfit)] text-slate-900 tracking-tight">
                    {product.title}
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  {product.content}
                </p>
              </div>
            );
          })}
        </section>

        {/* CONTACT BAR */}
        <section className="bg-white border-t border-slate-200 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-black font-[family-name:var(--font-outfit)] text-white">
                  Get in Touch with DEVGYA
                </h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-300">
                  <a href="tel:+919467582441" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors font-bold">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>+91 9467582441</span>
                  </a>
                  <span className="text-slate-600">•</span>
                  <a href="mailto:dgepl.info@gmail.com" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-bold">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>dgepl.info@gmail.com</span>
                  </a>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>7759, W-3, Near Chhara Chungi, Jhajjar-124103, Haryana, India</span>
                </div>
              </div>

              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 uppercase tracking-wider shrink-0 active:scale-95 transition-all"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </PageTransition>

      <Footer />
    </div>
  );
}
