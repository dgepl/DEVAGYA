import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED',
  description: 'Learn about DEVGYA GLOBAL EDUTECH PRIVATE LIMITED — our mission to revolutionize Indian school education with hybrid physical science labs, textbook publishing, and AI-powered teaching software.',
  keywords: [
    'About DEVGYA',
    'DEVGYA GLOBAL EDUTECH',
    'AI Education Company India',
    'School Science Lab Setup India',
    'CBSE Teacher Training Workshops',
    'Educational Publishing India'
  ],
  alternates: {
    canonical: 'https://devgya.in/about'
  },
  openGraph: {
    title: 'About Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED',
    description: 'Transforming Indian K-12 education with hybrid physical and AI digital learning ecosystems.',
    url: 'https://devgya.in/about'
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}