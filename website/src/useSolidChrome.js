import {useEffect,useState} from 'react';

// The header and bottom dock must cross exactly the same boundary.
export function useSolidChrome(home){
 const [scrolled,setScrolled]=useState(()=>window.scrollY>24);
 useEffect(()=>{
  const update=()=>setScrolled(window.scrollY>24);
  update();window.addEventListener('scroll',update,{passive:true});
  return()=>window.removeEventListener('scroll',update);
 },[]);
 return !home||scrolled;
}
