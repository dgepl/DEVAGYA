import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Portal | DEVGYA GLOBAL EDUTECH',
  description: 'Access your DEVGYA Teacher, Student, or Parent dashboard. Generate question papers, practice adaptive quizzes, and manage classrooms.',
  alternates: {
    canonical: 'https://devgya.in/login'
  }
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}