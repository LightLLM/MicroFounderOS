import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const app = express();
app.use(cors());
app.use(express.json());

// In-memory context store for demo purposes
type ContextItem = { id: string; type?: string; content: any };
const contexts: ContextItem[] = [];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', pid: process.pid });
});

// MCP metadata: describe capabilities of this server
app.get('/mcp/metadata', (_req, res) => {
  res.json({
    name: 'MicroFounder-MCP',
    version: '0.1.0',
    transports: ['http'],
    description: 'Local scaffolded MCP server (demo endpoints)'
  });
});

// Ingest context items (documents, embeddings, etc.)
app.post('/mcp/context', (req, res) => {
  const payload = req.body;
  if (!payload) return res.status(400).json({ error: 'missing body' });

  const item = {
    id: payload.id || `ctx_${Date.now()}`,
    type: payload.type || 'generic',
    content: payload.content ?? payload
  } as ContextItem;

  contexts.push(item);
  res.status(201).json({ stored: item });
});

// Simple completion endpoint — accepts { prompt } and returns a dummy completion.
app.post('/mcp/complete', (req, res) => {
  const body = req.body || {};
  // Accept either legacy `prompt` or MCP-style `input` (array of messages)
  const model = body.model || 'microfounder-mcp-0.1';
  const maxTokens = body.maxTokens || 256;

  let promptText = '';
  if (Array.isArray(body.input)) {
    promptText = body.input.map((m: any) => `${m.role || 'user'}: ${m.content}`).join('\n');
  } else if (typeof body.prompt === 'string') {
    promptText = body.prompt;
  } else if (typeof body.input === 'string') {
    promptText = body.input;
  }

  if (!promptText) return res.status(400).json({ error: 'missing prompt/input' });

  // Simple retrieval: find context items containing any word from prompt
  const queryWords = promptText.split(/\s+/).map((w: string) => w.toLowerCase()).filter(Boolean);
  const hits = contexts
    .map((c) => ({ c, score: queryWords.reduce((s, w) => s + (JSON.stringify(c.content).toLowerCase().includes(w) ? 1 : 0), 0) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((h) => h.c);

  // Compose a small context-aware completion (demo only)
  const contextSnippet = hits.map((h) => `[[context:${h.id}]] ${JSON.stringify(h.content)}`).join('\n');
  const completionText = `${promptText}\n\n${contextSnippet}\n\n[Assistant] This is a demo completion from ${model}.`;

  // Build realistic-ish MCP response
  const response = {
    id: `resp_${Date.now()}`,
    model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: completionText },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: Math.min( Math.max(1, Math.floor(promptText.length / 4)), 1000),
      completion_tokens: Math.min( Math.max(1, Math.floor(completionText.length / 4)), maxTokens),
      total_tokens: 0
    }
  } as any;
  response.usage.total_tokens = response.usage.prompt_tokens + response.usage.completion_tokens;

  res.json(response);
});

// Simple endpoint to list stored context items (demo only)
app.get('/mcp/context', (_req, res) => {
  res.json({ count: contexts.length, items: contexts.slice(-50) });
});

app.listen(PORT, () => {
  console.log(`MCP server listening on http://localhost:${PORT}`);
});
