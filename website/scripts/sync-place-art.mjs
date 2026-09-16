import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(app,'../..');
const latest='D:/OneDrive/444_비레스/00_최신본';
const activeMapping=path.join(latest,'01_문서_정본/Arcadia_기준시대_5083_이미지매핑_DB_v1.md');
const reviewIndex=path.join(repo,'assets/illustrations/generated_outputs/ck5083-generated-image-review-index-v1.md');
const active=fs.readFileSync(activeMapping,'utf8');
const places=JSON.parse(fs.readFileSync(path.join(app,'src/content.json'),'utf8')).places;
const norm=s=>s.replace(/\s+/g,'');
// Historical review index resolves Korean display names only. Every selected
// image must also be explicitly present in the current authoritative mapping.
const rows=fs.readFileSync(reviewIndex,'utf8').split(/\r?\n/)
  .filter(l=>l.includes('-labeled.png')&&/city_vistas|village_vistas/.test(l))
  .map(l=>({name:l.split('|')[1].trim(),file:l.match(/(?:city_vistas|village_vistas)\/[^` |]+\.png/)?.[0]}));
const aliases={'place-c91992123771823b':'라드바르할'};
const matches=places.map(p=>{
  const candidates=rows.filter(r=>norm(r.name)===norm(aliases[p.id]||p.name)&&r.file.includes(`-${p.regionId}-`));
  if(candidates.length!==1)throw new Error(`Ambiguous/missing illustration: ${p.id} ${p.name}`);
  const match=candidates[0];
  if(!active.includes(match.file))throw new Error(`Not in active mapping: ${match.file}`);
  const source=path.join(latest,'04_장소_문장_이미지/generated_outputs',match.file);
  if(!fs.existsSync(source))throw new Error(`Missing approved source: ${source}`);
  return {place:p,source,matchedName:match.name};
});
if(process.argv.includes('--check')){
  console.log(JSON.stringify({places:places.length,uniquelyMapped:matches.length,aliases},null,2));
  process.exit(0);
}
const target=path.join(app,'public/assets/places');
fs.mkdirSync(target,{recursive:true});
const manifest={};const records=[];
for(const {place:p,source,matchedName} of matches){
  const output=path.join(target,`${p.id}.webp`);
  execFileSync('magick',[source,'-resize','1600x900>','-quality','84',output],{windowsHide:true});
  manifest[p.id]={src:`/assets/places/${p.id}.webp`,name:p.name};
  records.push({id:p.id,name:p.name,regionId:p.regionId,matchedName,source,
    sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),
    output:manifest[p.id].src,bytes:fs.statSync(output).size});
}
fs.writeFileSync(path.join(app,'src/place-art.json'),JSON.stringify(manifest,null,2)+'\n');
fs.mkdirSync(path.join(app,'qa/place-backgrounds'),{recursive:true});
fs.writeFileSync(path.join(app,'qa/place-backgrounds/provenance.json'),JSON.stringify({
  activeMapping,reviewIndex,method:'Exact region + Korean name, one explicitly recorded capital alias; approved labeled source images, WebP derivatives only. No redraw or change to geography.',records
},null,2)+'\n');
console.log(JSON.stringify({mapped:records.length,totalBytes:records.reduce((n,r)=>n+r.bytes,0)},null,2));
