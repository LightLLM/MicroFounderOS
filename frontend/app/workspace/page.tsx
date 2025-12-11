'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWorkspaceSQL, getWorkspaceMemory } from '@/lib/api';
import { Database, HardDrive } from 'lucide-react';

export default function WorkspacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sql' | 'memory'>('sql');
  const [sqlData, setSqlData] = useState<any>(null);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/onboarding');
      return;
    }
    setUserId(storedUserId);
    loadData(storedUserId);
  }, [router, activeTab]);

  const loadData = async (uid: string) => {
    setLoading(true);
    try {
      if (activeTab === 'sql') {
        const data = await getWorkspaceSQL(uid);
        setSqlData(data);
      } else {
        const data = await getWorkspaceMemory(uid);
        setMemoryData(data);
      }
    } catch (error) {
      console.error('Failed to load workspace data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Workspace</h1>
            <p className="text-muted-foreground mt-2">
              View your business data and agent memory
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="flex gap-4 border-b">
          <Button
            variant={activeTab === 'sql' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sql')}
          >
            <Database className="h-4 w-4 mr-2" />
            SmartSQL
          </Button>
          <Button
            variant={activeTab === 'memory' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('memory')}
          >
            <HardDrive className="h-4 w-4 mr-2" />
            SmartMemory
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        ) : activeTab === 'sql' ? (
          <Card>
            <CardHeader>
              <CardTitle>SmartSQL Data</CardTitle>
              <CardDescription>Your business data stored in SmartSQL</CardDescription>
            </CardHeader>
            <CardContent>
              {sqlData?.tables ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Available tables:</p>
                  <ul className="list-disc list-inside space-y-2">
                    {sqlData.tables.map((table: string) => (
                      <li key={table} className="font-mono text-sm">{table}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(sqlData, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>SmartMemory Data</CardTitle>
              <CardDescription>Agent memory and context</CardDescription>
            </CardHeader>
            <CardContent>
              {memoryData ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {memoryData.keys?.length || 0} memory keys found
                  </p>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-96">
                    {JSON.stringify(memoryData.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No memory data found</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

