// Reproducible derived runtime: no edits to the approved upstream file.
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const touchSuffix=`\n// Homepage-only touch input; the preceding upstream runtime is byte-identical.\nimport {installAtlasTouch} from './hub-touch.mjs';\ninstallAtlasTouch({map,viewport,nav,metrics,camera,cancelCamera:()=>{cancelAnimationFrame(cameraFrame);drag=null;pressedArtwork=null;}});\n`;
export async function prepareAtlasTouch(dir){
  if(dir instanceof URL)dir=fileURLToPath(dir);
  const original=await fs.readFile(path.join(dir,'atlas.mjs'));
  await fs.writeFile(path.join(dir,'hub-runtime.mjs'),Buffer.concat([original,Buffer.from(touchSuffix)]));
  const upstream=await fs.readFile(path.join(dir,'upstream-index.html'),'utf8');
  const proof=JSON.parse(await fs.readFile(path.join(dir,'upstream-provenance.json'),'utf8'));
  const runtime=upstream.match(/id="atlas-module" type="module" src="([^"]+)"/)?.[1];
  if(!runtime?.startsWith('atlas.mjs?'))throw Error('Unexpected upstream runtime entry');
  proof.hostRuntime={original:runtime,derived:'hub-runtime.mjs'};
  const entry=upstream.replace(`src="${runtime}"`,'src="hub-runtime.mjs"').replace('</head>',proof.entryAdditions.head+'</head>').replace('</body>',proof.entryAdditions.body+'</body>');
  await fs.writeFile(path.join(dir,'index.html'),entry);
  await fs.writeFile(path.join(dir,'upstream-provenance.json'),JSON.stringify(proof,null,2)+'\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await prepareAtlasTouch(new URL('../public/atlas-engine/',import.meta.url));
