import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../public/atlas-engine/',import.meta.url);
const html=fs.readFileSync(new URL('index.html',root),'utf8');
const mapping=JSON.parse(html.match(/<script type="importmap">(.*?)<\/script>/)?.[1]||'{}');
const target=Object.entries(mapping.imports||{}).find(([key])=>key.includes('atlas-core.mjs'))?.[1]||'atlas-core.mjs';
const core=await import(new URL(target,root));
const maps=JSON.parse(fs.readFileSync(new URL('data/facility-master.json',root),'utf8')).maps.filter(m=>m.status!=='redirect');
const storage=()=>{const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};
function boot(entry,store,search=''){
  globalThis.window={parent:{},location:{hash:`#${entry}`,search},sessionStorage:store};
  const nav=core.createNavigator(maps);
  for(const id of core.entryPath(maps,entry))assert.equal(nav.enter(id),true);
  return nav;
}
after(()=>{delete globalThis.window;});
test('reset starts at the requested first map and replaces only that entry record',()=>{
  const store=storage();let nav=boot('tiris',store);
  nav.enter('silverkeep');nav.enter('silverkeep-civic');nav.update({zoom:2,center:[585,730]});
  nav=boot('leonia',store);nav.update({zoom:1.6});
  const otherRecord=store.getItem('vireth:atlas-view:v1:leonia');
  nav=boot('tiris',store,'?reset=1');
  assert.equal(nav.current().id,'tiris');assert.equal(nav.current().zoom,1);
  assert.deepEqual(nav.current().center,[649,803]);
  assert.equal(store.getItem('vireth:atlas-view:v1:leonia'),otherRecord);
  nav=boot('tiris',store);assert.equal(nav.current().id,'tiris');assert.equal(nav.current().zoom,1);
  nav=boot('leonia',store);assert.equal(nav.current().zoom,1.6);
});
test('reentry restores the last child map, exact camera and ancestor cameras',()=>{
  const store=storage();let nav=boot('tiris',store);
  nav.update({zoom:1.4,center:[645,840]});
  assert(nav.enter('silverkeep'));nav.update({zoom:1.8,center:[580,740]});
  assert(nav.enter('silverkeep-civic'));
  const b=nav.current().bounds,center=[b[0]+b[2]*.42,b[1]+b[3]*.6];
  nav.update({zoom:2,center});
  nav=boot('tiris',store);
  assert.equal(nav.current().id,'silverkeep-civic');
  assert.equal(nav.current().zoom,2);assert.deepEqual(nav.current().center,center);
  assert(nav.back());assert.equal(nav.current().id,'silverkeep');
  assert.equal(nav.current().zoom,1.8);assert.deepEqual(nav.current().center,[580,740]);
});
test('separate entry countries do not overwrite each other and latest movement wins',()=>{
  const store=storage();let nav=boot('tiris',store);nav.enter('silverkeep');nav.update({zoom:1.8});
  nav=boot('leonia',store);assert.equal(nav.current().id,'leonia');nav.update({zoom:1.6});
  nav=boot('tiris',store);assert.equal(nav.current().id,'silverkeep');assert.equal(nav.current().zoom,1.8);
  nav.update({zoom:2});nav=boot('tiris',store);assert.equal(nav.current().zoom,2);
  nav=boot('leonia',store);assert.equal(nav.current().zoom,1.6);
});
test('invalid saved state and blocked storage fall back to a usable requested map',()=>{
  for(const bad of ['{broken',JSON.stringify([{id:'world',zoom:1,center:[0,0]},{id:'not-a-map',zoom:9,center:[0,0]}])]){
    const nav=boot('tiris',{getItem:()=>bad,setItem(){}});
    assert.equal(nav.current().id,'tiris');assert.equal(nav.current().zoom,1);
  }
  const nav=boot('tiris',{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});
  assert(nav.enter('silverkeep'));nav.update({zoom:1.4});assert.equal(nav.current().zoom,1.4);
});
