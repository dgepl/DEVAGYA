"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle 
} from "lucide-react";

export function PublicMobileDock() {
  const pathname = usePathname();

  // Do not render dock inside dashboard routes or auth pages
  if (pathname.startsWith("/dashboard") || pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null;
  }

  return (
    <div className="fixed bottom-2 left-2 right-2 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200/90 px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        
        {/* Tab 1: Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center py-1 px-2 transition active:scale-95 ${
            pathname === "/" ? "text-indigo-600 font-extrabold" : "text-slate-500 font-medium hover:text-slate-900"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">Home</span>
          {pathname === "/" && <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />}
        </Link>

        {/* Tab 2: About Us */}
        <Link 
          href="/about" 
          className={`flex flex-col items-center py-1 px-2 transition active:scale-95 ${
            pathname === "/about" ? "text-indigo-600 font-extrabold" : "text-slate-500 font-medium hover:text-slate-900"
          }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">About Us</span>
          {pathname === "/about" && <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />}
        </Link>

        {/* Central Glowing Button: Login */}
        <Link
          href="/login"
          className="relative -top-5 flex flex-col items-center group shrink-0"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 border-2 border-white group-active:scale-90 transition-transform">
            <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
          </div>
          <span className="text-[10px] font-black text-indigo-700 tracking-tight mt-0.5 uppercase">
            Log In
          </span>
        </Link>

        {/* Tab 4: Why Choose Us */}
        <Link 
          href="/why-choose-us" 
          className={`flex flex-col items-center py-1 px-2 transition active:scale-95 ${
            pathname === "/why-choose-us" ? "text-indigo-600 font-extrabold" : "text-slate-500 font-medium hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold text-center leading-tight">Why Us</span>
          {pathname === "/why-choose-us" && <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />}
        </Link>

        {/* Tab 5: FAQ */}
        <Link 
          href="/faq" 
          className={`flex flex-col items-center py-1 px-2 transition active:scale-95 ${
            pathname === "/faq" ? "text-indigo-600 font-extrabold" : "text-slate-500 font-medium hover:text-slate-900"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">FAQ</span>
          {pathname === "/faq" && <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />}
        </Link>

      </div>
    </div>
  );
}
