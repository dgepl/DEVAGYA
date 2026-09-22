"use client";

import { ParentStudentPerformanceReport } from "@/components/parent/ParentStudentPerformanceReport";

export function ChildAnalyticsCharts() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ParentStudentPerformanceReport />
    </div>
  );
}

