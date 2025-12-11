import { SmartInference } from '../services/smart-inference.js';
import { SmartMemory } from '../services/smart-memory.js';
import { SmartBuckets } from '../services/smart-buckets.js';

export class ProductAgent {
  constructor(
    private smartInference: SmartInference,
    private smartMemory: SmartMemory,
    private smartBuckets: SmartBuckets
  ) {}

  async chat(userId: string, message: string, businessId: string): Promise<{ response: string; agentId: string }> {
    // Read product context
    const productContext = await this.smartMemory.read('product:context', userId) || {};

    const systemPrompt = `You are a Product Agent helping with product development and UX.
Your expertise includes:
- Product Requirements Documents (PRDs)
- UX/UI suggestions
- Feature prioritization
- User research insights
- Product strategy

Product Context:
${JSON.stringify(productContext, null, 2)}

Be user-focused, practical, and detail-oriented.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ];

    const response = await this.smartInference.chat(messages);

    // Save conversation
    await this.smartMemory.append('product:conversations', userId, {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });
    await this.smartMemory.append('product:conversations', userId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    return { response, agentId: 'product' };
  }

  async createPRD(userId: string, businessId: string, feature: string): Promise<{ prd: string; saved: boolean }> {
    const productContext = await this.smartMemory.read('product:context', userId) || {};

    const prompt = `Create a comprehensive Product Requirements Document (PRD) for this feature:

Feature: ${feature}

Product Context:
${JSON.stringify(productContext, null, 2)}

The PRD should include:
1. Executive Summary
2. Problem Statement
3. Goals & Success Metrics
4. User Stories
5. Functional Requirements
6. Non-functional Requirements
7. UX/UI Considerations
8. Technical Considerations
9. Timeline & Milestones
10. Open Questions

Format as a structured markdown document.`;

    const prd = await this.smartInference.infer(prompt);

    // Save to buckets
    const key = `prds/${businessId}/${Date.now()}.md`;
    await this.smartBuckets.upload('product-docs', key, prd, {
      type: 'prd',
      feature,
      businessId,
      userId,
      createdAt: new Date().toISOString(),
    });

    // Save reference
    await this.smartMemory.append('product:prds', userId, {
      feature,
      key,
      businessId,
      timestamp: Date.now(),
    });

    return { prd, saved: true };
  }
}

