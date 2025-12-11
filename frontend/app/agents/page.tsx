'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAgents } from '@/lib/api';
import { Brain, DollarSign, FileText, Megaphone, ShoppingCart } from 'lucide-react';

const agentIcons: Record<string, any> = {
  ceo: Brain,
  marketing: Megaphone,
  finance: DollarSign,
  product: FileText,
  sales: ShoppingCart,
};

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/onboarding');
      return;
    }
    setUserId(storedUserId);
    loadAgents(storedUserId);
  }, [router]);

  const loadAgents = async (uid: string) => {
    try {
      const data = await getAgents(uid);
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
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
            <h1 className="text-4xl font-bold">Agents</h1>
            <p className="text-muted-foreground mt-2">
              Your AI-powered team members ready to help
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const Icon = agentIcons[agent.id] || Brain;
            return (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{agent.name}</CardTitle>
                        <CardDescription>{agent.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status: <span className="text-green-600">{agent.status}</span>
                      </span>
                      <Button variant="ghost" size="sm">
                        Chat →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

