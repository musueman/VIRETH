// Import approved geography only. Canon, population, and country art stay untouched.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=process.argv[2] || 'D:/OneDrive/444_비레스/00_최신본/02_지도/16_지리확정_지도_v63';
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
const manifest=JSON.parse(readFileSync(resolve(source,'manifest.json'),'utf8'));
function verified(name){const bytes=readFileSync(resolve(source,name));if(sha(bytes)!==manifest.files[name])throw Error(`Changed v63 source: ${name}`);return bytes;}
const points=JSON.parse(verified('settlement-migration.json'));
const territories=JSON.parse(verified('territories.json'));
const terrain=verified('terrain.png');
const centers=points.filter(p=>p.inheritedV3);
const cards=JSON.parse(readFileSync(resolve(root,'src/countries.json'),'utf8'));
if(centers.length!==20 || territories.countries.length!==15 || territories.nonSovereignRegions.length!==5)throw Error('Unexpected geography coverage');
for(const card of cards){const p=centers.find(p=>p.regionId===card.id);if(!p || p.region!==card.name)throw Error(`Unmapped card: ${card.id}`);}
function path(geometry){
  if(geometry.type==='Polygon')return geometry.coordinates.map(ring=>'M'+ring.map(p=>p.join(',')).join('L')+'Z').join(' ');
  if(geometry.type==='MultiPolygon')return geometry.coordinates.map(coordinates=>path({type:'Polygon',coordinates})).join(' ');
  throw Error(`Unsupported geometry: ${geometry.type}`);
}
const data={version:'v63',width:1280,height:1920,terrain:'/assets/explore/v63/terrain.png',
  centers:centers.map(p=>({id:p.regionId,placeId:p.id,name:p.name,at:p.at})),
  countries:territories.countries.map(c=>({id:c.id,name:c.name,path:path(c.geometry)})),
  nonSovereignIds:territories.nonSovereignRegions.map(r=>r.id)};
const output=resolve(root,'public/assets/explore/v63');mkdirSync(output,{recursive:true});
copyFileSync(resolve(source,'terrain.png'),resolve(output,'terrain.png'));
writeFileSync(resolve(root,'src/geography-v63.json'),JSON.stringify(data)+'\n');
writeFileSync(resolve(output,'provenance.json'),JSON.stringify({version:'v63',source,coordinateSystem:'1280 x 1920 image pixels, top-left origin',sourceHashes:Object.fromEntries(['terrain.png','settlement-migration.json','territories.json'].map(n=>[n,manifest.files[n]])),geometryDataSha256:sha(readFileSync(resolve(root,'src/geography-v63.json'))),preserved:'Original terrain bytes, capital vistas, crest pixels, country copy, card motion and layout'},null,2)+'\n');
console.log('v63 imported: original terrain, 15 country shapes, 20 representative places, 5 non-sovereign regions.');
