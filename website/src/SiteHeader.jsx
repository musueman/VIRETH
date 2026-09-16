import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Diamond,List,MagnifyingGlass,X} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';
import {useSolidChrome} from './useSolidChrome.js';
import './header-chatbot.css';
import {FullMenu} from './FullMenu.jsx';
export function SiteHeader({home,onSearch}){
  const[phase,setPhase]=useState('closed');const open=phase==='open';const shown=phase!=='closed';
  const solid=useSolidChrome(home);const button=useRef(null);const timer=useRef(null);const pending=useRef(null);
  function close(action){
    clearTimeout(timer.current);pending.current=typeof action==='function'?action:null;setPhase('closing');
    const finish=()=>{setPhase('closed');button.current?.focus({preventScroll:true});};
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)finish();
    else timer.current=setTimeout(finish,360);
  }
  function toggle(){if(open){close();return;}clearTimeout(timer.current);pending.current=null;setPhase('open');}
  useEffect(()=>{if(phase!=='closed'||!pending.current)return;const action=pending.current;pending.current=null;action();},[phase]);
  useEffect(()=>{const changed=()=>{clearTimeout(timer.current);pending.current=null;setPhase('closed');};window.addEventListener('hashchange',changed);return()=>{clearTimeout(timer.current);window.removeEventListener('hashchange',changed);};},[]);
  const navigate=href=>close(()=>{if(window.location.hash===href){document.querySelector('main h1')?.focus({preventScroll:true});}else window.location.hash=href;});
  const links=[['비레스 둘러보기',home?'#first-steps':'#/guide/first'],['이야기서고','#/stories'],['인물대백과','#/people']];
  return createPortal(<><header className="site-header" data-scrolled={solid||shown} data-menu-open={shown}>
    <Reveal as="a" className="header-brand" href="#welcome" aria-label="비레스 처음으로"><img src="/assets/branding/vireth-logo-20260915.png" width="1539" height="537" alt="비레스"/><img className="header-brand-dark" src="/assets/branding/vireth-logo-20260915.png" width="1539" height="537" alt="" aria-hidden="true"/></Reveal>
    <nav className="desktop-nav" aria-label="주 메뉴">{links.map(([name,href],i)=><Reveal as="a" delay={60+i*40} href={href} key={name} aria-label={i===0?'세계 둘러보기':undefined}>{name}</Reveal>)}</nav>
    <Reveal as="button" delay={160} className="search-button" aria-label="검색 안내" onClick={onSearch}><MagnifyingGlass size={21}/><span>검색</span></Reveal>
    <Reveal as="a" delay={200} className="header-chatbot" href="https://lunatalk.chat/character/detail/70170" target="_blank" rel="noopener noreferrer" aria-label="루나톡에서 비레스 만나기 (새 탭)">
      <img src="/assets/branding/lunatalk-icon.png" width="96" height="96" alt="" draggable={false}/>
      <span className="header-chatbot-tip" aria-hidden="true">루나톡에서 비레스 만나기 ↗</span>
    </Reveal>
    <button ref={button} id="full-menu-toggle" className="menu-toggle" aria-label={open?'메뉴 닫기':'메뉴 열기'} aria-expanded={open} aria-controls="full-menu" onClick={toggle}>{open?<X size={25}/>:<List size={25}/>}</button><div className="rule header-rule" aria-hidden="true"><Diamond size={12}/></div>
  </header>{shown&&<FullMenu phase={phase} buttonRef={button} onClose={close} onNavigate={navigate} onSearch={()=>close(onSearch)}/>}</>,document.body);
}
