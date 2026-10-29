import { createApp } from './app.ts';
import { config } from './config.ts';
import { pool } from './db.ts';
await pool.query('SELECT 1 FROM schema_migrations LIMIT 1');
if(config.production&&!(await pool.query("SELECT 1 FROM pg_extension WHERE extname='postgis'")).rowCount)throw new Error('PostGIS is required in production.');
const server=createApp().listen(config.port,config.production?'0.0.0.0':'127.0.0.1',()=>console.log(`GO-GOA API http://127.0.0.1:${config.port} (${config.demo?'local demo':'live'})`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(()=>{void pool.end().then(()=>process.exit(0));});});
