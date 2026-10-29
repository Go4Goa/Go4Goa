import { attachDatabasePool } from '@vercel/functions';
import { createApp } from '../server/app.ts';
import { pool } from '../server/db.ts';

attachDatabasePool(pool);
export default createApp();
