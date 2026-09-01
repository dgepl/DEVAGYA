import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { PageTransition } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | DEVGYA GLOBAL EDUTECH",
  description: "Find answers to all frequently asked questions regarding DEVGYA AI Question Paper Generator, Teacher Mentor AI, NCERT syllabus coverage, OCR scanning, and school onboarding.",
  keywords: [
    "DEVGYA FAQ",
    "AI Question Paper Generator FAQ",
    "Teacher Mentor AI Help",
    "NCERT Question Paper Generator Help",
    "DEVGYA School Support",
    "CBSE Exam Paper Generator Questions"
  ],
  alternates: {
    canonical: "https://devgya.in/faq"
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | DEVGYA GLOBAL EDUTECH",
    description: "Get answers about DEVGYA's AI Question Paper Generator, Teacher Mentor AI, school lab infrastructure, and CBSE/NCERT compliance.",
    url: "https://devgya.in/faq"
  }
};

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Devgya Global ensure NCERT & CBSE compliance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI engine is fine-tuned with exact NCERT chapter structures, marking schemes (1, 3, 5 marks), and HOTS (Higher Order Thinking Skills) guidelines as prescribed by CBSE & ICSE boards."
        }
      },
      {
        "@type": "Question",
        "name": "Can I upload custom textbook photos using OCR?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our built-in OCR Scanner processes uploaded images or PDF pages of printed workbooks and extracts clear text for immediate question paper synthesis."
        }
      },
      {
        "@type": "Question",
        "name": "Can we add our school's official logo and watermark to PDFs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. In your Teacher/School Profile, upload your high-res logo. Our ReportLab PDF engine automatically formats the header, watermark, and styling."
        }
      },
      {
        "@type": "Question",
        "name": "How are future portals (Student, Parent, Management) supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The underlying database schema uses multi-tenant Supabase PostgreSQL with RLS and enums for super_admin, teacher, student, parent, and management. Phase 1 & 2 deliver Teacher & Super Admin interfaces with zero structural technical debt."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <PageTransition>
        <main className="flex-1">
          <FAQSection />
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
