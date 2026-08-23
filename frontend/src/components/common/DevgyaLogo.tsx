"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, GraduationCap } from "lucide-react";

interface DevgyaLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  imageClassName?: string;
}

export function DevgyaLogo({ 
  size = "md", 
  showText = false, 
  className = "",
  imageClassName = ""
}: DevgyaLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Dimension mapping
  const sizeConfig = {
    xs: { dim: 24, textTitle: "text-[10px]", textSub: "text-[7.5px]", box: "w-6 h-6" },
    sm: { dim: 32, textTitle: "text-xs", textSub: "text-[8.5px]", box: "w-8 h-8" },
    md: { dim: 44, textTitle: "text-sm", textSub: "text-[9.5px]", box: "w-11 h-11" },
    lg: { dim: 56, textTitle: "text-base", textSub: "text-[10px]", box: "w-14 h-14" },
    xl: { dim: 72, textTitle: "text-lg", textSub: "text-xs", box: "w-18 h-18" }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* LOGO ICON / EMBLEM */}
      <div className={`relative shrink-0 flex items-center justify-center ${config.box}`}>
        {!imgError ? (
          <img
            src="/logo.png"
            alt="DEVGYA GLOBAL"
            width={config.dim}
            height={config.dim}
            onError={() => setImgError(true)}
            className={`w-full h-full object-contain mix-blend-multiply transition-transform ${imageClassName}`}
            loading="eager"
          />
        ) : (
          /* Sleek Vector Fallback Emblem if image fails to load */
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm border border-indigo-200">
            <GraduationCap className="w-3/5 h-3/5 text-white" />
          </div>
        )}
      </div>

      {/* OPTIONAL BRAND TEXT */}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span className={`font-black text-slate-900 tracking-wider uppercase ${config.textTitle}`}>
            DEVGYA GLOBAL
          </span>
          <span className={`font-extrabold text-indigo-600 tracking-widest uppercase ${config.textSub}`}>
            EDUCATION
          </span>
        </div>
      )}
    </div>
  );
}

export default DevgyaLogo;
