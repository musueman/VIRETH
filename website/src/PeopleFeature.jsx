import React,{useEffect,useRef,useState} from 'react';
import {CaretRight,Pause,Play} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';
import {content,Eyebrow,Link,Picture} from './HubShared.jsx';

const featured=['c012','c001','c027'].map(id=>content.people.find(p=>p.id===id));
export function PeopleFeature(){
  const section=useRef(null),video=useRef(null);
  const [selection,setSelection]=useState({index:0,leaving:null,revision:0});
  const [paused,setPaused]=useState(false);
  const [focused,setFocused]=useState(false);
  const [visible,setVisible]=useState(!window.IntersectionObserver);
  const [foreground,setForeground]=useState(!document.hidden);
  const [reduced,setReduced]=useState(()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const person=featured[selection.index];
  const running=visible&&foreground&&!reduced&&!paused&&!focused;
  useEffect(()=>{
    const preference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const motion=()=>setReduced(!!preference?.matches);
    const visibility=()=>setForeground(!document.hidden);
    const observer=window.IntersectionObserver?new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0}):null;
    observer?.observe(section.current);
    preference?.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
    return()=>{observer?.disconnect();preference?.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  useEffect(()=>{
    if(!running)return;
    const timer=setTimeout(()=>setSelection(previous=>({index:(previous.index+1)%featured.length,leaving:previous.index,revision:previous.revision+1})),5000);
    return()=>clearTimeout(timer);
  },[running,selection.revision]);
  useEffect(()=>{
    if(selection.leaving===null)return;
    if(reduced){setSelection(previous=>({...previous,leaving:null}));return;}
    const timer=setTimeout(()=>setSelection(previous=>({...previous,leaving:null})),650);
    return()=>clearTimeout(timer);
  },[selection.revision,reduced]);
  useEffect(()=>{
    const media=video.current;
    if(!media)return;
    if(running){const promise=media.play();promise?.catch(()=>{});}else media.pause();
    return()=>media.pause();
  },[running]);
  return <section ref={section} className="people-feature hub-section" id="people" aria-labelledby="people-title" data-motion={!reduced}>
    <Reveal className="people-video" aria-hidden="true"><video ref={video} muted loop playsInline preload="none" poster="/assets/expansion/people-background-poster-v1.jpg"><source src="/assets/expansion/people-background-v1.mp4" type="video/mp4"/></video></Reveal>
    <div className="people-feature-layout">
    <div className="people-feature-copy" onFocusCapture={event=>setFocused(event.target.matches(':focus-visible'))} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}>
      <div><Eyebrow reveal delay={40}>인물대백과</Eyebrow><Reveal as="h2" id="people-title" delay={120}>이름 너머의<br/>사람을 만나세요</Reveal><Reveal as="p" delay={220}>어디에서 무슨 일을 하며 지낼까요?<br/>한 사람씩, 조금 더 가까이 만나보세요.</Reveal></div>
      <Reveal className="person-profile-band" delay={180}><div key={person.id} className="person-feature-details swap-in"><p className="hub-eyebrow">{person.region} · {person.place}</p><h3>{person.name}</h3><p>{person.id==='c012'?'성문에서 만나는 차분한 안내자예요. 이름과 표식을 꼼꼼히 살피는 베켈의 하루를 들여다보세요.':`${person.place}에서 ${person.role} 일을 맡고 있어요. 이 사람의 모습과 일터를 함께 알아볼까요?`}</p><Link href={`#/person/${person.id}`}>이 사람 알아보기</Link></div></Reveal>
      <Reveal className="people-feature-actions" delay={220}><a className="button-secondary all-people" href="#/people">인물대백과 펼치기<CaretRight size={18}/></a><button className="people-motion-toggle" onClick={()=>setPaused(value=>!value)} aria-label={paused?'자동 넘김 시작하기':'자동 넘김 멈추기'} aria-pressed={paused} disabled={reduced}>{paused||reduced?<Play size={16}/>:<Pause size={16}/>}<span>{reduced?'동작 줄임':paused?'자동 넘김 켜기':'자동 넘김 멈추기'}</span></button></Reveal>
    </div>
    <Reveal className="feature-portrait" delay={160}>{featured.map((p,index)=>{
      const pose=index===selection.index?'active':index===selection.leaving?'leaving':index===(selection.index+1)%featured.length?'waiting':'rear';
      return <div key={p.id} className="portrait-layer" data-person={p.id} data-pose={pose} aria-hidden={pose!=='active'}><Picture src={p.image} alt={pose==='active'?p.name:''} width="705" height="1005"/></div>;
    })}</Reveal>
    </div>
  </section>;
}
