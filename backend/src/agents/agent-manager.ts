import { SmartInference } from '../services/smart-inference.js';
import { SmartMemory } from '../services/smart-memory.js';
import { SmartSQL } from '../services/smart-sql.js';
import { SmartBuckets } from '../services/smart-buckets.js';
import { CEOAgent } from './ceo-agent.js';
import { MarketingAgent } from './marketing-agent.js';
import { FinanceAgent } from './finance-agent.js';
import { ProductAgent } from './product-agent.js';
import { SalesAgent } from './sales-agent.js';

export class AgentManager {
  private ceoAgent: CEOAgent;
  private marketingAgent: MarketingAgent;
  private financeAgent: FinanceAgent;
  private productAgent: ProductAgent;
  private salesAgent: SalesAgent;

  constructor(
    private smartInference: SmartInference,
    private smartMemory: SmartMemory,
    private smartSQL: SmartSQL,
    private smartBuckets: SmartBuckets
  ) {
    this.ceoAgent = new CEOAgent(smartInference, smartMemory, smartSQL);
    this.marketingAgent = new MarketingAgent(smartInference, smartMemory, smartBuckets);
    this.financeAgent = new FinanceAgent(smartInference, smartMemory, smartSQL);
    this.productAgent = new ProductAgent(smartInference, smartMemory, smartBuckets);
    this.salesAgent = new SalesAgent(smartInference, smartMemory);
  }

  async initializeAgents(userId: string, businessId: string): Promise<void> {
    // Initialize shared memory for agents
    await this.smartMemory.write('agents:initialized', userId, {
      businessId,
      timestamp: Date.now(),
    });

    // Store agent configuration
    await this.smartMemory.write('agents:config', userId, {
      ceo: { enabled: true },
      marketing: { enabled: true },
      finance: { enabled: true },
      product: { enabled: true },
      sales: { enabled: true },
    });
  }

  async getAgents(userId: string): Promise<Array<{ id: string; name: string; description: string; status: string }>> {
    return [
      {
        id: 'ceo',
        name: 'CEO Agent',
        description: 'Strategic planning and weekly plans',
        status: 'active',
      },
      {
        id: 'marketing',
        name: 'Marketing Agent',
        description: 'Ad copy, landing pages, email campaigns',
        status: 'active',
      },
      {
        id: 'finance',
        name: 'Finance Agent',
        description: 'Forecasting, pricing, break-even analysis',
        status: 'active',
      },
      {
        id: 'product',
        name: 'Product Agent',
        description: 'PRDs, UX suggestions, product docs',
        status: 'active',
      },
      {
        id: 'sales',
        name: 'Sales Agent',
        description: 'Outreach messages and sales scripts',
        status: 'active',
      },
    ];
  }

  async chatWithAgent(
    userId: string,
    agentId: string,
    message: string,
    businessId?: string
  ): Promise<{ response: string; agentId: string }> {
    const resolvedBusinessId = businessId || await this.getBusinessId(userId);

    switch (agentId) {
      case 'ceo':
        return await this.ceoAgent.chat(userId, message, resolvedBusinessId);
      case 'marketing':
        return await this.marketingAgent.chat(userId, message, resolvedBusinessId);
      case 'finance':
        return await this.financeAgent.chat(userId, message, resolvedBusinessId);
      case 'product':
        return await this.productAgent.chat(userId, message, resolvedBusinessId);
      case 'sales':
        return await this.salesAgent.chat(userId, message, resolvedBusinessId);
      default:
        throw new Error(`Unknown agent: ${agentId}`);
    }
  }

  async createWeeklyPlan(userId: string, businessId: string): Promise<{ plan: string; saved: boolean }> {
    return await this.ceoAgent.createWeeklyPlan(userId, businessId);
  }

  async generateMarketingAssets(
    userId: string,
    businessId: string,
    assetType: 'ad_copy' | 'landing_page' | 'email_campaign'
  ): Promise<{ assets: any[]; saved: boolean }> {
    return await this.marketingAgent.generateAssets(userId, businessId, assetType);
  }

  async runFinancialForecast(userId: string, businessId: string): Promise<{ forecast: any; saved: boolean }> {
    return await this.financeAgent.runForecast(userId, businessId);
  }

  private async getBusinessId(userId: string): Promise<string> {
    const businesses = await this.smartSQL.select('businesses', { userId });
    if (businesses.length > 0) {
      return businesses[0].id;
    }
    throw new Error('No business found for user');
  }
}

