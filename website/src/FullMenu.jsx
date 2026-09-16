import React,{useEffect,useRef} from 'react';
import {ArrowRight,ArrowUpRight,MagnifyingGlass,Plus,Diamond} from '@phosphor-icons/react';
import content from './content.json';
import './full-menu.css';

export function FullMenu({phase,buttonRef,onClose,onNavigate,onSearch}){
  const panel=useRef(null);
  const closeRef=useRef(onClose);closeRef.current=onClose;
  const current=(window.location.hash||'#welcome').split('?')[0];
  useEffect(()=>{
    const html=document.documentElement;
    const previous={overflow:html.style.overflow,gutter:html.style.scrollbarGutter};
    html.style.scrollbarGutter='stable';html.style.overflow='hidden';
    // The footer stays visibly above this panel, but background controls are inert.
    const background=[document.getElementById('root'),...document.querySelectorAll('.site-header > :not(.menu-toggle):not(.header-rule)')].filter(Boolean);
    const states=background.map(el=>({el,inert:el.inert}));
    background.forEach(el=>{el.inert=true;});
    panel.current.querySelector('button')?.focus({preventScroll:true});
    const key=event=>{
      if(event.key==='Escape'){event.preventDefault();closeRef.current();return;}
      if(event.key!=='Tab')return;
      const items=[buttonRef.current,...panel.current.querySelectorAll('a[href],button,summary')].filter(el=>el&&!el.closest('details:not([open]) > :not(summary)'));
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&(document.activeElement===first||!items.includes(document.activeElement))){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||!items.includes(document.activeElement))){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',key);
    return()=>{
      html.style.overflow=previous.overflow;html.style.scrollbarGutter=previous.gutter;
      states.forEach(({el,inert})=>{el.inert=inert;});
      document.removeEventListener('keydown',key);
    };
  },[buttonRef]);
  const link=(href,label,description)=> <a href={href} aria-current={current===href?'page':undefined} onClick={event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();onNavigate(href);
  }}><span>{label}{description&&<small>{description}</small>}</span><ArrowRight size={21}/></a>;
  return <div ref={panel} id="full-menu" className="full-menu" data-phase={phase} role="dialog" aria-modal="true" aria-labelledby="full-menu-title" aria-owns="full-menu-toggle">
    <div className="full-menu-surface" aria-hidden="true"/>
    <div className="full-menu-scroll">
      <div className="full-menu-inner">
        <div className="full-menu-intro menu-arrive" style={{'--menu-delay':'40ms'}}>
          <p className="full-menu-kicker"><Diamond size={12}/> A JOURNEY THROUGH VIRETH</p>
          <h2 id="full-menu-title">비레스의 모든 길</h2>
          <p>어떤 이야기를 만나러 갈까요?</p>
          <button className="full-menu-search" onClick={onSearch} aria-label="메뉴에서 검색하기"><MagnifyingGlass size={22}/><span>궁금한 이름과 이야기를 찾아보세요</span><ArrowRight size={20}/></button>
        </div>
        <div className="full-menu-columns">
          <section className="full-menu-chapter menu-arrive" style={{'--menu-delay':'100ms'}}>
            <p className="full-menu-number">01 <span>THE WORLD</span></p>
            <h3>낯선 세계와 친해지기</h3>
            <details className="full-menu-guides" open={current.startsWith('#/guide/')||window.matchMedia?.('(min-width:761px)').matches}>
              <summary>처음 만나는 비레스<Plus size={20}/></summary>
              <nav aria-label="전체 메뉴 세계 안내">{content.guide.map((g,i)=><React.Fragment key={g.id}>{link(`#/guide/${g.id}`,<><b>0{i+1}</b>{g.eyebrow}</>)}</React.Fragment>)}</nav>
            </details>
            <nav className="full-menu-links" aria-label="전체 메뉴 세계 탐색">{link('#/regions','나라와 장소','도시에서 작은 마을까지')}{link('#explore','전체 지도','마음이 가는 땅을 따라')}</nav>
          </section>
          <section className="full-menu-chapter menu-arrive" style={{'--menu-delay':'160ms'}}>
            <p className="full-menu-number">02 <span>PEOPLE & STORIES</span></p>
            <h3>그곳에 사는 이야기</h3>
            <nav className="full-menu-links" aria-label="전체 메뉴 사람과 이야기">{link('#/people','인물대백과','이름 너머의 사람을 만나세요')}{link('#/stories','이야기서고','편지 한 통, 장부 한 장의 세계')}</nav>
            <div className="full-menu-note"><span aria-hidden="true">“</span><p>같은 땅에서,<br/>저마다의 이야기.</p><i aria-hidden="true"/></div>
          </section>
          <section className="full-menu-chapter menu-arrive" style={{'--menu-delay':'220ms'}}>
            <p className="full-menu-number">03 <span>YOUR NEXT CHAPTER</span></p>
            <h3>이제, 당신의 차례</h3>
            <nav className="full-menu-links" aria-label="전체 메뉴 이야기 시작">{link('#/start','첫 장면 고르기','당신의 이야기가 시작되는 곳')}</nav>
            <a className="full-menu-luna" href="https://lunatalk.chat/character/detail/70170" target="_blank" rel="noopener noreferrer" onClick={()=>onClose()}><img src="/assets/branding/lunatalk-icon.png" alt="" width="40" height="40"/><span>루나톡에서 비레스 만나기<small>챗봇 소개로 이동 · 새 탭</small></span><ArrowUpRight size={20}/></a>
            <p className="full-menu-auth">로그인 또는 인증이 필요할 수 있어요.</p>
          </section>
        </div>
        <nav className="full-menu-utilities menu-arrive" aria-label="전체 메뉴 이용 안내" style={{'--menu-delay':'260ms'}}>{link('#/about','이용 안내')}{link('#/materials','자료 안내')}{link('#welcome','처음으로')}</nav>
      </div>
    </div>
  </div>;
}
