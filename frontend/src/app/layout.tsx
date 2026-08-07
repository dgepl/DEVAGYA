import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://devgya.in"),
  title: {
    default: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED — Smart AI Education & School Solutions",
    template: "%s | DEVGYA GLOBAL"
  },
  description: "At DEVGYA GLOBAL EDUTECH PRIVATE LIMITED, we combine physical school infrastructure—textbooks, certified science labs, smart hardware—with an advanced AI learning platform for schools, teachers, students, and parents.",
  keywords: [
    "DEVGYA",
    "DEVGYA GLOBAL",
    "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
    "devgya.in",
    "DEVGYA AI Learning Platform",
    "AI Education Platform India",
    "Smart School Learning Management System",
    "AI Question Paper Generator CBSE ICSE",
    "OCR Automated Exam Grading",
    "Socratic AI Tutor",
    "School Lab Hardware & Textbook Provider India"
  ],
  authors: [{ name: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED", url: "https://devgya.in" }],
  creator: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  publisher: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
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
    title: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED — Smart AI Education Platform",
    description: "Empowering schools, teachers, students, and parents with cutting-edge AI learning tools, certified lab hardware, and smart classroom solutions.",
    url: "https://devgya.in",
    siteName: "DEVGYA GLOBAL",
    images: [
      {
        url: "https://devgya.in/logo.png",
        width: 1200,
        height: 630,
        alt: "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED Logo"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVGYA GLOBAL — Smart AI Education Platform",
    description: "AI Question Paper Generation, Socratic Tutor, OCR Scanner & School Hardware Solutions.",
    images: ["https://devgya.in/logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "Education Technology"
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
        "@type": "Organization",
        "@id": "https://devgya.in/#organization",
        "name": "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
        "url": "https://devgya.in",
        "logo": "https://devgya.in/logo.png",
        "sameAs": [],
        "description": "Provider of physical school infrastructure, certified science labs, textbooks, and AI digital learning platform."
      },
      {
        "@type": "WebSite",
        "@id": "https://devgya.in/#website",
        "url": "https://devgya.in",
        "name": "DEVGYA GLOBAL",
        "publisher": {
          "@id": "https://devgya.in/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "EducationalApplication",
        "name": "DEVGYA AI Learning Platform",
        "operatingSystem": "Web",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
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
        </ReactQueryProvider>
      </body>
    </html>
  );
}

