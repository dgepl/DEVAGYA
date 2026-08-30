"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OCRPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/assignments");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
