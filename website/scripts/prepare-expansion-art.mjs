import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const sharp=require('C:/Users/musue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(app,'../../assets/site/vireth/expansion/2026-09-16-v1');
const rows=[];
for(const name of ['archive-background','journey-background']){
 const source=path.join(root,name+'.png');const output=path.join(app,'public/assets/expansion',name+'.webp');
 await sharp(source).webp({quality:90}).toFile(output);
 rows.push({source,output,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),outputSha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),originalBytes:fs.statSync(source).size,webBytes:fs.statSync(output).size,dimensions:await sharp(output).metadata()});
}
fs.writeFileSync(path.join(app,'qa/expansion-art.json'),JSON.stringify(rows,null,2));
console.log(rows.map(({originalBytes,webBytes,output})=>({output,originalBytes,webBytes})));
