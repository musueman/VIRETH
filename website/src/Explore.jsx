import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CaretRight, Diamond, X } from '@phosphor-icons/react';
import { Reveal } from './Reveal.jsx';
import places from './countries.json';
import { Atlas } from './Atlas.jsx';

// v63 geometry is shared with the enlarged atlas. Existing card motion is kept.

export function Explore({ openMap }) {
  const [stacked, setStacked] = useState(()=>!!window.matchMedia?.('(max-width: 1000px)').matches);
  const stackedRef = useRef(stacked);
  const slotRef = useRef(null);
  const [selected, setSelected] = useState(places[0].id);
  const [floating, setFloating] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [bottomInset, setBottomInset] = useState(24);
  const [slotHeight, setSlotHeight] = useState(0);
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const trigger = useRef(null);
  const restoringFocus = useRef(false);
  const scrolling = useRef(false);
  const pointer = useRef({x: null, y: null});
  const motion = useRef({active: false, exiting: false, timer: null});

  function finishExit() {
    clearTimeout(motion.current.timer);
    motion.current.active = false;
    motion.current.exiting = false;
    setFloating(false);
    setExiting(false);
  }
  function beginExit() {
    if (!motion.current.active || motion.current.exiting) return;
    scrolling.current = true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finishExit();
      return;
    }
    // Freeze the currently rendered viewport position; only the exit animation
    // moves the card from here, even if scrolling continues during the fade.
    setBottomInset(window.innerHeight - cardRef.current.getBoundingClientRect().bottom);
    motion.current.exiting = true;
    setExiting(true);
    motion.current.timer = setTimeout(finishExit, 360);
  }
  function positionCard(checkTopBoundary = false) {
    if (stackedRef.current) return;
    if (motion.current.exiting) return;
    const map = sectionRef.current?.querySelector('.atlas-preview');
    if (!map) return;
    const bounds = map.getBoundingClientRect();
    // Follow the viewport bottom until the map's own lower boundary catches it.
    const footerHeight=parseFloat(document.documentElement.style.getPropertyValue('--footer-obstruction'))||0;
    const inset = Math.max(footerHeight+24, window.innerHeight - bounds.bottom + 56);
    const height = cardRef.current?.getBoundingClientRect().height || 0;
    if (checkTopBoundary === true && motion.current.active && height > 0 && window.innerHeight - inset - height <= bounds.top + 56) {
      beginExit();
      return;
    }
    setBottomInset(inset);
  }

  function selectPlace(id, event) {
    if (restoringFocus.current) return;
    if (stackedRef.current) {
      setSelected(id);
      // Focus/hover may precede a touch click. Only activation should move the page.
      if (['click','change','keydown'].includes(event.type)) {
        slotRef.current?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      }
      return;
    }
    clearTimeout(motion.current.timer);
    motion.current.exiting = false;
    motion.current.active = true;
    setExiting(false);
    trigger.current = event.currentTarget;
    if (!hasOpened) setSlotHeight(cardRef.current?.getBoundingClientRect().height || 0);
    setHasOpened(true);
    positionCard();
    setSelected(id);
    setFloating(true);
  }
  function closeCard() {
    beginExit();
    restoringFocus.current = true;
    trigger.current?.focus({preventScroll: true});
    restoringFocus.current = false;
  }
  function hoverPlace(id, event) {
    if (stackedRef.current) return;
    // Scroll can move a different marker beneath a stationary pointer.
    // Only deliberate pointer movement may release this guard.
    if (!scrolling.current) selectPlace(id, event);
  }
  function moveOverPlace(id, event) {
    if (stackedRef.current) return;
    if (pointer.current.x === event.clientX && pointer.current.y === event.clientY) return;
    scrolling.current = false;
    selectPlace(id, event);
  }
  useEffect(() => {
    const layout=window.matchMedia?.('(max-width: 1000px)');
    const change=()=>{
      stackedRef.current=!!layout?.matches;
      finishExit();setHasOpened(false);setSlotHeight(0);setStacked(stackedRef.current);
    };
    layout?.addEventListener('change',change);
    return()=>layout?.removeEventListener('change',change);
  },[]);
  useEffect(() => {
    const onScroll = () => { scrolling.current = true; positionCard(true); };
    const onMove = event => { pointer.current = {x: event.clientX, y: event.clientY}; };
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('mousemove', onMove, {passive: true});
    window.addEventListener('resize', positionCard, {passive: true});
    window.addEventListener('footergeometrychange', positionCard);
    let observer;
    if (window.IntersectionObserver) {
      observer = new IntersectionObserver(entries => {
        if (!stackedRef.current && !entries[0].isIntersecting) beginExit();
      }, {rootMargin: '-82px 0px 0px 0px'});
      observer.observe(sectionRef.current);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', positionCard);
      window.removeEventListener('footergeometrychange', positionCard);
      observer?.disconnect();
      clearTimeout(motion.current.timer);
    };
  }, []);
  useEffect(() => {
    if (!floating) return;
    const onKey = event => { if (event.key === 'Escape') closeCard(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [floating]);

  const picker = <Reveal className={`country-picker${stacked?' country-picker-stacked':''}`} delay={200}>
    {stacked&&<label htmlFor="explore-country">나라 선택</label>}
    <select id="explore-country" aria-label="나라와 권역 고르기" value={selected} onChange={event=>selectPlace(event.target.value,event)}>
      <optgroup label="비레스의 나라들">{places.filter(place=>!place.isRegion).map(place=><option key={place.id} value={place.id}>{place.name}</option>)}</optgroup>
      <optgroup label="나라 밖으로 이어지는 권역">{places.filter(place=>place.isRegion).map(place=><option key={place.id} value={place.id}>{place.name} · {place.kind}</option>)}</optgroup>
    </select>
  </Reveal>;
  const card = <div ref={cardRef} className="place-box" data-floating={!stacked&&floating} data-exiting={!stacked&&exiting} onAnimationEnd={event => { if (event.target === event.currentTarget && motion.current.exiting) finishExit(); }} style={!stacked&&floating ? {bottom: `${bottomInset}px`} : undefined}>
    {floating && <button className="country-close" aria-label="나라 소개 닫기" onClick={closeCard}><X size={20} /></button>}
    <div className="place-panels">
      {places.map(place => <article key={place.id} id={`place-${place.id}`} className="place-panel" data-active={selected === place.id} aria-hidden={selected !== place.id}>
        <div className="country-art">
          <img className="capital-art" src={`/assets/explore/capitals/${place.id}.webp`} width="1280" height="720" alt={`${place.name}의 ${place.capitalType} ${place.capital} 전경`} loading="lazy" decoding="async" />
          <img className="country-crest" src={`/assets/explore/crests/${place.id}.png`} width={place.crestWidth} height={place.crestHeight} alt={`${place.name} 문장`} loading="lazy" decoding="async" />
        </div>
        <div className="place-details"><h3>{place.name}</h3><p className="place-region">{place.kind} · {place.capitalType} {place.capital}</p><p className="country-copy">{place.copy}</p><a className="country-detail-link text-link" tabIndex={selected===place.id?0:-1} href={`#/region/${place.id}`}>이곳 더 알아보기<CaretRight size={17}/></a></div>
      </article>)}
    </div>
  </div>;
  return <section ref={sectionRef} className="explore-lands" id="explore" data-layout={stacked?'stacked':'overlap'} aria-labelledby="explore-title">
    <div className="explore-inner">
      <div className="explore-heading">
        <Reveal className="explore-accent" aria-hidden="true"><Diamond size={16} weight="duotone" /></Reveal>
        <Reveal as="h2" id="explore-title" delay={60}>어떤 곳이 마음에 드세요?</Reveal>
        <Reveal as="p" delay={140}>땅이 넓다고 꼭 더 강한 나라는 아니에요. 나라를 고르고, 저마다의 삶과 힘을 만나보세요.</Reveal>
        <Reveal as="p" className="map-hint" delay={180}>나라의 땅이나 깃발을 짚어보세요. 목록에서도 고를 수 있어요.</Reveal>
        {!stacked&&picker}
        <Reveal as="button" className="explore-link" delay={180} onClick={openMap}>큰 지도로 둘러보기<CaretRight size={18} /></Reveal>
        <Reveal as="a" className="text-link region-directory-link" delay={220} href="#/regions">나라와 장소 목록<CaretRight size={18}/></Reveal>
      </div>
      {stacked&&picker}
      <Reveal className="atlas-preview" delay={120}>
        <Atlas selected={selected} onSelect={selectPlace} onHover={hoverPlace} onMove={moveOverPlace} />
      </Reveal>
      <div ref={slotRef} className="place-slot" style={{minHeight: !stacked&&hasOpened ? `${slotHeight}px` : undefined}}>
        <div className="explore-empty-mark" aria-hidden="true"><img src="/assets/branding/vireth-logo-20260915.png" width="1539" height="537" alt="" draggable={false}/></div>
        {stacked?card:!hasOpened&&<Reveal delay={200}>{card}</Reveal>}
      </div>
      {!stacked&&floating && createPortal(card, document.body)}
    </div>
    <div className="rule section-rule" aria-hidden="true"><Diamond size={12} /></div>
  </section>;
}
