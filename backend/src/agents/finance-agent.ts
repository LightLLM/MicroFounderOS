import { SmartInference } from '../services/smart-inference.js';
import { SmartMemory } from '../services/smart-memory.js';
import { SmartSQL } from '../services/smart-sql.js';

export class FinanceAgent {
  constructor(
    private smartInference: SmartInference,
    private smartMemory: SmartMemory,
    private smartSQL: SmartSQL
  ) {}

  async chat(userId: string, message: string, businessId: string): Promise<{ response: string; agentId: string }> {
    // Read business financial data
    const business = await this.smartSQL.select('businesses', { id: businessId });
    const businessData = business[0] || {};

    // Read financial history
    const financialHistory = await this.smartSQL.select('financial_data', { businessId });

    const systemPrompt = `You are a Finance Agent helping with financial planning and analysis.
Your expertise includes:
- Financial forecasting
- Pricing strategy
- Break-even analysis
- Unit economics
- Cash flow management

Business Context:
- Type: ${businessData.type || 'Unknown'}
- Revenue Model: ${businessData.revenueModel || 'Unknown'}

Financial History:
${JSON.stringify(financialHistory.slice(-10), null, 2)}

Be precise, analytical, and provide actionable financial insights.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ];

    const response = await this.smartInference.chat(messages);

    // Save conversation
    await this.smartMemory.append('finance:conversations', userId, {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });
    await this.smartMemory.append('finance:conversations', userId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    return { response, agentId: 'finance' };
  }

  async runForecast(userId: string, businessId: string): Promise<{ forecast: any; saved: boolean }> {
    // Read business data
    const business = await this.smartSQL.select('businesses', { id: businessId });
    const businessData = business[0] || {};

    // Read historical financial data
    const historicalData = await this.smartSQL.select('financial_data', { businessId });

    const prompt = `Create a 12-month financial forecast for this business:

Business Type: ${businessData.type || 'Unknown'}
Revenue Model: ${businessData.revenueModel || 'Unknown'}
Current Revenue: ${businessData.currentRevenue || 0}
Current Expenses: ${businessData.currentExpenses || 0}

Historical Data:
${JSON.stringify(historicalData.slice(-12), null, 2)}

Create a detailed forecast including:
1. Monthly revenue projections
2. Monthly expense projections
3. Cash flow forecast
4. Break-even analysis
5. Key assumptions
6. Risk factors

Format as structured JSON with monthly breakdowns.`;

    const forecastText = await this.smartInference.infer(prompt);

    // Try to parse as JSON, fallback to text
    let forecast;
    try {
      forecast = JSON.parse(forecastText);
    } catch {
      forecast = { text: forecastText, parsed: false };
    }

    // Save to SQL
    await this.smartSQL.insert('forecasts', {
      id: crypto.randomUUID(),
      userId,
      businessId,
      forecast: JSON.stringify(forecast),
      period: '12_months',
      createdAt: new Date().toISOString(),
    });

    // Save summary to memory
    await this.smartMemory.write('finance:latest_forecast', userId, {
      businessId,
      forecast,
      timestamp: Date.now(),
    });

    return { forecast, saved: true };
  }
}

