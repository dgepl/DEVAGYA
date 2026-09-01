import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | DEVGYA GLOBAL EDUTECH',
  description: 'Join DEVGYA GLOBAL EDUTECH. Register as a teacher, student, or parent to unlock AI education tools and certified learning resources.',
  alternates: {
    canonical: 'https://devgya.in/register'
  }
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}