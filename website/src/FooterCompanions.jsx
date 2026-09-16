import React,{useEffect,useRef,useState} from 'react';
import {Pause,Play} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';

const clips={'duran-idle':20,'duran-smile':20,'bobo-walk':21,'bobo-sniff':21};
function Sprite({who,clip,time}){
 const frames=clips[clip],frame=Math.floor(time/100)%frames;
 return <span className={`footer-sprite footer-sprite-${who}`} data-companion={who} data-clip={clip}
  style={{backgroundImage:`url(/assets/footer/${clip}.webp)`,backgroundSize:`${frames*100}% 100%`,backgroundPosition:`${frame/(frames-1)*100}% 0%`}}/>;
}
export function FooterCompanions({active=true,entrance=true}){
 const root=useRef(null);
 const [time,setTime]=useState(0),[paused,setPaused]=useState(false),[loaded,setLoaded]=useState(()=>new Set());
 const [visible,setVisible]=useState(!window.IntersectionObserver),[foreground,setForeground]=useState(!document.hidden);
 const [reduced,setReduced]=useState(()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 const running=active&&visible&&foreground&&!reduced&&!paused&&loaded.size===4;
 useEffect(()=>{
  const preference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const motion=()=>setReduced(!!preference?.matches),visibility=()=>setForeground(!document.hidden);
  const observer=window.IntersectionObserver?new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0}):null;
  observer?.observe(root.current);preference?.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
  return()=>{observer?.disconnect();preference?.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{
  if(!running)return;
  const timer=setInterval(()=>setTime(value=>(value+100)%420000),100);
  return()=>clearInterval(timer);
 },[running]);
 // Two walking loops, two sniffing loops, then return along the same short path.
 const boboTime=time%16800,phase=Math.floor(boboTime/4200),local=boboTime%4200;
 const walking=!reduced&&(phase===0||phase===2);
 const progress=phase===0?local/4200:phase===1?1:phase===2?1-local/4200:0;
 const Wrapper=entrance?Reveal:'div';
 return <Wrapper className="footer-companions-reveal" {...(entrance?{delay:100}:{})}>
  <div ref={root} className="footer-companions" data-running={running}>
   {Object.keys(clips).map(clip=><img key={clip} className="footer-companion-preload" src={`/assets/footer/${clip}.webp`} alt="" aria-hidden="true" loading="lazy" onLoad={()=>setLoaded(previous=>new Set([...previous,clip]))}/>)}
   <div className="footer-companion-art" aria-hidden="true">
    <Sprite who="duran" clip={time%10000<6000?'duran-idle':'duran-smile'} time={time}/>
    <span className="footer-bobo-path" style={{transform:`translateX(${reduced?0:progress*32}px)`}}>
     <span className="footer-bobo-facing" style={{transform:`scaleX(${phase>=2?-1:1})`}}><Sprite who="bobo" clip={walking?'bobo-walk':'bobo-sniff'} time={local}/></span>
    </span>
   </div>
   {!reduced&&<button className="footer-motion-toggle" aria-label={paused?'캐릭터 움직임 재생하기':'캐릭터 움직임 멈추기'} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>}
  </div>
 </Wrapper>;
}
