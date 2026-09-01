import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Choose Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED',
  description: 'Discover why leading CBSE and ICSE schools trust DEVGYA for certified physical science laboratories, textbook publishing, and state-of-the-art AI pedagogical software.',
  keywords: [
    'Why Choose DEVGYA',
    'Best AI Question Paper Generator India',
    'Smart School Education Platform',
    'School Science Lab Provider',
    'Teacher Olympiad Certification'
  ],
  alternates: {
    canonical: 'https://devgya.in/why-choose-us'
  },
  openGraph: {
    title: 'Why Choose Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED',
    description: 'Empower your school with certified science labs, custom textbooks, and cutting-edge AI teaching tools.',
    url: 'https://devgya.in/why-choose-us'
  }
};

export default function WhyChooseUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}