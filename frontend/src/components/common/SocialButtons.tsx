"use client";

import React from "react";

export const YOUTUBE_URL = "https://youtube.com/@devgyaglobaledutech-bo2ol?si=YU-vYor5dfCPkYML";
export const INSTAGRAM_URL = "https://www.instagram.com/devgyaglobaledutechpvt.ltd?stkn=ZHZsc3Iyb3JzdjQ=";

export function YouTubeLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      width={20}
      height={20}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: "20px", height: "20px", flexShrink: 0 }}
      aria-label="YouTube"
    >
      <path 
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" 
        fill="#FF0000" 
      />
      <path 
        d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
}

export function InstagramLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      width={20}
      height={20}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: "20px", height: "20px", flexShrink: 0 }}
      aria-label="Instagram"
    >
      <defs>
        <radialGradient id="devgya-ig-gradient" cx="30%" cy="107%" r="130%" fx="30%" fy="107%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6.5" fill="url(#devgya-ig-gradient)" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}
