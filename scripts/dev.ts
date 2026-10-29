import { spawn } from 'node:child_process';
const children=[spawn(process.execPath,['--import','tsx','--env-file-if-exists=.env','server/index.ts'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{stdio:'inherit'})];
function stop(){for(const child of children)child.kill('SIGTERM');}
for(const s of ['SIGINT','SIGTERM'])process.on(s,stop);
for(const child of children)child.on('exit',code=>{stop();process.exitCode=code||0;});
