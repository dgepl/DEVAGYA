"use client";

import { useState } from "react";

interface DevgyaLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  imageClassName?: string;
  showText?: boolean;
}

export function DevgyaLogo({ 
  size = "md", 
  className = "",
  imageClassName = "",
  showText = false
}: DevgyaLogoProps) {
  const heightClasses = {
    xs: "h-7 max-h-7",
    sm: "h-9 max-h-10",
    md: "h-12 max-h-14",
    lg: "h-16 max-h-20",
    xl: "h-20 max-h-24"
  };

  const heightClass = heightClasses[size] || heightClasses.md;

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="DEVGYA GLOBAL EDUTECH"
        className={`${heightClass} w-auto object-contain mix-blend-multiply transition-transform ${imageClassName}`}
        loading="eager"
      />
    </div>
  );
}

export default DevgyaLogo;
