import React,{useEffect,useRef,useState} from 'react';
import {CaretLeft,CaretRight,Pause,Play} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';
import {useSliderInteraction} from './useSliderInteraction.js';
const CROSSFADE_MS=1600;

export function JourneyGallery({scenes}){
  const root=useRef(null),touch=useRef(null),failed=useRef(new Set());
  const [selection,setSelection]=useState({index:0,leaving:null,revision:0});
  const [requested,setRequested]=useState(null);
  const [loaded,setLoaded]=useState(()=>new Set());
  const loadedRef=useRef(loaded);loadedRef.current=loaded;
  const [paused,setPaused]=useState(false);
  const {hovered,focused,clearFocus,handlers}=useSliderInteraction(root);
  const [visible,setVisible]=useState(!window.IntersectionObserver);
  const [foreground,setForeground]=useState(!document.hidden);
  const [reduced,setReduced]=useState(()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const [error,setError]=useState('');
  const {index,leaving,revision}=selection;
  const running=scenes.length>1&&visible&&foreground&&!paused&&!focused&&!hovered&&!reduced&&!error&&requested===null&&loaded.has(index);
  useEffect(()=>{
    const preference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const motion=()=>setReduced(!!preference?.matches);
    const visibility=()=>setForeground(!document.hidden);
    const observer=window.IntersectionObserver?new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0}):null;
    observer?.observe(root.current);
    preference?.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
    return()=>{observer?.disconnect();preference?.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  function choose(target){
    const next=(target+scenes.length)%scenes.length;
    setError('');
    if(next===index){setRequested(null);return;}
    if(failed.current.has(next)){setError('장면을 불러오지 못했어요. 다른 장면을 골라주세요.');setPaused(true);setRequested(null);return;}
    if(loadedRef.current.has(next)){
      setRequested(null);
      setSelection(previous=>({index:next,leaving:reduced?null:previous.index,revision:previous.revision+1}));
    }else setRequested(next);
  }
  useEffect(()=>{
    if(requested!==null&&loaded.has(requested)){
      setSelection(previous=>({index:requested,leaving:reduced?null:previous.index,revision:previous.revision+1}));
      setRequested(null);
    }
  },[requested,loaded,reduced]);
  useEffect(()=>{
    if(!running)return;
    const timer=setTimeout(()=>choose(index+1),6000);
    return()=>clearTimeout(timer);
  },[running,index,revision]);
  useEffect(()=>{
    if(leaving===null)return;
    if(reduced){setSelection(previous=>({...previous,leaving:null}));return;}
    const timer=setTimeout(()=>setSelection(previous=>({...previous,leaving:null})),CROSSFADE_MS+100);
    return()=>clearTimeout(timer);
  },[revision,reduced]);
  const scene=scenes[index];
  const mounted=[...new Set([index,leaving,requested??(visible?(index+1)%scenes.length:null)].filter(i=>i!==null))];
  return <div ref={root} className="journey-gallery" style={{'--journey-crossfade-duration':`${CROSSFADE_MS}ms`}} role="region" aria-roledescription="carousel" aria-label="비레스에서 만날 장면들" data-running={running} data-reduced={reduced}
    {...handlers}
    onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();choose(index+(event.key==='ArrowRight'?1:-1));}}}
    onTouchStart={event=>{touch.current={x:event.touches[0].clientX,y:event.touches[0].clientY};}}
    onTouchCancel={()=>{touch.current=null;}}
    onTouchEnd={event=>{if(!touch.current)return;const dx=event.changedTouches[0].clientX-touch.current.x,dy=event.changedTouches[0].clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.5)choose(index+(dx<0?1:-1));}}>
    <Reveal className="journey-art" delay={180}>
      {mounted.map(i=><div key={scenes[i].id} className="journey-slide" data-state={i===index?'active':i===leaving?'leaving':'waiting'} data-enter={i===index&&revision>0&&!reduced} aria-hidden={i!==index}>
        <img src={scenes[i].src} draggable={false} alt={i===index?scenes[i].alt:''} width="1536" height="864" loading={visible||requested===i?'eager':'lazy'} decoding="async"
          onLoad={()=>{failed.current.delete(i);setLoaded(previous=>previous.has(i)?previous:new Set([...previous,i]));}}
          onError={()=>{failed.current.add(i);if(i===index||i===requested){setError('장면을 불러오지 못했어요. 다른 장면을 골라주세요.');setPaused(true);setRequested(null);}}}/>
      </div>)}
    </Reveal>
    <Reveal className="journey-gallery-bottom" delay={260}>
      <div className="journey-caption" aria-live={running?'off':'polite'} aria-atomic="true"><span>{scene.category}</span><strong>{scene.title}</strong></div>
      <div className="journey-controls"><span className="journey-counter" aria-label={`${index+1} / ${scenes.length} 장면`}>{String(index+1).padStart(2,'0')}<span> / {String(scenes.length).padStart(2,'0')}</span></span>
        <button aria-label="이전 장면" onClick={()=>choose(index-1)}><CaretLeft size={22}/></button>
        <button aria-label={paused?'장면 자동 재생 시작하기':'장면 자동 재생 멈추기'} aria-pressed={paused} disabled={reduced} onClick={()=>{setPaused(value=>!value);clearFocus();}}>{paused||reduced?<Play size={20}/>:<Pause size={20}/>}</button>
        <button aria-label="다음 장면" onClick={()=>choose(index+1)}><CaretRight size={22}/></button>
      </div>
    </Reveal>
    <div className="journey-gallery-status" role="status">{error}</div>
  </div>;
}
