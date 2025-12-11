import { SmartInference } from '../services/smart-inference.js';
import { SmartMemory } from '../services/smart-memory.js';
import { SmartSQL } from '../services/smart-sql.js';

export class CEOAgent {
  constructor(
    private smartInference: SmartInference,
    private smartMemory: SmartMemory,
    private smartSQL: SmartSQL
  ) {}

  async chat(userId: string, message: string, businessId: string): Promise<{ response: string; agentId: string }> {
    // Read business context
    const business = await this.smartSQL.select('businesses', { id: businessId });
    const businessData = business[0] || {};

    // Read recent memory
    const recentMemory = await this.smartMemory.read('ceo:recent', userId) || [];

    const systemPrompt = `You are a CEO Agent helping a solo founder or tiny team. 
Your role is to provide strategic guidance, create weekly plans, and help with high-level decision making.

Business Context:
- Type: ${businessData.type || 'Unknown'}
- Industry: ${businessData.industry || 'Unknown'}
- Stage: ${businessData.stage || 'Early'}

Recent Context:
${JSON.stringify(recentMemory.slice(-5), null, 2)}

Be concise, strategic, and actionable.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...recentMemory.slice(-5).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await this.smartInference.chat(messages);

    // Save to memory
    await this.smartMemory.append('ceo:recent', userId, {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });
    await this.smartMemory.append('ceo:recent', userId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    return { response, agentId: 'ceo' };
  }

  async createWeeklyPlan(userId: string, businessId: string): Promise<{ plan: string; saved: boolean }> {
    // Read business context
    const business = await this.smartSQL.select('businesses', { id: businessId });
    const businessData = business[0] || {};

    // Read previous plans
    const previousPlans = await this.smartMemory.read('ceo:weekly_plans', userId) || [];

    const prompt = `Create a comprehensive weekly plan for this business:

Business Type: ${businessData.type || 'Unknown'}
Industry: ${businessData.industry || 'Unknown'}
Stage: ${businessData.stage || 'Early'}

Previous Plans Context:
${JSON.stringify(previousPlans.slice(-2), null, 2)}

Create a structured weekly plan with:
1. Strategic goals for the week
2. Key priorities (3-5 items)
3. Metrics to track
4. Risks and mitigation
5. Resource needs

Format as a clear, actionable plan.`;

    const plan = await this.smartInference.infer(prompt);

    // Save plan
    const planData = {
      businessId,
      plan,
      week: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    await this.smartMemory.append('ceo:weekly_plans', userId, planData);
    await this.smartSQL.insert('weekly_plans', {
      id: crypto.randomUUID(),
      userId,
      businessId,
      plan,
      week: planData.week,
      createdAt: new Date().toISOString(),
    });

    return { plan, saved: true };
  }
}

