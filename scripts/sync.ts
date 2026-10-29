import { syncResources } from '../server/actforgoa.ts';
import { pool } from '../server/db.ts';
await syncResources();console.log((await pool.query('SELECT source,last_success,record_count,last_error FROM sync_state')).rows);await pool.end();
