import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { PublicMobileDock } from "@/components/layout/PublicMobileDock";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
  fallback: ["system-ui", "sans-serif"]
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["system-ui", "sans-serif"]
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://devgya.in"),
  title: {
    default: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED | India's #1 AI Education, Question Paper Generator & Smart School Platform",
    template: "%s | DEVGYA GLOBAL EDUTECH"
  },
  description: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED is India's leading hybrid AI education ecosystem for CBSE & NCERT schools. Featuring AI Question Paper Generator, Teacher Mentor AI, 5E Lesson Planner, Socratic Student Tutor, OCR Grading, and Certified School Lab Infrastructure.",
  keywords: [
    "DEVGYA",
    "DEVGYA GLOBAL",
    "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
    "Devgya Edutech",
    "devgya.in",
    "DEVGYA AI Learning Platform",
    "DEVGYA Teacher Mentor AI",
    "AI Question Paper Generator",
    "CBSE Question Paper Generator Class 6 to 12",
    "NCERT Question Paper Generator with Answer Key",
    "AI Worksheet Maker Printable PDF",
    "5E Lesson Planner AI for Teachers",
    "Teacher Skill Olympiad National Certification",
    "Socratic AI Student Tutor India",
    "Hindi English Hinglish AI Learning",
    "OCR Exam Grading and Textbook Scanner",
    "School Science Lab Equipment Provider India",
    "Smart Classroom LMS Software India",
    "AI Education Platform India",
    "Parenting Guidance Coach AI",
    "Pratikk Yadav Devgya"
  ],
  authors: [{ name: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED", url: "https://devgya.in" }],
  creator: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  publisher: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  alternates: {
    canonical: "https://devgya.in",
    languages: {
      "en-IN": "https://devgya.in",
      "hi-IN": "https://devgya.in"
    }
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/logo.png",
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED — Next-Gen AI Education & Smart School Ecosystem",
    description: "Empowering schools, teachers, students, and parents with cutting-edge AI tools: NCERT/CBSE Question Paper Generator, Teacher Mentor AI, Socratic Tutor & Certified School Infrastructure.",
    url: "https://devgya.in",
    siteName: "DEVGYA GLOBAL EDUTECH",
    images: [
      {
        url: "https://devgya.in/logo-with-name.png",
        width: 1200,
        height: 630,
        alt: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED — Smart AI Education Platform"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVGYA GLOBAL — Smart AI Education & Question Paper Generator Platform",
    description: "India's premier AI education suite: CBSE Question Paper Generator, Teacher Mentor AI, Socratic Student Tutor & Certified Science Labs.",
    images: ["https://devgya.in/logo-with-name.png"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "Education Technology & Artificial Intelligence"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://devgya.in/#organization",
        "name": "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
        "legalName": "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
        "alternateName": ["DEVGYA", "DEVGYA GLOBAL", "Devgya Edutech", "DEVGYA AI"],
        "url": "https://devgya.in",
        "logo": "https://devgya.in/logo.png",
        "image": "https://devgya.in/logo-with-name.png",
        "description": "Provider of physical school infrastructure, certified science laboratories, textbooks, and cloud-based AI pedagogical software for CBSE, ICSE, and State Boards.",
        "slogan": "Empowering Next-Gen Education with Hybrid AI & Physical School Infrastructure",
        "foundingLocation": "India",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-8307224756",
          "contactType": "customer support",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "sameAs": []
      },
      {
        "@type": "WebSite",
        "@id": "https://devgya.in/#website",
        "url": "https://devgya.in",
        "name": "DEVGYA GLOBAL",
        "alternateName": "DEVGYA AI Education Platform",
        "publisher": {
          "@id": "https://devgya.in/#organization"
        },
        "inLanguage": "en-IN",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://devgya.in/dashboard?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://devgya.in/#application",
        "name": "DEVGYA AI Learning & Question Paper Generator Platform",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web, Android, iOS, Windows, macOS",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1850",
          "bestRating": "5",
          "worstRating": "1"
        },
        "featureList": [
          "AI Question Paper Generator with NCERT & CBSE Blueprints",
          "Teacher Mentor AI with 5E Lesson Plan Assistant",
          "Printable A4 Homework & Worksheet PDF Maker with Custom Themes",
          "OCR Textbook & Student Handwriting Scanner",
          "Socratic AI Student Tutor with Multi-Language Support",
          "Teacher Skill Olympiad National Certification",
          "Parenting Guidance & Child Development Coach AI"
        ]
      },
      {
        "@type": "SiteNavigationElement",
        "@id": "https://devgya.in/#navigation",
        "name": "DEVGYA Main Sitelinks Navigation",
        "hasPart": [
          {
            "@type": "WebPage",
            "name": "AI Question Paper Generator",
            "description": "Generate CBSE & NCERT question papers with custom blueprints and answer keys in seconds.",
            "url": "https://devgya.in/dashboard/generator"
          },
          {
            "@type": "WebPage",
            "name": "Teacher Mentor AI",
            "description": "Pedagogical AI assistant for lesson plans, classroom management, and differentiated learning.",
            "url": "https://devgya.in/dashboard/agents?agent=teacher_mentor"
          },
          {
            "@type": "WebPage",
            "name": "AI Assignment & Worksheet Maker",
            "description": "Create publication-ready printable A4 worksheets with ruled writing lines and diagrams.",
            "url": "https://devgya.in/dashboard/assignments"
          },
          {
            "@type": "WebPage",
            "name": "Teacher Skill Olympiad",
            "description": "National pedagogy competition and merit certification for professional educators.",
            "url": "https://devgya.in/dashboard/teacher-olympiad"
          },
          {
            "@type": "WebPage",
            "name": "Student AI Learning Portal",
            "description": "24/7 Socratic AI tutor, adaptive quizzes, revision notes, and leaderboard analytics.",
            "url": "https://devgya.in/dashboard/student"
          },
          {
            "@type": "WebPage",
            "name": "Why Choose DEVGYA",
            "description": "Discover how DEVGYA combines physical school labs with advanced cloud AI.",
            "url": "https://devgya.in/why-choose-us"
          },
          {
            "@type": "WebPage",
            "name": "About DEVGYA Global",
            "description": "Our mission to revolutionize K-12 education across Indian schools.",
            "url": "https://devgya.in/about"
          },
          {
            "@type": "WebPage",
            "name": "Frequently Asked Questions",
            "description": "Learn more about onboarding, features, safety standards, and school implementation.",
            "url": "https://devgya.in/faq"
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" className="light scroll-smooth">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${plusJakarta.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white`}>
        <ReactQueryProvider>
          {children}
          <PublicMobileDock />
        </ReactQueryProvider>
      </body>
    </html>
  );
}

