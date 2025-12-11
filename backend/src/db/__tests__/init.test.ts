import { initializeDatabase } from '../init.js';
import { SmartSQL } from '../../services/smart-sql.js';

describe('Database Initialization', () => {
  let mockSmartSQL: jest.Mocked<SmartSQL>;

  beforeEach(() => {
    mockSmartSQL = {
      createTable: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create all required tables', async () => {
    await initializeDatabase(mockSmartSQL);

    expect(mockSmartSQL.createTable).toHaveBeenCalledWith(
      'businesses',
      expect.objectContaining({
        id: 'TEXT PRIMARY KEY',
        userId: 'TEXT NOT NULL',
      })
    );

    expect(mockSmartSQL.createTable).toHaveBeenCalledWith(
      'weekly_plans',
      expect.objectContaining({
        id: 'TEXT PRIMARY KEY',
        userId: 'TEXT NOT NULL',
      })
    );

    expect(mockSmartSQL.createTable).toHaveBeenCalledWith(
      'forecasts',
      expect.objectContaining({
        id: 'TEXT PRIMARY KEY',
        userId: 'TEXT NOT NULL',
      })
    );

    expect(mockSmartSQL.createTable).toHaveBeenCalledWith(
      'financial_data',
      expect.objectContaining({
        id: 'TEXT PRIMARY KEY',
        userId: 'TEXT NOT NULL',
      })
    );

    expect(mockSmartSQL.createTable).toHaveBeenCalledTimes(4);
  });
});

