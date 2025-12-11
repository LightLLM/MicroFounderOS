import { SmartSQL as LiquidMetalSmartSQL } from '@raindrop-studios/liquidmetal-smartcomponents';

export class SmartSQL {
  private client: LiquidMetalSmartSQL;
  private localDb: Map<string, any[]>;

  constructor() {
    this.client = new LiquidMetalSmartSQL({
      apiKey: process.env.RAINDROP_API_KEY || '',
      endpoint: process.env.RAINDROP_SQL_ENDPOINT || 'https://api.raindrop.io/sql',
    });
    this.localDb = new Map();
  }

  async query(sql: string, params?: Record<string, any>): Promise<any[]> {
    try {
      const result = await this.client.query({
        sql,
        params,
      });
      return result || [];
    } catch (error) {
      console.error('SmartSQL query error:', error);
      // For demo purposes, return empty array
      return [];
    }
  }

  async execute(sql: string, params?: Record<string, any>): Promise<{ rowsAffected: number }> {
    try {
      const result = await this.client.execute({
        sql,
        params,
      });
      return result || { rowsAffected: 0 };
    } catch (error) {
      console.error('SmartSQL execute error:', error);
      return { rowsAffected: 0 };
    }
  }

  async createTable(tableName: string, schema: Record<string, string>): Promise<void> {
    try {
      const columns = Object.entries(schema)
        .map(([name, type]) => `${name} ${type}`)
        .join(', ');
      
      const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
      await this.execute(sql);
    } catch (error) {
      console.error('SmartSQL createTable error:', error);
    }
  }

  async insert(tableName: string, data: Record<string, any>): Promise<{ id: string }> {
    try {
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data).map(v => `'${v}'`).join(', ');
      const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values}) RETURNING id`;
      
      const result = await this.query(sql);
      return { id: result[0]?.id || crypto.randomUUID() };
    } catch (error) {
      console.error('SmartSQL insert error:', error);
      // Fallback to local storage
      const id = crypto.randomUUID();
      if (!this.localDb.has(tableName)) {
        this.localDb.set(tableName, []);
      }
      this.localDb.get(tableName)!.push({ id, ...data });
      return { id };
    }
  }

  async select(tableName: string, where?: Record<string, any>): Promise<any[]> {
    try {
      let sql = `SELECT * FROM ${tableName}`;
      if (where) {
        const conditions = Object.entries(where)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ');
        sql += ` WHERE ${conditions}`;
      }
      
      const result = await this.query(sql);
      return result || [];
    } catch (error) {
      console.error('SmartSQL select error:', error);
      // Fallback to local storage
      const table = this.localDb.get(tableName) || [];
      if (!where) return table;
      
      return table.filter(row => {
        return Object.entries(where).every(([key, value]) => row[key] === value);
      });
    }
  }

  async update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<{ rowsAffected: number }> {
    try {
      const sets = Object.entries(data)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');
      const conditions = Object.entries(where)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      
      const sql = `UPDATE ${tableName} SET ${sets} WHERE ${conditions}`;
      return await this.execute(sql);
    } catch (error) {
      console.error('SmartSQL update error:', error);
      // Fallback to local storage
      const table = this.localDb.get(tableName) || [];
      let affected = 0;
      
      table.forEach(row => {
        if (Object.entries(where).every(([key, value]) => row[key] === value)) {
          Object.assign(row, data);
          affected++;
        }
      });
      
      return { rowsAffected: affected };
    }
  }

  async delete(tableName: string, where: Record<string, any>): Promise<{ rowsAffected: number }> {
    try {
      const conditions = Object.entries(where)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      
      const sql = `DELETE FROM ${tableName} WHERE ${conditions}`;
      return await this.execute(sql);
    } catch (error) {
      console.error('SmartSQL delete error:', error);
      // Fallback to local storage
      const table = this.localDb.get(tableName) || [];
      let affected = 0;
      
      for (let i = table.length - 1; i >= 0; i--) {
        const row = table[i];
        if (Object.entries(where).every(([key, value]) => row[key] === value)) {
          table.splice(i, 1);
          affected++;
        }
      }
      
      return { rowsAffected: affected };
    }
  }
}

