import React,{useLayoutEffect,useRef,useState} from 'react';
import {FooterCompanions} from './FooterCompanions.jsx';
import {FooterMusic} from './FooterMusic.jsx';
import {useSolidChrome} from './useSolidChrome.js';

export function Footer({home=false}){
 const visible=useSolidChrome(home),root=useRef(null);
 const [height,setHeight]=useState(85);
 useLayoutEffect(()=>{
  const update=()=>{
   const measured=Math.ceil(root.current.getBoundingClientRect().height);
   setHeight(measured);
   document.documentElement.style.setProperty('--footer-obstruction',`${visible?measured:0}px`);
   window.dispatchEvent(new Event('footergeometrychange'));
  };
  update();const observer=window.ResizeObserver?new ResizeObserver(update):null;
  observer?.observe(root.current);window.addEventListener('resize',update);
  return()=>{observer?.disconnect();window.removeEventListener('resize',update);document.documentElement.style.removeProperty('--footer-obstruction');};
 },[visible]);
 return <><div className="footer-spacer" aria-hidden="true" style={{height}}/>
  <footer ref={root} className="hub-footer" data-visible={visible} inert={!visible} aria-hidden={!visible}>
   <FooterMusic active={visible}/>
   <nav aria-label="아래 메뉴"><a href="#/guide/first">처음 만나는 비레스</a><a href="#/about">이용 안내</a><a href="#/materials">자료 안내</a><a href="#welcome">처음으로</a></nav>
   <FooterCompanions active={visible} entrance={false}/>
  </footer>
 </>;
}
