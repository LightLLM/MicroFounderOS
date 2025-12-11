'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatWithAgent, getDashboard } from '@/lib/api';
import { Send, ArrowLeft } from 'lucide-react';

const agentNames: Record<string, string> = {
  ceo: 'CEO Agent',
  marketing: 'Marketing Agent',
  finance: 'Finance Agent',
  product: 'Product Agent',
  sales: 'Sales Agent',
};

export default function AgentChatPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/onboarding');
      return;
    }
    setUserId(storedUserId);
    loadBusinessId(storedUserId);
  }, [router]);

  const loadBusinessId = async (uid: string) => {
    try {
      const dashboard = await getDashboard(uid);
      if (dashboard?.business?.id) {
        setBusinessId(dashboard.business.id);
      }
    } catch (error) {
      console.error('Failed to load business:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !userId || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatWithAgent(userId, agentId, userMessage, businessId || undefined);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="border-b bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{agentNames[agentId] || 'Agent'}</h1>
            <p className="text-sm text-muted-foreground">Chat with your AI agent</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  Start a conversation with {agentNames[agentId] || 'your agent'}
                </p>
              </CardContent>
            </Card>
          )}

          {messages.map((message, index) => (
            <Card
              key={index}
              className={message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {message.role === 'user' ? 'You' : agentNames[agentId] || 'Agent'}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {loading && (
            <Card className="mr-auto max-w-[80%]">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

