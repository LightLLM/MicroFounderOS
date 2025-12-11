import { SmartSQL } from '../smart-sql.js';

// Mock the LiquidMetal SmartSQL
jest.mock('@raindrop-studios/liquidmetal-smartcomponents', () => ({
  SmartSQL: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    execute: jest.fn(),
  })),
}));

describe('SmartSQL', () => {
  let smartSQL: SmartSQL;
  const mockApiKey = 'test-api-key';
  const mockEndpoint = 'https://api.raindrop.io/sql';

  beforeEach(() => {
    process.env.RAINDROP_API_KEY = mockApiKey;
    process.env.RAINDROP_SQL_ENDPOINT = mockEndpoint;
    smartSQL = new SmartSQL();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('query', () => {
    it('should execute query and return results', async () => {
      const mockResults = [{ id: 1, name: 'Test' }];
      const mockClient = (smartSQL as any).client;
      mockClient.query = jest.fn().mockResolvedValue(mockResults);

      const result = await smartSQL.query('SELECT * FROM test');

      expect(mockClient.query).toHaveBeenCalledWith({
        sql: 'SELECT * FROM test',
        params: undefined,
      });
      expect(result).toEqual(mockResults);
    });

    it('should handle errors gracefully', async () => {
      const mockClient = (smartSQL as any).client;
      mockClient.query = jest.fn().mockRejectedValue(new Error('SQL Error'));

      const result = await smartSQL.query('SELECT * FROM test');

      expect(result).toEqual([]);
    });
  });

  describe('execute', () => {
    it('should execute SQL and return rowsAffected', async () => {
      const mockResult = { rowsAffected: 1 };
      const mockClient = (smartSQL as any).client;
      mockClient.execute = jest.fn().mockResolvedValue(mockResult);

      const result = await smartSQL.execute('INSERT INTO test VALUES (1)');

      expect(mockClient.execute).toHaveBeenCalledWith({
        sql: 'INSERT INTO test VALUES (1)',
        params: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle errors gracefully', async () => {
      const mockClient = (smartSQL as any).client;
      mockClient.execute = jest.fn().mockRejectedValue(new Error('SQL Error'));

      const result = await smartSQL.execute('INSERT INTO test VALUES (1)');

      expect(result).toEqual({ rowsAffected: 0 });
    });
  });

  describe('createTable', () => {
    it('should create table with correct schema', async () => {
      jest.spyOn(smartSQL, 'execute').mockResolvedValue({ rowsAffected: 0 });

      await smartSQL.createTable('test_table', {
        id: 'TEXT PRIMARY KEY',
        name: 'TEXT',
        age: 'INTEGER',
      });

      expect(smartSQL.execute).toHaveBeenCalledWith(
        'CREATE TABLE IF NOT EXISTS test_table (id TEXT PRIMARY KEY, name TEXT, age INTEGER)'
      );
    });
  });

  describe('insert', () => {
    it('should insert data and return id', async () => {
      const mockId = 'test-id-123';
      jest.spyOn(smartSQL, 'query').mockResolvedValue([{ id: mockId }]);

      const result = await smartSQL.insert('test_table', {
        name: 'Test',
        age: 25,
      });

      expect(result.id).toBe(mockId);
      expect(smartSQL.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO test_table')
      );
    });

    it('should fallback to local storage on error', async () => {
      jest.spyOn(smartSQL, 'query').mockRejectedValue(new Error('Error'));

      const result = await smartSQL.insert('test_table', { name: 'Test' });

      expect(result.id).toBeDefined();
      const localData = (smartSQL as any).localDb.get('test_table');
      expect(localData).toBeDefined();
      expect(localData[0].name).toBe('Test');
    });
  });

  describe('select', () => {
    it('should select all when no where clause', async () => {
      const mockResults = [{ id: 1 }, { id: 2 }];
      jest.spyOn(smartSQL, 'query').mockResolvedValue(mockResults);

      const result = await smartSQL.select('test_table');

      expect(smartSQL.query).toHaveBeenCalledWith('SELECT * FROM test_table', undefined);
      expect(result).toEqual(mockResults);
    });

    it('should select with where clause', async () => {
      const mockResults = [{ id: 1 }];
      jest.spyOn(smartSQL, 'query').mockResolvedValue(mockResults);

      const result = await smartSQL.select('test_table', { id: 1, status: 'active' });

      expect(smartSQL.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = \'1\' AND status = \'active\''),
        undefined
      );
      expect(result).toEqual(mockResults);
    });

    it('should fallback to local storage on error', async () => {
      jest.spyOn(smartSQL, 'query').mockRejectedValue(new Error('Error'));

      (smartSQL as any).localDb.set('test_table', [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ]);

      const result = await smartSQL.select('test_table', { id: 1 });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update records matching where clause', async () => {
      jest.spyOn(smartSQL, 'execute').mockResolvedValue({ rowsAffected: 1 });

      const result = await smartSQL.update(
        'test_table',
        { name: 'Updated' },
        { id: 1 }
      );

      expect(smartSQL.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE test_table'),
        undefined
      );
      expect(result.rowsAffected).toBe(1);
    });

    it('should fallback to local storage on error', async () => {
      jest.spyOn(smartSQL, 'execute').mockRejectedValue(new Error('Error'));

      (smartSQL as any).localDb.set('test_table', [{ id: 1, name: 'Old' }]);

      const result = await smartSQL.update('test_table', { name: 'New' }, { id: 1 });

      expect(result.rowsAffected).toBe(1);
      const localData = (smartSQL as any).localDb.get('test_table');
      expect(localData[0].name).toBe('New');
    });
  });

  describe('delete', () => {
    it('should delete records matching where clause', async () => {
      jest.spyOn(smartSQL, 'execute').mockResolvedValue({ rowsAffected: 1 });

      const result = await smartSQL.delete('test_table', { id: 1 });

      expect(smartSQL.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM test_table'),
        undefined
      );
      expect(result.rowsAffected).toBe(1);
    });

    it('should fallback to local storage on error', async () => {
      jest.spyOn(smartSQL, 'execute').mockRejectedValue(new Error('Error'));

      (smartSQL as any).localDb.set('test_table', [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      const result = await smartSQL.delete('test_table', { id: 2 });

      expect(result.rowsAffected).toBe(1);
      const localData = (smartSQL as any).localDb.get('test_table');
      expect(localData).toHaveLength(2);
      expect(localData.find((r: any) => r.id === 2)).toBeUndefined();
    });
  });
});

