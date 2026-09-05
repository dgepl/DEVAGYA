import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Teacher & Student Sign In | DEVGYA GLOBAL EDUTECH",
  description: "Sign in to DEVGYA GLOBAL EDUTECH platform. Access CBSE & NCERT AI Question Paper Generator, Teacher Mentor AI, automated worksheet creator, and student study portal.",
  keywords: [
    "DEVGYA Login",
    "Teacher Sign In",
    "Student Login DEVGYA",
    "Question Paper Generator Login",
    "CBSE Teacher Portal"
  ],
  alternates: {
    canonical: "https://devgya.in/login"
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Teacher & Student Sign In | DEVGYA GLOBAL EDUTECH",
    description: "Sign in to DEVGYA GLOBAL EDUTECH platform to access AI pedagogical tools and question paper generation.",
    url: "https://devgya.in/login",
    siteName: "DEVGYA GLOBAL EDUTECH",
    images: [{ url: "https://devgya.in/logo-with-name.png", width: 1200, height: 630, alt: "DEVGYA Login" }],
    locale: "en_IN",
    type: "website"
  }
};

export default function LoginPage() {
  return <LoginClient />;
}
