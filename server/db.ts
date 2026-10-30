import pg from 'pg';
import { config } from './config.ts';
export const pool = new pg.Pool({ connectionString: config.database, max: process.env.VERCEL ? 2 : 8, connectionTimeoutMillis: 10000, idleTimeoutMillis: 5000 });
export type DB = Pick<pg.PoolClient, 'query'>;
export async function tx<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function audit(db: DB, actor: string | null, action: string, target: string, before: unknown, after: unknown, reason = '') {
  await db.query('INSERT INTO audit_log(actor_id,action,target_id,before_state,after_state,reason) VALUES ($1,$2,$3,$4,$5,$6)', [actor,action,target,JSON.stringify(before),JSON.stringify(after),reason]);
}
export async function award(db: DB, user: string, reason: string, source: string, points: number) {
  const result = await db.query('INSERT INTO points_ledger(user_id,reason,source_id,points) VALUES ($1,$2,$3,$4) ON CONFLICT(user_id,reason,source_id) DO NOTHING', [user,reason,source,points]);
  return !!result.rowCount;
}
