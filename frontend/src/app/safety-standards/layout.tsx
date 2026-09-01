import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quality & Safety Standards | DEVGYA GLOBAL EDUTECH',
  description: 'Learn about DEVGYA\'s stringent laboratory safety compliance, NCERT academic accuracy standards, data privacy, and child protection protocols.',
  keywords: [
    'DEVGYA Safety Standards',
    'School Lab Safety Compliance India',
    'Educational Data Privacy',
    'NCERT Academic Accuracy'
  ],
  alternates: {
    canonical: 'https://devgya.in/safety-standards'
  },
  openGraph: {
    title: 'Quality & Safety Standards | DEVGYA GLOBAL EDUTECH',
    description: 'Certified lab hardware safety, student data encryption, and NCERT-compliant AI models.',
    url: 'https://devgya.in/safety-standards'
  }
};

export default function SafetyStandardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}