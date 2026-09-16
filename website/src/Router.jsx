import {useEffect,useLayoutEffect,useState} from 'react';
const positions=new Map();
const listLocations=new Map();
export const returnToList=href=>listLocations.get(href.split('?')[0])||href;
export function useRoute(){
  const [hash,setHash]=useState(()=>window.location.hash||'#welcome');
  useEffect(()=>{const update=()=>setHash(window.location.hash||'#welcome');window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  const path=hash.split('?')[0];
  if(['#/people','#/stories','#/regions'].includes(path))listLocations.set(path,window.location.hash);
  useLayoutEffect(()=>{
    let ready=false;
    const targetY=positions.get(hash)||0;
    const save=()=>{const current=window.location.hash||'#welcome';if(ready&&current.split('?')[0]===path)positions.set(current,window.scrollY);};
    const frame=requestAnimationFrame(()=>{
      if(path.startsWith('#/')){window.scrollTo?.({top:targetY,behavior:'instant'});document.querySelector('main h1')?.focus({preventScroll:true});}
      else document.getElementById(path.slice(1))?.scrollIntoView?.({behavior:'instant'});
      ready=true;
    });
    window.addEventListener('scroll',save,{passive:true});
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',save);};
  },[hash]);
  return {hash,path,parts:path.replace(/^#\//,'').split('/'),home:!path.startsWith('#/')};
}
export function useFilters(defaults){
  const readFilters=()=>{const q=new URLSearchParams(window.location.hash.split('?')[1]);return Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,q.get(k)||v]));};
  const [filters,setFilters]=useState(readFilters);
  useEffect(()=>{const update=()=>setFilters(readFilters());window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  function update(values){setFilters(previous=>{const next={...previous,...values};const q=new URLSearchParams();Object.entries(next).forEach(([k,v])=>{if(v&&v!==defaults[k])q.set(k,v);});const path=window.location.hash.split('?')[0];const href=path+(q.size?'?'+q:'');window.history.replaceState(null,'',href);listLocations.set(path,href);return next;});}
  return [filters,update,()=>update(defaults)];
}
