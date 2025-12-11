'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBillingStatus, createCheckoutSession, createPortalSession } from '@/lib/api';
import { CreditCard, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [billingStatus, setBillingStatus] = useState<'active' | 'inactive' | 'trialing' | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/onboarding');
      return;
    }
    setUserId(storedUserId);
    loadBillingStatus(storedUserId);
  }, [router]);

  const loadBillingStatus = async (uid: string) => {
    try {
      const data = await getBillingStatus(uid);
      setBillingStatus(data.status);
    } catch (error) {
      console.error('Failed to load billing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!userId) return;

    try {
      const session = await createCheckoutSession(
        userId,
        `${window.location.origin}/settings?success=true`,
        `${window.location.origin}/settings?canceled=true`
      );
      window.location.href = session.url;
    } catch (error) {
      alert('Failed to create checkout session. Please try again.');
    }
  };

  const handleManageBilling = async () => {
    if (!userId) return;

    try {
      const session = await createPortalSession(userId, `${window.location.origin}/settings`);
      window.location.href = session.url;
    } catch (error) {
      alert('Failed to create portal session. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account and billing
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Subscription Status</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {billingStatus || 'inactive'}
                    </p>
                  </div>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                {billingStatus === 'active' || billingStatus === 'trialing' ? (
                  <Button onClick={handleManageBilling} className="w-full">
                    Manage Billing
                  </Button>
                ) : (
                  <Button onClick={handleSubscribe} className="w-full">
                    Subscribe
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

