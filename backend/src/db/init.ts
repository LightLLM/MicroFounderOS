import { SmartSQL } from '../services/smart-sql.js';

export async function initializeDatabase(smartSQL: SmartSQL): Promise<void> {
  // Create businesses table
  await smartSQL.createTable('businesses', {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT NOT NULL',
    type: 'TEXT',
    industry: 'TEXT',
    stage: 'TEXT',
    revenueModel: 'TEXT',
    currentRevenue: 'REAL',
    currentExpenses: 'REAL',
    answers: 'TEXT',
    createdAt: 'TEXT',
  });

  // Create weekly_plans table
  await smartSQL.createTable('weekly_plans', {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT NOT NULL',
    businessId: 'TEXT NOT NULL',
    plan: 'TEXT',
    week: 'TEXT',
    createdAt: 'TEXT',
  });

  // Create forecasts table
  await smartSQL.createTable('forecasts', {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT NOT NULL',
    businessId: 'TEXT NOT NULL',
    forecast: 'TEXT',
    period: 'TEXT',
    createdAt: 'TEXT',
  });

  // Create financial_data table
  await smartSQL.createTable('financial_data', {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT NOT NULL',
    businessId: 'TEXT NOT NULL',
    revenue: 'REAL',
    expenses: 'REAL',
    month: 'TEXT',
    createdAt: 'TEXT',
  });

  console.log('Database initialized successfully');
}

