import React,{useEffect,useRef,useState} from 'react';
import {Picture} from './HubShared.jsx';
import {Reveal} from './Reveal.jsx';

// Coordinates belong to the unchanged 1536 x 1024 source, not the viewport.
const candles=[
  {x:101,y:125,size:190},
  {x:424,y:260,size:100},
  {x:446,y:252,size:95},
  {x:697,y:340,size:60},
  {x:713,y:339,size:55},
];

// Smooth random values, not a repeating wave or a fresh random jump each frame.
function noise(time,seed){
  const cell=Math.floor(time),fraction=time-cell;
  const hash=n=>{const value=Math.sin(n*127.1+seed*311.7)*43758.5453;return (value-Math.floor(value))*2-1;};
  const blend=fraction*fraction*fraction*(fraction*(fraction*6-15)+10);
  return hash(cell)+(hash(cell+1)-hash(cell))*blend;
}

export function ArchiveAtmosphere(){
  const root=useRef(null);
  const clock=useRef(0),seed=useRef(Math.random()*1000);
  const [frame,setFrame]=useState(null);
  const [visible,setVisible]=useState(!window.IntersectionObserver);
  const [foreground,setForeground]=useState(!document.hidden);
  const [reduced,setReduced]=useState(()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const running=visible&&foreground&&!reduced;
  useEffect(()=>{
    if(!running)return;
    const lights=[...root.current.querySelectorAll('.archive-candle-light')];
    const pages=[...root.current.querySelectorAll('.archive-paper-light>div')];
    const brass=root.current.querySelector('.archive-brass-light');
    let frameId,previous=null,lastPaint=-Infinity;
    const paint=now=>{
      if(previous!==null)clock.current+=Math.min(now-previous,80)/1000;
      previous=now;
      if(now-lastPaint>=32){
        lastPaint=now;
        const t=clock.current;
        lights.forEach((light,index)=>{
          const s=seed.current+index*17;
          const drift=noise(t/1.7,s),flutter=noise(t/.17,s+2),tremble=noise(t/.073,s+3);
          const lean=noise(t/.29,s+5)*.7+noise(t/1.1,s+6)*.3;
          light.style.setProperty('--candle-opacity',(.7+.09*drift+.085*flutter+.025*tremble).toFixed(4));
          light.style.setProperty('--halo-x',`${(-50+lean*2.5).toFixed(3)}%`);
          light.style.setProperty('--halo-scale',(1.06+.045*drift+.025*flutter).toFixed(4));
          light.style.setProperty('--flame-x',`${(lean*2.8).toFixed(3)}px`);
          light.style.setProperty('--flame-lean',`${(lean*12).toFixed(3)}deg`);
          light.style.setProperty('--flame-height',(1+.16*flutter+.06*tremble).toFixed(4));
          light.style.setProperty('--flame-opacity',(.76+.17*flutter+.06*tremble).toFixed(4));
        });
        pages.forEach((page,index)=>{
          const s=seed.current+index*31;
          page.style.opacity=(.49+.19*noise(t/2.3,s+7)+.055*noise(t/.71,s+8)).toFixed(4);
          page.style.transform=`translate(${(noise(t/3.1,s+9)*2.4).toFixed(3)}%,${(noise(t/2.7,s+10)*1.4).toFixed(3)}%)`;
        });
        brass.style.opacity=(.43+.13*noise(t/.83,seed.current)+.06*noise(t/.23,seed.current+2)).toFixed(4);
      }
      frameId=requestAnimationFrame(paint);
    };
    frameId=requestAnimationFrame(paint);
    return()=>cancelAnimationFrame(frameId);
  },[running]);
  useEffect(()=>{
    const element=root.current;
    const fit=()=>{
      const {width,height}=element.getBoundingClientRect();
      if(!width||!height)return;
      const scale=Math.max(width/1536,height/1024);
      setFrame({width:1536*scale,height:1024*scale,left:(width-1536*scale)*(window.innerWidth<=760?.24:.5),top:(height-1024*scale)*.5});
    };
    fit();
    const resize=window.ResizeObserver?new ResizeObserver(fit):null;
    resize?.observe(element);window.addEventListener('resize',fit);
    const observer=window.IntersectionObserver?new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0}):null;
    observer?.observe(element);
    const preference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const motion=()=>setReduced(!!preference?.matches);
    const visibility=()=>setForeground(!document.hidden);
    preference?.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
    return()=>{resize?.disconnect();observer?.disconnect();window.removeEventListener('resize',fit);preference?.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return <div ref={root} className="archive-atmosphere" aria-hidden="true" data-running={running}>
    <Reveal className="archive-art-plane" style={frame||undefined}>
      <Picture className="archive-art-image" src="/assets/expansion/archive-background.webp" alt=""/>
      {candles.map((c,index)=><div key={index} className="archive-candle-light" style={{left:`${c.x/1536*100}%`,top:`${c.y/1024*100}%`,width:`${c.size/1536*100}%`,height:`${c.size/1024*100}%`}}/>)}
      <div className="archive-brass-light"/>
      <div className="archive-paper-light archive-paper-left"><div/></div>
      <div className="archive-paper-light archive-paper-right"><div/></div>
    </Reveal>
  </div>;
}
