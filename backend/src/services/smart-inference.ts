import { SmartInference as LiquidMetalSmartInference } from '@raindrop-studios/liquidmetal-smartcomponents';

export class SmartInference {
  private client: LiquidMetalSmartInference;
  private vultrApiKey: string;
  private vultrEndpoint: string;

  constructor() {
    this.vultrApiKey = process.env.VULTR_API_KEY || '';
    this.vultrEndpoint = process.env.VULTR_INFERENCE_ENDPOINT || 'https://api.vultr.com/v2/inference';
    
    this.client = new LiquidMetalSmartInference({
      provider: 'vultr',
      apiKey: this.vultrApiKey,
      endpoint: this.vultrEndpoint,
    });
  }

  async infer(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      const response = await this.client.generate({
        prompt,
        model: options?.model || 'llama-3.1-70b',
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 2000,
      });

      return response.text || response.content || '';
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('SmartInference error:', error);
      throw new Error(`Inference failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async chat(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): Promise<string> {
    try {
      const response = await this.client.chat({
        messages,
        model: 'llama-3.1-70b',
        temperature: 0.7,
      });

      return response.text || response.content || '';
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('SmartInference chat error:', error);
      throw new Error(`Chat inference failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

