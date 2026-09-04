import { EnglishSpeakingCoach } from "@/components/teacher/EnglishSpeakingCoach";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "English Speaking Coach | DEVGYA Educator Studio",
  description: "Live interactive spoken English fluency coach for teachers with authentic Indian accent neural voices."
};

export default function EnglishCoachPage() {
  return <EnglishSpeakingCoach />;
}
