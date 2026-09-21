import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED',
  description: 'Devgya Global Edutech Pvt. Ltd. works across educational publishing, books distribution, and digital learning support. Building an AI-powered education portal for Teachers, Students, Parents, and Schools.',
  keywords: [
    'About DEVGYA',
    'DEVGYA GLOBAL EDUTECH PRIVATE LIMITED',
    'Educational Publishing India',
    'Books Distribution Network',
    'AI Education Portal',
    'CBSE School Books Supply',
    'Parenting Books Devgya',
    'Devgya Edutech Jhajjar Haryana'
  ],
  alternates: {
    canonical: 'https://devgya.in/about'
  },
  openGraph: {
    title: 'About Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED',
    description: 'Ideas that move education forward. Educational publishing, institutional books distribution, and AI-powered role-based portal for teachers, students, parents, and schools.',
    url: 'https://devgya.in/about',
    siteName: 'DEVGYA GLOBAL EDUTECH',
    images: [{ url: 'https://devgya.in/logo-with-name.png', width: 1200, height: 630, alt: 'About DEVGYA GLOBAL EDUTECH' }],
    locale: 'en_IN',
    type: 'website'
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}