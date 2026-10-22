// Host-only session adapter. The upstream core, map data and artwork stay intact.
// Import without the version query so this import bypasses the host import map.
export * from './atlas-core.mjs';
import {createNavigator as originalNavigator,entryPath as originalPath} from './atlas-core.mjs';
let startupPath=null;
const view=s=>({id:s.id,zoom:s.zoom,center:[...s.center],labels:s.labels});
function readTrail(maps,storage,key){
  try{
    const trail=JSON.parse(storage?.getItem(key)||'null');
    if(!Array.isArray(trail)||!trail.length||trail.length>maps.length||trail[0]?.id!=='world')return null;
    const probe=originalNavigator(maps);
    for(let i=0;i<trail.length;i++){
      const s=trail[i];
      if(i&&!probe.enter(s?.id))return null;
      const b=probe.current().bounds;
      if(!Number.isFinite(s.zoom)||s.zoom<1||s.zoom>2.5||typeof s.labels!=='boolean'||!Array.isArray(s.center)||s.center.length!==2||!s.center.every((n,j)=>Number.isFinite(n)&&n>=b[j]&&n<=b[j]+b[j+2]))return null;
    }
    return trail.map(view);
  }catch{return null;}
}
export function createNavigator(maps){
  startupPath=null;
  const nav=originalNavigator(maps);
  if(window.parent===window)return nav;
  const entry=window.location.hash.slice(1)||'world';
  const key=`vireth:atlas-view:v1:${entry}`;
  let storage;try{storage=window.sessionStorage;}catch{/* Storage may be disabled. */}
  const reset=new URLSearchParams(window.location.search).get('reset')==='1';
  let resume=reset?null:readTrail(maps,storage,key),cursor=1;
  if(resume){startupPath=resume.slice(1).map(s=>s.id);nav.update(resume[0]);}
  const save=()=>{try{storage?.setItem(key,JSON.stringify(nav.breadcrumb().map(view)));}catch{/* Navigation remains usable without persistence. */}};
  if(reset)save();
  return {
    current:nav.current,breadcrumb:nav.breadcrumb,
    update(patch){nav.update(patch);save();},
    enter(id){
      if(!nav.enter(id))return false;
      if(resume?.[cursor]?.id===id){nav.update(resume[cursor++]);if(cursor===resume.length)resume=null;}
      else resume=null;
      save();return true;
    },
    back(){resume=null;const moved=nav.back();if(moved)save();return moved;}
  };
}
export function entryPath(maps,id){
  if(startupPath!==null){const path=startupPath;startupPath=null;return path;}
  return originalPath(maps,id);
}
