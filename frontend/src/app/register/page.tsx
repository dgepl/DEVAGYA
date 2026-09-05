import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account | DEVGYA GLOBAL EDUTECH",
  description: "Create a free account on DEVGYA GLOBAL EDUTECH. Join Indian schools, educators, and students leveraging AI for CBSE question papers, homework assistance, and Olympiad prep.",
  keywords: [
    "DEVGYA Register",
    "Teacher Sign Up",
    "School Registration DEVGYA",
    "Create Account DEVGYA",
    "CBSE Edtech Register"
  ],
  alternates: {
    canonical: "https://devgya.in/register"
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Create Account | DEVGYA GLOBAL EDUTECH",
    description: "Sign up for DEVGYA GLOBAL EDUTECH to access next-generation AI education tools.",
    url: "https://devgya.in/register",
    siteName: "DEVGYA GLOBAL EDUTECH",
    images: [{ url: "https://devgya.in/logo-with-name.png", width: 1200, height: 630, alt: "DEVGYA Register" }],
    locale: "en_IN",
    type: "website"
  }
};

export default function RegisterPage() {
  return <RegisterClient />;
}
