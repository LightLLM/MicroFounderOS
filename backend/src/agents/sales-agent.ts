import { SmartInference } from '../services/smart-inference.js';
import { SmartMemory } from '../services/smart-memory.js';

export class SalesAgent {
  constructor(
    private smartInference: SmartInference,
    private smartMemory: SmartMemory
  ) {}

  async chat(userId: string, message: string, businessId: string): Promise<{ response: string; agentId: string }> {
    // Read sales context
    const salesContext = await this.smartMemory.read('sales:context', userId) || {};
    const businessContext = await this.smartMemory.read('business:context', userId) || {};

    const systemPrompt = `You are a Sales Agent helping with sales outreach and scripts.
Your expertise includes:
- Cold outreach messages
- Email sequences
- Sales scripts
- Objection handling
- Closing techniques

Business Context:
${JSON.stringify(businessContext, null, 2)}

Sales Context:
${JSON.stringify(salesContext, null, 2)}

Be persuasive, personalized, and conversion-focused.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ];

    const response = await this.smartInference.chat(messages);

    // Save conversation
    await this.smartMemory.append('sales:conversations', userId, {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });
    await this.smartMemory.append('sales:conversations', userId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    return { response, agentId: 'sales' };
  }

  async generateOutreachMessage(
    userId: string,
    businessId: string,
    prospectInfo: { name: string; company: string; role: string }
  ): Promise<{ message: string; saved: boolean }> {
    const businessContext = await this.smartMemory.read('business:context', userId) || {};

    const prompt = `Create a personalized cold outreach message for:

Prospect:
- Name: ${prospectInfo.name}
- Company: ${prospectInfo.company}
- Role: ${prospectInfo.role}

Business Context:
${JSON.stringify(businessContext, null, 2)}

Create a compelling outreach message that:
1. Is personalized and relevant
2. Clearly communicates value proposition
3. Includes a clear call-to-action
4. Is concise (under 150 words)
5. Builds rapport

Format as a professional email.`;

    const message = await this.smartInference.infer(prompt);

    // Save to memory
    await this.smartMemory.append('sales:outreach_messages', userId, {
      prospectInfo,
      message,
      businessId,
      timestamp: Date.now(),
    });

    return { message, saved: true };
  }
}

