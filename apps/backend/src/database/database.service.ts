import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async onModuleInit() {
        // Verify connection
        const client = await this.pool.connect();
        client.release();
    }

    async onModuleDestroy() {
        await this.pool.end();
    }

    /**
     * Execute a parameterized query and return all rows.
     */
    async query<T = any>(text: string, params?: any[]): Promise<T[]> {
        const result = await this.pool.query(text, params);
        return result.rows as T[];
    }

    /**
     * Execute a parameterized query and return the first row or null.
     */
    async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
        const result = await this.pool.query(text, params);
        return (result.rows[0] as T) || null;
    }

    /**
     * Execute a query and return the count of affected rows.
     */
    async execute(text: string, params?: any[]): Promise<number> {
        const result = await this.pool.query(text, params);
        return result.rowCount || 0;
    }

    /**
     * Run multiple queries inside a single transaction.
     */
    async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}
