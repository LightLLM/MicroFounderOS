'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboard, createWeeklyPlan, generateMarketingAssets, runFinancialForecast } from '@/lib/api';
import { Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/onboarding');
      return;
    }
    setUserId(storedUserId);
    loadDashboard(storedUserId);
  }, [router]);

  const loadDashboard = async (uid: string) => {
    try {
      const data = await getDashboard(uid);
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflow = async (workflow: string) => {
    if (!userId || !dashboard?.business?.id) return;

    try {
      switch (workflow) {
        case 'weekly-plan':
          await createWeeklyPlan(userId, dashboard.business.id);
          break;
        case 'marketing':
          await generateMarketingAssets(userId, dashboard.business.id, 'ad_copy');
          break;
        case 'forecast':
          await runFinancialForecast(userId, dashboard.business.id);
          break;
      }
      await loadDashboard(userId);
      alert('Workflow completed!');
    } catch (error) {
      alert('Failed to run workflow. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/agents">
              <Button variant="outline">View Agents</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </div>

        {dashboard?.business && (
          <Card>
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
              <CardDescription>{dashboard.business.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(dashboard.business.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Plans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.summary?.recentPlans?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total plans created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marketing Assets</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.summary?.recentAssets?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Assets generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecasts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.summary?.latestForecast ? '1' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Latest forecast</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleWorkflow('weekly-plan')}
                className="w-full"
                variant="outline"
              >
                Create Weekly Plan
              </Button>
              <Button
                onClick={() => handleWorkflow('marketing')}
                className="w-full"
                variant="outline"
              >
                Generate Marketing Assets
              </Button>
              <Button
                onClick={() => handleWorkflow('forecast')}
                className="w-full"
                variant="outline"
              >
                Run Financial Forecast
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.summary?.recentPlans?.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.summary.recentPlans.slice(0, 3).map((plan: any, index: number) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">Week of {plan.week}</p>
                      <p className="text-muted-foreground text-xs truncate">
                        {plan.plan.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No plans yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.summary?.recentAssets?.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.summary.recentAssets.slice(0, 3).map((asset: any, index: number) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium capitalize">{asset.assetType}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(asset.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No assets yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

