import { SmartInference } from '../services/smart-inference.js';
import { SmartMemory } from '../services/smart-memory.js';
import { SmartBuckets } from '../services/smart-buckets.js';

export class MarketingAgent {
  constructor(
    private smartInference: SmartInference,
    private smartMemory: SmartMemory,
    private smartBuckets: SmartBuckets
  ) {}

  async chat(userId: string, message: string, businessId: string): Promise<{ response: string; agentId: string }> {
    // Read business context
    const businessContext = await this.smartMemory.read('business:context', userId) || {};

    const systemPrompt = `You are a Marketing Agent helping create marketing assets and campaigns.
Your expertise includes:
- Ad copywriting
- Landing page design and copy
- Email campaign creation
- Marketing strategy

Business Context:
${JSON.stringify(businessContext, null, 2)}

Be creative, conversion-focused, and data-driven.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ];

    const response = await this.smartInference.chat(messages);

    // Save conversation
    await this.smartMemory.append('marketing:conversations', userId, {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });
    await this.smartMemory.append('marketing:conversations', userId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    return { response, agentId: 'marketing' };
  }

  async generateAssets(
    userId: string,
    businessId: string,
    assetType: 'ad_copy' | 'landing_page' | 'email_campaign'
  ): Promise<{ assets: any[]; saved: boolean }> {
    const businessContext = await this.smartMemory.read('business:context', userId) || {};

    let prompt = '';
    let assetFormat = '';

    switch (assetType) {
      case 'ad_copy':
        prompt = `Create compelling ad copy for this business:
${JSON.stringify(businessContext, null, 2)}

Create 3 variations of ad copy:
1. Short form (25-30 characters)
2. Medium form (90-125 characters)
3. Long form (200-300 characters)

Include headlines, descriptions, and CTAs.`;
        assetFormat = 'json';
        break;

      case 'landing_page':
        prompt = `Create a complete landing page for this business:
${JSON.stringify(businessContext, null, 2)}

Include:
- Hero section with headline and subheadline
- Value propositions (3-5 points)
- Social proof section
- CTA sections
- FAQ section (5-7 questions)

Format as structured HTML with inline CSS.`;
        assetFormat = 'html';
        break;

      case 'email_campaign':
        prompt = `Create an email campaign sequence (3 emails) for this business:
${JSON.stringify(businessContext, null, 2)}

Create:
1. Welcome email
2. Educational email
3. Conversion email

Each email should have:
- Subject line
- Preheader text
- Body content
- CTA`;
        assetFormat = 'json';
        break;
    }

    const content = await this.smartInference.infer(prompt);

    // Save to buckets
    const key = `${assetType}/${businessId}/${Date.now()}.${assetFormat}`;
    await this.smartBuckets.upload('marketing-assets', key, content, {
      assetType,
      businessId,
      userId,
      createdAt: new Date().toISOString(),
    });

    // Save reference to memory
    await this.smartMemory.append('marketing:assets', userId, {
      assetType,
      key,
      businessId,
      timestamp: Date.now(),
    });

    return {
      assets: [
        {
          type: assetType,
          key,
          content,
          format: assetFormat,
        },
      ],
      saved: true,
    };
  }
}

