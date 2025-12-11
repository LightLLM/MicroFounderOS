import { redirect } from 'next/navigation';

export default function Home() {
  // Skip onboarding during development — go straight to the dashboard
  redirect('/dashboard');
}

