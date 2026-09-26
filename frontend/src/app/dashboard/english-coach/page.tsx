import { EnglishCoachContainer } from "@/components/english_coach/EnglishCoachContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI English Speaking Coach | DEVGYA",
  description: "Personal AI-powered English Speaking Coach with spoken diagnostic evaluation, 5 progressive locked levels, and live voice conversation partner."
};

export default function EnglishCoachPage() {
  return <EnglishCoachContainer />;
}
