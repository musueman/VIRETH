import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'public/atlas-engine');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const proof=await read(path.join(dir,'upstream-provenance.json'));
let verifiedBytes=0;
for(const record of proof.files){
  const bytes=await fs.readFile(path.join(dir,record.file));
  assert.equal(sha(bytes),record.sha256,record.file);
  verifiedBytes+=bytes.length;
}
const entry=await fs.readFile(path.join(dir,'index.html'),'utf8');
assert.equal(entry.replace(proof.entryAdditions.head,'').replace(proof.entryAdditions.body,''),await fs.readFile(path.join(dir,'upstream-index.html'),'utf8'),'Only host CSS/bridge may be added to the original HTML');
const data=await read(path.join(dir,'data/facility-master.json'));
const original=await read(process.argv[2]);
const assets=await read(path.join(dir,'asset-manifest.json'));
assert.equal(assets.sourceMasterSHA256,sha(await fs.readFile(process.argv[2])),'Reviewed canonical master hash');
// Public export omits editorial/provenance metadata. Compare every exported
// runtime value recursively, preserving array length/order and exact numbers.
function sameRuntime(actual,source,label){
  if(Array.isArray(actual)){
    assert(Array.isArray(source),label);assert.equal(actual.length,source.length,label);
    actual.forEach((value,i)=>sameRuntime(value,source[i],`${label}/${i}`));
  }else if(actual&&typeof actual==='object'){
    for(const key of Object.keys(actual))sameRuntime(actual[key],source?.[key],`${label}/${key}`);
  }else assert.deepEqual(actual,source,label);
}
assert.deepEqual(data.maps.map(m=>m.id),original.maps.map(m=>m.id),'Map IDs and ordering');
const fields=['id','name','parentMapId','kind','bounds','status','placeId','geometry','clickPolygon','labelAnchor','linkedSelectionTargets','geographicSelection','redirectMapId','navigationListOnly','placeRepresentations'];
for(const map of data.maps){
  const source=original.maps.find(m=>m.id===map.id);
  for(const key of fields)sameRuntime(map[key],source[key],`${map.id}.${key}`);
}
for(const key of ['places','features','representations','circulation','overviewDrawings'])sameRuntime(data[key],original[key],key);
const {entryPath,createNavigator,localToWorld}=await import(pathToFileURL(path.join(dir,'atlas-core.mjs')));
const active=data.maps.filter(m=>m.status==='ready');
const nav=createNavigator(active);
assert(nav.enter('tiris'));assert(nav.enter('silverkeep'));assert(nav.enter('silverkeep-civic'));
assert.deepEqual(nav.breadcrumb().map(m=>m.id),['world','tiris','silverkeep','silverkeep-civic']);
assert(nav.back());assert.equal(nav.current().id,'silverkeep');
for(const m of active){
  const chain=entryPath(data.maps,m.id);
  if(m.id!=='world')assert.equal(chain.at(-1),m.id,`Direct entry ${m.id}`);
}
for(const m of data.maps.filter(m=>m.status==='redirect'))assert.equal(entryPath(data.maps,m.id).at(-1),m.redirectMapId,`Redirect ${m.id}`);
for(const f of data.features){
  if(!f.artworkAnchor||!f.displayWorldAnchor)continue;
  const map=data.maps.find(m=>m.id===f.mapId);
  const point=localToWorld(f.artworkAnchor,map.bounds);
  point.forEach((n,i)=>assert(Math.abs(n-f.displayWorldAnchor[i])<1e-7,`Feature transform ${f.id}`));
}
const catalog=await read(path.join(root,'src/atlas-catalog.json'));
for(const p of catalog.places)assert.equal(p.mapId,data.places.find(x=>x.id===p.id).detailMapId,p.id);
const cutouts=await read(path.join(dir,'ui-assets/cutouts-v1/manifest.json'));
const report={commit:proof.commit,upstreamFilesVerified:proof.files.length,verifiedBytes,mapRecords:data.maps.length,readyMaps:active.length,redirects:data.maps.filter(m=>m.status==='redirect').length,activeWorldSelections:active.filter(m=>m.parentMapId==='world').length,canonicalMapFields:fields.length,places:data.places.length,features:data.features.length,cutoutMaps:Object.keys(cutouts.maps).length,allCanonicalCorrespondence:'PASS',allReadyDirectEntries:'PASS',allRedirectEntries:'PASS',tirisSilverkeepCivicRoundTrip:'PASS',sourceModified:false,deployed:false};
await fs.mkdir(path.join(root,'qa/atlas-original'),{recursive:true});
await fs.writeFile(path.join(root,'qa/atlas-original/correspondence.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
