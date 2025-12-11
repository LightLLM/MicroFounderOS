'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendMagicLink, completeOnboarding } from '@/lib/api';

const BUSINESS_TYPES = [
  'SaaS',
  'E-commerce',
  'Marketplace',
  'Content Creator',
  'Consulting',
  'Agency',
  'Other',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'business' | 'questions' | 'loading'>('email');
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [businessType, setBusinessType] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const handleSendMagicLink = async () => {
    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (error) {
      alert('Failed to send magic link. Please try again.');
    }
  };

  const handleVerifyEmail = () => {
    // In production, this would verify the magic link token
    // For demo, we'll generate a userId
    const demoUserId = crypto.randomUUID();
    setUserId(demoUserId);
    localStorage.setItem('userId', demoUserId);
    localStorage.setItem('accessToken', 'demo-token');
    setStep('business');
  };

  const handleSelectBusinessType = (type: string) => {
    setBusinessType(type);
    setStep('questions');
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers({ ...answers, [question]: answer });
  };

  const handleComplete = async () => {
    if (!userId || !businessType) return;

    try {
      const result = await completeOnboarding(userId, businessType, answers);
      router.push('/dashboard');
    } catch (error) {
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  if (step === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to MicroFounder OS</CardTitle>
            <CardDescription>
              Get started by signing in with your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!magicLinkSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendMagicLink} className="w-full">
                  Send Magic Link
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Check your email for the magic link!
                </p>
                <Button onClick={handleVerifyEmail} className="w-full">
                  Continue (Demo Mode)
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'business') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>What type of business are you building?</CardTitle>
            <CardDescription>
              Select the category that best describes your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {BUSINESS_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={businessType === type ? 'default' : 'outline'}
                  onClick={() => handleSelectBusinessType(type)}
                  className="h-20"
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'questions') {
    const questions = [
      'What is your main goal for the next 3 months?',
      'What is your biggest challenge right now?',
      'What stage is your business at?',
    ];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Tell us about your business</CardTitle>
            <CardDescription>
              Answer 3 quick questions to help us personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="space-y-2">
                <Label>{question}</Label>
                <Input
                  value={answers[question] || ''}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                  placeholder="Your answer..."
                />
              </div>
            ))}
            <Button
              onClick={handleComplete}
              className="w-full"
              disabled={questions.some((q) => !answers[q])}
            >
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}

