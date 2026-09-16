import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CaretRight, Diamond, X } from '@phosphor-icons/react';
import { Reveal } from './Reveal.jsx';
import { Fireflies } from './Fireflies.jsx';
import { WelcomeCharacters } from './WelcomeCharacters.jsx';
import { Explore } from './Explore.jsx';
import { Atlas } from './Atlas.jsx';
import {SiteHeader} from './SiteHeader.jsx';
import {SearchDialog} from './SearchDialog.jsx';
import {HomeSections} from './HomeSections.jsx';
import {Footer} from './HubShared.jsx';
import {HubPages} from './HubPages.jsx';
import {useRoute} from './Router.jsx';
import './hub.css';
import './footer-music.css';

const assets = '/assets/hero/';
const notices = {
  map: { title: '지도를 펼쳐, 비레스를 만나보세요', body: '지도를 천천히 옮겨가며 나라와 권역의 자리를 살펴보세요. 소개가 궁금하다면 지도를 닫고 깃발이나 목록에서 골라보세요.', map: true },
};
function Rule({ className = '', delay = 0 }) {
  return <Reveal className={`rule ${className}`} delay={delay} aria-hidden="true"><Diamond size={12} /></Reveal>;
}

export function App() {
  const route=useRoute();
  const [searchOpen,setSearchOpen]=useState(false);
  const closeSearch=useCallback(()=>setSearchOpen(false),[]);
  const [notice, setNotice] = useState(null);
  const opener = useRef(null);
  const closeButton = useRef(null);
  function showNotice(kind, event) { opener.current = event.currentTarget; setNotice(notices[kind]); }
  function closeNotice() { setNotice(null); opener.current?.focus(); }
  useEffect(()=>{if(route.home)document.title='VIRETH · 비레스에 오신 걸 환영해요';},[route.home]);
  useEffect(() => {
    if (!notice) return;
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function keydown(event) {
      if (event.key === 'Escape') { setNotice(null); opener.current?.focus(); }
      if (event.key === 'Tab') {
        const controls=[...closeButton.current.closest('[role="dialog"]').querySelectorAll('button,[tabindex="0"]')];
        const index=controls.indexOf(document.activeElement);
        event.preventDefault();
        controls[(index+(event.shiftKey ? -1 : 1)+controls.length)%controls.length]?.focus();
      }
    }
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', keydown); };
  }, [notice]);
  return <>
    <SiteHeader home={route.home} onSearch={()=>setSearchOpen(true)}/>
    <a className="skip-link" href="#main" onClick={event=>{event.preventDefault();document.getElementById('main').focus();document.getElementById('main').scrollIntoView({behavior:'instant'});}}>본문으로 바로 가기</a>
    <main id="main" tabIndex={-1}>
      {route.home ? <>
      <section className="gateway" id="welcome" aria-labelledby="welcome-title">
        <Reveal as="picture" className="gateway-art" aria-hidden="true">
          <source media="(max-width: 680px)" srcSet={`${assets}hero-mobile.png`} />
          <img src={`${assets}hero-desktop.png`} width="1672" height="941" fetchPriority="high" alt="" />
        </Reveal>
        <Fireflies />
        <WelcomeCharacters />
        <div className="hero-copy">
          <Reveal className="wordmark hero-wordmark" delay={40}>VIRETH</Reveal>
          <Reveal as="h1" delay={100} id="welcome-title">비레스에 <span>오신 걸 환영해요</span></Reveal>
          <Reveal as="p" delay={180}>나라와 마을을 둘러보고,<br />그곳에 남겨진 이야기를 만나보세요.</Reveal>
          <Rule className="hero-rule" delay={240} />
          <div className="hero-actions">
            <Reveal as="a" delay={300} className="button-primary" href="#first-steps"><span className="button-label">비레스 둘러보기</span><CaretRight size={18} /></Reveal>
            <Reveal as="a" href="#/people" delay={380} className="button-secondary" aria-label="인물대백과 만나보기"><span className="button-label">인물대백과</span><CaretRight size={18} /></Reveal>
          </div>
        </div>
      </section>
      <section className="first-steps" id="first-steps" aria-labelledby="first-title">
        <Reveal as="img" delay={160} className="city-edge" src={`${assets}hero-city-edge.png`} width="1024" height="1536" alt="" aria-hidden="true" />
        <div className="guide-background" aria-hidden="true">
          <div className="section-brand">
            <Reveal as="img" src="/assets/branding/vireth-logo-20260915.png" width="1539" height="537" alt="비레스 배경 로고" decoding="async" />
          </div>
          <Reveal as="img" className="guide-character" src="/assets/characters/duran-guide-v2-cutout-20260915.png" width="1086" height="1448" alt="손을 펼쳐 비레스를 안내하는 듀란" decoding="async" />
        </div>
        <div className="first-copy">
          <Reveal className="first-accent" delay={40} aria-hidden="true"><Diamond size={16} weight="duotone" /></Reveal>
          <Reveal as="h2" delay={120} id="first-title">처음이라면, 여기부터 만나보세요</Reveal>
          <Reveal as="p" delay={220}>낯선 이름은 하나씩 풀어드릴게요.<br />마음이 가는 곳부터 편하게 둘러보세요.</Reveal>
          <Reveal as="a" delay={300} className="button-primary intro-link" href="#/guide/first">처음 만나는 비레스<CaretRight size={18}/></Reveal>
        </div>
        <Rule className="section-rule" />
      </section>
      <Explore openMap={event => showNotice('map', event)} />
      <HomeSections/>
      </> : <HubPages key={route.path} route={route}/>}
    </main>
    <Footer home={route.home}/>
    {searchOpen&&<SearchDialog onClose={closeSearch}/>}
    {notice && <div className="notice-backdrop" onClick={event => { if (event.target === event.currentTarget) closeNotice(); }}>
      <section className={`notice${notice.map ? ' atlas-notice' : ''}`} role="dialog" aria-modal="true" aria-labelledby="notice-title" aria-describedby="notice-body">
        <button ref={closeButton} className="notice-close" aria-label="안내 닫기" onClick={closeNotice}><X size={24} /></button>
        <p className="notice-eyebrow">비레스 첫 관문</p>
        <h2 id="notice-title">{notice.title}</h2>
        <p id="notice-body">{notice.body}</p>
        {notice.map && <div className="atlas-scroll" tabIndex={0} role="region" aria-label="확대 지도 스크롤 영역"><Atlas /></div>}
      </section>
    </div>}
  </>;
}
