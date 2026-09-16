import React from 'react';
import {Reveal} from './Reveal.jsx';
import {content,PageTitle,Picture,Link,Empty,RegionSelect,Back} from './HubShared.jsx';
import {useFilters} from './Router.jsx';
const match=(s,q)=>s.replace(/\s/g,'').toLowerCase().includes(q.replace(/\s/g,'').toLowerCase());
function CatalogIntroduction({kind,eyebrow,title,children}){
  const src=kind==='people'?'/assets/journey-scenes/v1/30_market-view.webp':'/assets/journey-scenes/v1/25_ledger-clue.webp';
  return <section className={`catalog-introduction catalog-introduction--${kind}`} aria-label={`${eyebrow} 소개`}>
    <div className="catalog-intro-backdrop" aria-hidden="true"><Picture src={src} alt="" className="catalog-intro-art" loading="eager" fetchPriority="high"/></div>
    <PageTitle eyebrow={eyebrow} title={title}>{children}</PageTitle>
  </section>;
}
export function PeoplePage(){
  const[f,set,reset]=useFilters({q:'',region:'',species:'',page:'1'});
  const results=content.people.filter(p=>match(p.name+p.role+p.place,f.q)&&(!f.region||p.regionId===f.region)&&(!f.species||p.species===f.species));
  const pages=Math.max(1,Math.ceil(results.length/20));const page=Math.min(pages,Math.max(1,Number(f.page)||1));
  const change=v=>set({...v,page:'1'});
  return <div className="hub-page catalog-page"><CatalogIntroduction kind="people" eyebrow="인물대백과" title="비레스의 사람들">이름을 알면, 이야기가 조금 더 가까워져요.<br/>사는 곳과 하는 일부터 천천히 알아보세요.</CatalogIntroduction>
    <div className="catalog-filters"><label className="wide-filter">인물 이름 또는 하는 일<input value={f.q} onChange={e=>change({q:e.target.value})} placeholder="이름이나 하는 일을 적어보세요"/></label><RegionSelect value={f.region} onChange={region=>change({region})}/><label>종족<select value={f.species} onChange={e=>change({species:e.target.value})}><option value="">모든 사람</option>{[...new Set(content.people.map(p=>p.species))].map(s=><option key={s}>{s}</option>)}</select></label><button className="reset-filter" onClick={reset}>조건 지우기</button></div>
    <p className="result-count" aria-live="polite">{results.length}명의 사람을 만날 수 있어요.</p>
    {results.length?<><div className="people-grid">{results.slice((page-1)*20,page*20).map((p,i)=><Reveal key={p.id} as="a" className="person-card" href={`#/person/${p.id}`} delay={i%4*50}><div className="portrait-frame"><Picture src={p.image} alt={p.name} width="705" height="1005"/></div><div className="person-card-copy"><p>{p.region} · {p.species}</p><h2>{p.name}</h2><span>{p.role}</span></div></Reveal>)}</div><nav className="pagination" aria-label="인물 목록 페이지">{Array.from({length:pages},(_,i)=><button key={i} aria-current={page===i+1?'page':undefined} onClick={()=>{set({page:String(i+1)});document.querySelector('.catalog-filters')?.scrollIntoView({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>{i+1}</button>)}</nav></>:<Empty reset={reset}/>}
  </div>;
}
export function PersonPage({person:p}){return <div className="hub-page person-page"><Back href={`#/people?region=${p.regionId}`}>인물대백과로</Back><div className="person-profile"><div className="profile-heading"><PageTitle eyebrow={`${p.region} · ${p.species}`} title={p.name}>{p.place}에서 만날 수 있는 사람이에요.<br/>어떤 모습인지, 무엇을 지니고 다니는지 살펴보세요.</PageTitle><Reveal as="p" className="profile-role">하는 일 · {p.role}</Reveal></div><Reveal className="profile-portrait"><Picture src={p.image} alt={p.name} width="705" height="1005"/></Reveal><div className="profile-copy"><dl className="person-facts"><div><dt>태어난 때</dt><dd>{p.birth}</dd></div><div><dt>성별</dt><dd>{p.gender}</dd></div><div><dt>머무는 곳</dt><dd>{p.placeId?<a href={`#/place/${p.placeId}`}>{p.place}</a>:p.place}</dd></div></dl><Reveal className="profile-description"><h2>눈에 들어오는 모습</h2><p>{p.appearance}</p><h2>옷차림과 지닌 것들</h2><p>{p.clothing}</p><p>{p.belongings}</p></Reveal><Link href={`#/region/${p.regionId}`}>{p.region} 둘러보기</Link></div></div><section className="page-section"><h2>같은 곳에서 만나는 사람들</h2><div className="related-people">{content.people.filter(x=>x.regionId===p.regionId&&x.id!==p.id).map(x=><a href={`#/person/${x.id}`} key={x.id}><Picture src={x.image} alt="" width="705" height="1005"/><span>{x.name}</span></a>)}</div></section></div>;}
export function LibraryPage(){
  const[f,set,reset]=useFilters({q:'',region:''});const stories=content.stories.filter(s=>match(s.title+s.form,f.q)&&(!f.region||s.regionIds.includes(f.region)));
  return <div className="hub-page library-page"><CatalogIntroduction kind="stories" eyebrow="이야기서고" title="한 편의 글에서, 더 넓은 세계로">누군가 보낸 편지, 오래 쓰다 만 장부.<br/>마음이 가는 글을 골라 그날의 이야기를 만나보세요.</CatalogIntroduction><div className="catalog-filters"><label className="wide-filter">이야기 제목 또는 글의 종류<input value={f.q} onChange={e=>set({q:e.target.value})} placeholder="편지, 장부, 궁금한 제목"/></label><RegionSelect value={f.region} onChange={region=>set({region})}/><button className="reset-filter" onClick={reset}>조건 지우기</button></div><p className="result-count" aria-live="polite">{stories.length}편의 이야기가 기다리고 있어요.{f.region?' 선택한 나라 이름이 원문에 나오는 글이에요.':''}</p>
    {stories.length?<div className="library-grid">{stories.map((s,i)=><Reveal as="a" className="library-entry" href={`#/story/${s.id}`} key={s.id} delay={i%2*80}><Picture src={s.illustrations[0]?.asset} alt={s.illustrations[0]?.alt||''}/><div><p className="hub-eyebrow">{s.minutes}분 정도 · {s.form}</p><h2>{s.title}</h2><p>{s.excerpt}</p><span className="text-link">이야기 펼치기 →</span></div></Reveal>)}</div>:<Empty reset={reset}/>}</div>;
}
