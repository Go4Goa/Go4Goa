import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { config } from './config.ts';
import { fail, hash } from './security.ts';
const s3=config.s3Bucket?new S3Client({region:config.s3Region,endpoint:config.s3Endpoint||undefined,forcePathStyle:!!config.s3Endpoint}):null;
const dir=resolve(config.local,'media');
export async function putAsset(key:string,data:Buffer) {
 if(!/^[a-f\d-]+(?:-thumb)?\.webp$/.test(key))throw new Error('Invalid asset key');
 if(s3) await s3.send(new PutObjectCommand({Bucket:config.s3Bucket,Key:key,Body:data,ContentType:'image/webp',ServerSideEncryption:'AES256'}));
 else {await mkdir(dir,{recursive:true,mode:0o700});await writeFile(resolve(dir,key),data,{mode:0o600});}
}
export async function getAsset(key:string) {if(s3){const r=await s3.send(new GetObjectCommand({Bucket:config.s3Bucket,Key:key}));return Buffer.from(await r.Body!.transformToByteArray());}return readFile(resolve(dir,key));}
export async function deleteAsset(key:string) {if(s3)await s3.send(new DeleteObjectCommand({Bucket:config.s3Bucket,Key:key}));else await unlink(resolve(dir,key)).catch(e=>{if(e.code!=='ENOENT')throw e;});}
export async function derivative(bytes:Buffer) {
 if(bytes.length>10*1024*1024)fail(413,'Choose a photo under 10 MB.');
 try {const source=sharp(bytes,{limitInputPixels:40000000,animated:false,failOn:'error'});const m=await source.metadata();if(!['jpeg','png','webp'].includes(m.format||'')||(m.pages||1)>1)fail(415,'Use a still JPG, PNG or WebP photo.');
 const full=await source.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer({resolveWithObject:true});
 const thumb=await sharp(full.data).resize({width:360,height:360,fit:'inside',withoutEnlargement:true}).webp({quality:72}).toBuffer();
 const small=await sharp(full.data).resize(9,8,{fit:'fill'}).greyscale().raw().toBuffer();let bits=0n;for(let y=0;y<8;y++)for(let x=0;x<8;x++)bits=(bits<<1n)|(small[y*9+x]>small[y*9+x+1]?1n:0n);
 return {bytes:full.data,thumb,hash:hash(full.data),dhash:bits.toString(16).padStart(16,'0'),width:full.info.width,height:full.info.height};
 }catch(e){if(e instanceof Error&&'status'in e)throw e;return fail(400,'This photo could not be read. Choose another JPG, PNG or WebP.');}
}
export function hashDistance(a:string,b:string) {let n=BigInt('0x'+a)^BigInt('0x'+b),bits=0;while(n){bits+=Number(n&1n);n>>=1n;}return bits;}
