import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { config } from '../server/config.ts';
const url=new URL(config.database); const database=url.pathname.slice(1);
if(!config.production&&!config.qa){
 if(!/^go_goa(?:_test)?$/.test(database)) throw new Error('Local setup may create only go_goa or go_goa_test.');
 const adminUrl=new URL(url);adminUrl.pathname='/postgres';const admin=new pg.Client({connectionString:adminUrl.href});await admin.connect();
 if(!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[database])).rowCount) await admin.query(`CREATE DATABASE "${database}"`);
 await admin.end();
}
const client=new pg.Client({connectionString:config.database});await client.connect();
await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
for(const name of ['001-core.sql',...(config.production||process.env.USE_POSTGIS==='true'?['002-postgis.sql']:[]),'003-bookmarks.sql','004-event-series.sql','005-directory.sql','006-publish-meetups.sql','007-meetup-poster.sql']) {
 if((await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name])).rowCount) continue;
 await client.query('BEGIN');try{await client.query(await readFile(new URL('../db/'+name,import.meta.url),'utf8'));await client.query('INSERT INTO schema_migrations(name) VALUES ($1)',[name]);await client.query('COMMIT');console.log('Applied',name);}catch(e){await client.query('ROLLBACK');throw e;}
}
await client.end();
