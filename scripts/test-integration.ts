import { spawnSync } from 'node:child_process';
const database=process.env.TEST_DATABASE_URL || 'postgresql:///go_goa_test?host=/tmp';
if(new URL(database).pathname !== '/go_goa_test') throw new Error('Integration tests require the dedicated go_goa_test database.');
const env={...process.env,NODE_ENV:'test',DATABASE_URL:database,GO_GOA_DEMO:'true',PUBLIC_ORIGIN:'http://127.0.0.1:4310'};
for(const args of [['--import','tsx','scripts/setup.ts'],['--import','tsx','--test','tests/api.integration.ts']]) {
  const run=spawnSync(process.execPath,args,{env,stdio:'inherit'});
  if(run.status!==0) process.exit(run.status||1);
}
