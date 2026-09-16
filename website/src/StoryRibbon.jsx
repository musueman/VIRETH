import React,{useEffect,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';
import {useSliderInteraction} from './useSliderInteraction.js';

export function StoryRibbon({stories}){
 const root=useRef(null);
 const [paused,setPaused]=useState(false);
 const {hovered,focused,clearFocus,handlers}=useSliderInteraction(root);
 const [visible,setVisible]=useState(!window.IntersectionObserver),[foreground,setForeground]=useState(!document.hidden);
 const [staticMode,setStaticMode]=useState(()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce), (max-width: 760px)').matches);
 useEffect(()=>{
  const preference=window.matchMedia?.('(prefers-reduced-motion: reduce), (max-width: 760px)');
  const motion=()=>setStaticMode(!!preference?.matches),visibility=()=>setForeground(!document.hidden);
  const observer=window.IntersectionObserver?new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0}):null;
  observer?.observe(root.current);preference?.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
  return()=>{observer?.disconnect();preference?.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 const items=stories.flatMap(story=>(story.illustrations||[]).filter(art=>art.asset).map((art,index)=>({...art,storyId:story.id,title:story.title,key:`${story.id}-${index}`})));
 const running=items.length>1&&visible&&foreground&&!staticMode&&!paused&&!hovered&&!focused;
 return <Reveal className="story-ribbon-reveal" delay={180}><div ref={root} className="story-ribbon" role="region" aria-label="삽화로 만나는 이야기" data-running={running} data-static={staticMode}
  {...handlers}>
  <div className="story-ribbon-heading"><p>삽화 속에서, 다음 이야기를 만나보세요</p><button aria-label={paused?'삽화 흐름 재생하기':'삽화 흐름 멈추기'} aria-pressed={paused} disabled={staticMode||items.length<2} onClick={()=>{setPaused(value=>!value);clearFocus();}}>{paused||staticMode?<Play size={16}/>:<Pause size={16}/>}<span>{staticMode?'옆으로 넘겨보기':paused?'재생':'잠시 멈추기'}</span></button></div>
  <div className="story-ribbon-window"><div className="story-ribbon-track" style={{'--ribbon-duration':`${Math.max(40,items.length*13)}s`}}>
   {[false,true].map(copy=><div key={String(copy)} className="story-ribbon-group" data-copy={copy} aria-hidden={copy||undefined}>
    {items.map(art=><a key={art.key} className="story-ribbon-card" draggable={false} href={`#/story/${art.storyId}`} tabIndex={copy?-1:0} aria-label={`${art.title} — ${art.alt||'삽화'} 이야기 읽기`}>
     <img src={art.asset} draggable={false} alt="" loading="lazy" decoding="async" width="320" height="200"/>
     <span className="story-ribbon-caption"><span>{art.title}</span><ArrowUpRight size={18}/></span>
    </a>)}
   </div>)}
  </div></div>
 </div></Reveal>;
}
