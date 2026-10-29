import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
const database=process.env.TEST_DATABASE_URL || 'postgresql:///go_goa_test?host=/tmp';
if(new URL(database).pathname !== '/go_goa_test') throw new Error('Integration tests require the dedicated go_goa_test database.');
const env={...process.env,NODE_ENV:'test',DATABASE_URL:database,GO_GOA_QA:'false',GO_GOA_DEMO:'true',PUBLIC_ORIGIN:'http://127.0.0.1:4310'};
function run(args:string[]) {
  const result=spawnSync(process.execPath,args,{env,stdio:'inherit'});
  if(result.status!==0) throw new Error('Integration subprocess failed.');
}
// Bootstrap the dedicated test DB, then isolate every run from older fixtures and keys.
run(['--import','tsx','scripts/setup.ts']);
const client=new pg.Client({connectionString:database});await client.connect();
const schema='qa_'+randomUUID().replaceAll('-','');
await client.query(`CREATE SCHEMA "${schema}"`);
const isolated=new URL(database);isolated.searchParams.set('options','-c search_path='+schema);
env.DATABASE_URL=isolated.href;
try {
  run(['--import','tsx','scripts/setup.ts']);
  run(['--import','tsx','--test','tests/api.integration.ts']);
} finally {
  await client.query(`DROP SCHEMA "${schema}" CASCADE`);
  await client.end();
}
