import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import cors from 'cors';
import { SmartInference } from './services/smart-inference.js';
import { SmartMemory } from './services/smart-memory.js';
import { SmartSQL } from './services/smart-sql.js';
import { SmartBuckets } from './services/smart-buckets.js';
import { AgentManager } from './agents/agent-manager.js';
import { WorkOSAuth } from './auth/workos-auth.js';
import { StripeBilling } from './billing/stripe-billing.js';
import { router } from './routes/index.js';
import { initializeDatabase } from './db/init.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize services
const smartInference = new SmartInference();
const smartMemory = new SmartMemory();
const smartSQL = new SmartSQL();
const smartBuckets = new SmartBuckets();
const agentManager = new AgentManager(smartInference, smartMemory, smartSQL, smartBuckets);
const workOSAuth = new WorkOSAuth();
const stripeBilling = new StripeBilling();

// Initialize database
initializeDatabase(smartSQL).catch(console.error);

// API Routes
app.use('/api', router(agentManager, workOSAuth, stripeBilling, smartSQL, smartMemory));

// MCP Server
async function createMCPServer() {
  const server = new Server(
    {
      name: 'microfounder-os',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register MCP tools
  server.setRequestHandler('tools/list', async () => ({
    tools: [
      {
        name: 'create_weekly_plan',
        description: 'Create a weekly plan using CEO agent',
        inputSchema: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            businessId: { type: 'string' },
          },
        },
      },
      {
        name: 'generate_marketing_assets',
        description: 'Generate marketing assets using Marketing agent',
        inputSchema: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            businessId: { type: 'string' },
            assetType: { type: 'string', enum: ['ad_copy', 'landing_page', 'email_campaign'] },
          },
        },
      },
      {
        name: 'run_financial_forecast',
        description: 'Run financial forecast using Finance agent',
        inputSchema: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            businessId: { type: 'string' },
          },
        },
      },
    ],
  }));

  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'create_weekly_plan':
        return await agentManager.createWeeklyPlan(args.userId, args.businessId);
      case 'generate_marketing_assets':
        return await agentManager.generateMarketingAssets(
          args.userId,
          args.businessId,
          args.assetType
        );
      case 'run_financial_forecast':
        return await agentManager.runFinancialForecast(args.userId, args.businessId);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

// Start HTTP server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Start MCP server if running as MCP
if (process.argv.includes('--mcp')) {
  const server = await createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('MCP Server running on stdio');
}

export { app, agentManager, smartInference, smartMemory, smartSQL, smartBuckets };

