// Import the reviewed public snapshot, never rewrite the source repository.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=process.argv[2];
if(!source)throw Error('Usage: node scripts/import-original-atlas.mjs <public-atlas-repository>');
const git=(...args)=>execFileSync('git',['-C',source,...args],{maxBuffer:32*1024*1024});
const commit=git('rev-parse','HEAD').toString().trim();
const out=path.join(root,'public/atlas-engine');
const sha=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
const records=[];
const entries=git('ls-tree','-r','-z',commit).toString().split('\0').filter(Boolean);
for(const entry of entries){
  const [meta,name]=entry.split('\t'),oid=meta.split(' ')[2];
  if(!/^(atlas[^/]*\.(mjs|js|css)|index\.html|status\.html|asset-manifest\.json|data\/|assets\/|ui-assets\/)/.test(name))continue;
  let bytes=await fs.readFile(path.join(source,name));
  // Git may normalize text line endings; the committed blob is authoritative.
  if(blob(bytes)!==oid)bytes=git('show',`${commit}:${name}`);
  if(blob(bytes)!==oid)throw Error(`Source mismatch: ${name}`);
  const destination=name==='index.html'?'upstream-index.html':name;
  await fs.mkdir(path.dirname(path.join(out,destination)),{recursive:true});
  await fs.writeFile(path.join(out,destination),bytes);
  records.push({source:name,file:destination,gitBlob:oid,sha256:sha(bytes),bytes:bytes.length});
}
const upstream=await fs.readFile(path.join(out,'upstream-index.html'),'utf8');
const runtime=await fs.readFile(path.join(out,'atlas.mjs'),'utf8');
const coreImport=runtime.match(/from '(\.\/atlas-core\.mjs[^']*)'/)?.[1];
if(!coreImport)throw Error('Original core import not found');
const importMap=JSON.stringify({imports:{[coreImport]:'./hub-core.mjs'}});
const additions={head:`<link rel="stylesheet" href="hub-embed.css"><script src="hub-history.js"></script><script type="importmap">${importMap}</script>`,body:'<script type="module" src="hub-bridge.mjs"></script>'};
await fs.writeFile(path.join(out,'index.html'),upstream.replace('</head>',additions.head+'</head>').replace('</body>',additions.body+'</body>'));
const data=JSON.parse(await fs.readFile(path.join(out,'data/facility-master.json'),'utf8'));
const content=JSON.parse(await fs.readFile(path.join(root,'src/content.json'),'utf8'));
const assetURL=url=>/^https?:/.test(url)?url:`/atlas-engine/${url}`;
const maps=data.maps.map(m=>({id:m.id,name:m.id==='silverkeep'?'라드바르할 / 실버킵':m.name,parentMapId:m.parentMapId,status:m.status,redirectMapId:m.redirectMapId||null,placeId:m.placeId||null,regionId:content.regions.some(r=>r.id===m.id)?m.id:null,preview:m.previewAsset?assetURL(m.previewAsset):m.asset?assetURL(m.asset):null}));
const places=data.places.filter(p=>p.region==='티리스').map(p=>({id:p.id,name:p.name,mapId:p.detailMapId}));
await fs.writeFile(path.join(root,'src/atlas-catalog.json'),JSON.stringify({commit,maps,places},null,2)+'\n');
await fs.writeFile(path.join(out,'upstream-provenance.json'),JSON.stringify({source,commit,entryAdditions:additions,files:records},null,2)+'\n');
console.log(JSON.stringify({commit,files:records.length,maps:maps.length,places:places.length,bytes:records.reduce((n,r)=>n+r.bytes,0)}));
