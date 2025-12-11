import { Router } from 'express';
import { AgentManager } from '../agents/agent-manager.js';
import { WorkOSAuth } from '../auth/workos-auth.js';
import { StripeBilling } from '../billing/stripe-billing.js';
import { SmartSQL } from '../services/smart-sql.js';
import { SmartMemory } from '../services/smart-memory.js';

export function router(
  agentManager: AgentManager,
  workOSAuth: WorkOSAuth,
  stripeBilling: StripeBilling,
  smartSQL: SmartSQL,
  smartMemory: SmartMemory
) {
  const router = Router();

  // Auth routes
  router.post('/auth/magic-link', async (req, res) => {
    try {
      const { email } = req.body;
      await workOSAuth.sendMagicLink(email);
      res.json({ success: true, message: 'Magic link sent' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/auth/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing code' });
      }
      const { accessToken, user } = await workOSAuth.exchangeCodeForToken(code);
      res.json({ accessToken, user });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/auth/verify', async (req, res) => {
    try {
      const { token } = req.body;
      const result = await workOSAuth.verifyToken(token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Onboarding
  router.post('/onboarding', async (req, res) => {
    try {
      const { userId, businessType, answers } = req.body;
      
      // Create business record
      const businessId = crypto.randomUUID();
      await smartSQL.insert('businesses', {
        id: businessId,
        userId,
        type: businessType,
        answers: JSON.stringify(answers),
        createdAt: new Date().toISOString(),
      });

      // Initialize agents
      await agentManager.initializeAgents(userId, businessId);

      // Store business context in memory
      await smartMemory.write('business:context', userId, {
        businessId,
        type: businessType,
        answers,
        timestamp: Date.now(),
      });

      res.json({ success: true, businessId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Agents
  router.get('/agents', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' });
      }
      const agents = await agentManager.getAgents(userId);
      res.json({ agents });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/agents/:agentId/chat', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { userId, message, businessId } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: 'Missing userId or message' });
      }

      const result = await agentManager.chatWithAgent(userId, agentId, message, businessId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Workflows
  router.post('/workflows/create-weekly-plan', async (req, res) => {
    try {
      const { userId, businessId } = req.body;
      const result = await agentManager.createWeeklyPlan(userId, businessId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/workflows/generate-marketing-assets', async (req, res) => {
    try {
      const { userId, businessId, assetType } = req.body;
      const result = await agentManager.generateMarketingAssets(userId, businessId, assetType);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/workflows/run-financial-forecast', async (req, res) => {
    try {
      const { userId, businessId } = req.body;
      const result = await agentManager.runFinancialForecast(userId, businessId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Dashboard
  router.get('/dashboard', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' });
      }

      // Get business data
      const businesses = await smartSQL.select('businesses', { userId });
      const business = businesses[0];

      if (!business) {
        return res.json({ business: null, summary: null });
      }

      // Get recent activity from memory
      const recentPlans = await smartMemory.read('ceo:weekly_plans', userId) || [];
      const recentAssets = await smartMemory.read('marketing:assets', userId) || [];
      const latestForecast = await smartMemory.read('finance:latest_forecast', userId);

      const summary = {
        business,
        recentPlans: recentPlans.slice(-3),
        recentAssets: recentAssets.slice(-5),
        latestForecast,
      };

      res.json({ business, summary });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Workspace (SQL + Memory viewer)
  router.get('/workspace/sql', async (req, res) => {
    try {
      const { userId, table } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' });
      }

      if (table && typeof table === 'string') {
        const data = await smartSQL.select(table, { userId });
        res.json({ table, data });
      } else {
        // List all tables (simplified - in production would query schema)
        res.json({ tables: ['businesses', 'weekly_plans', 'forecasts', 'financial_data'] });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/workspace/memory', async (req, res) => {
    try {
      const { userId, prefix } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const keys = await smartMemory.list(userId, prefix as string | undefined);
      const data: Record<string, any> = {};

      for (const key of keys) {
        data[key] = await smartMemory.read(key, userId);
      }

      res.json({ keys, data });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Billing
  router.post('/billing/checkout', async (req, res) => {
    try {
      const { userId } = req.body;
      const { successUrl, cancelUrl } = req.body;

      const session = await stripeBilling.createCheckoutSession(
        userId,
        successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?success=true`,
        cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?canceled=true`
      );

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/billing/portal', async (req, res) => {
    try {
      const { userId, returnUrl } = req.body;
      const session = await stripeBilling.createPortalSession(
        userId,
        returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings`
      );
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/billing/status', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' });
      }
      const status = await stripeBilling.getSubscriptionStatus(userId);
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/billing/webhook', async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      await stripeBilling.handleWebhook(JSON.stringify(req.body), signature);
      res.json({ received: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return router;
}

