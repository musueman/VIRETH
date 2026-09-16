import React,{useEffect,useRef,useState} from 'react';
import {ArrowRight} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';
import {content,PageTitle,Picture,Back,Link,Empty} from './HubShared.jsx';
import geography from './geography-v63.json';
import {useFilters} from './Router.jsx';
import './region-detail.css';
import placeArt from './place-art.json';
import './place-detail.css';
export function RegionMap({regionId,placeId}){
  const places=content.places.filter(p=>p.regionId===regionId);
  const [chosen,setChosen]=useState(placeId||places[0]?.id||'');
  useEffect(()=>setChosen(placeId||places[0]?.id||''),[regionId,placeId]);
  const selected=places.some(p=>p.id===chosen)?chosen:places[0]?.id;
  const xs=places.map(p=>p.at[0]),ys=places.map(p=>p.at[1]);
  const left=Math.max(0,Math.min(...xs)-75),top=Math.max(0,Math.min(...ys)-75);
  const width=Math.max(200,Math.max(...xs)-left+75),height=Math.max(200,Math.max(...ys)-top+75);
  return <div className="detail-map"><svg viewBox={`${left} ${top} ${width} ${height}`} role="img" aria-label="확정 지형 위의 지역과 장소 위치"><image href={geography.terrain} width="1280" height="1920"/>{geography.countries.filter(c=>c.id===regionId).map(c=><path key={c.id} d={c.path} fill="#f5d27624" stroke="#fff1be" strokeWidth="2" vectorEffect="non-scaling-stroke"/>)}{places.map(p=><a key={p.id} href={`#/place/${p.id}`} aria-label={`${p.name} 위치 살펴보기`}><circle cx={p.at[0]} cy={p.at[1]} r={p.id===placeId?7:4} fill={p.id===placeId?'#fff':'#f9d68b'} stroke="#142832" strokeWidth="1"/><title>{p.name}</title></a>)}</svg><p>밝은 점을 누르거나, 아래 목록에서 장소를 골라보세요.</p><div className="detail-map-picker"><label>지도에서 장소 고르기<select value={selected} onChange={event=>setChosen(event.target.value)}>{places.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><a href={`#/place/${selected}`}>선택한 장소 살펴보기<ArrowRight size={18}/></a></div></div>;
}
export function RegionsPage(){
  const[f,set,reset]=useFilters({q:''});
  const regions=content.regions.filter(r=>(r.name+r.copy).includes(f.q));
  return <div className="hub-page regions-overview">
    <section className="regions-introduction" aria-label="나라와 장소 소개">
      <Picture className="regions-intro-art" src="/assets/explore/regions-introduction-background-v1.webp" alt="" aria-hidden="true" loading="eager" fetchPriority="high"/>
      <PageTitle eyebrow="나라와 장소" title="어떤 풍경부터 만나볼까요?">나라의 넓이와 힘은 같은 뜻이 아니에요.<br/>그곳의 삶과 길을 따라 천천히 둘러보세요.</PageTitle>
    </section>
    <div className="catalog-filters"><label className="wide-filter">나라와 권역 찾기<input value={f.q} onChange={e=>set({q:e.target.value})} placeholder="나라 이름이나 궁금한 풍경"/></label><Link href="#explore">전체 지도에서 보기</Link></div>
    {regions.length?<div className="regions-grid">{regions.map(r=><Reveal as="a" href={`#/region/${r.id}`} key={r.id} className="region-tile">
      <Picture src={`/assets/explore/capitals/${r.id}.webp`} alt={`${r.name}의 ${r.capital} 전경`}/>
      <div><Picture className="region-card-crest" src={`/assets/explore/crests/${r.id}.png`} alt={`${r.name} 문장`} width="72" height="96"/><p className="hub-eyebrow">{r.kind}</p><h2>{r.name}</h2><p>{r.copy}</p><span className="text-link">이곳 둘러보기 →</span></div>
    </Reveal>)}</div>:<Empty reset={reset}/>}</div>;
}
export function RegionPage({region:r}){
  const places=content.places.filter(p=>p.regionId===r.id);
  const people=content.people.filter(p=>p.regionId===r.id);
  const mapRef=useRef(null);
  const mapId=`region-map-${r.id}`;
  function showMap(){
    mapRef.current?.focus({preventScroll:true});
    mapRef.current?.scrollIntoView({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  return <div className="hub-page region-page region-detail">
    <section className="region-hero" aria-label={`${r.name} 소개`}>
      <Picture className="region-panorama" src={`/assets/explore/capitals/${r.id}.webp`} alt={`${r.name}의 ${r.capital} 전경`} loading="eager" fetchPriority="high"/>
      <div className="region-hero-inner">
        <Back href="#/regions">나라와 권역으로</Back>
        <div className="region-hero-copy">
          <Picture className="detail-crest" src={`/assets/explore/crests/${r.id}.png`} alt={`${r.name} 문장`}/>
          <PageTitle eyebrow={`나라와 장소 · ${r.kind}`} title={r.name}>{r.copy}</PageTitle>
          <Reveal as="p" className="panorama-caption" delay={280}>그림 속 장소 · {r.capitalType} {r.capital}</Reveal>
        </div>
      </div>
    </section>
    <section className="region-discovery" aria-labelledby="region-discovery-heading">
      <div className="region-discovery-intro">
        <Reveal as="h2" id="region-discovery-heading">이곳의 도시와 마을</Reveal>
        <Reveal as="p" delay={60}>마음에 드는 이름을 골라보세요.<br/>지도에서도 위치를 확인할 수 있어요.</Reveal>
        <Reveal as="button" className="region-map-button" onClick={showMap} aria-controls={mapId} delay={120}>지도에서 위치 보기<ArrowRight size={20}/></Reveal>
      </div>
      <nav className="region-highlights" aria-label="먼저 만나는 도시와 마을">
        {places.slice(0,2).map((p,i)=><Reveal as="a" className="region-place-preview" key={p.id} href={`#/place/${p.id}`} delay={80+i*80}>
          <div className="region-preview-art">
            {p.name===r.capital?<Picture src={`/assets/explore/capitals/${r.id}.webp`} alt={`${r.capital} 전경`}/>:<svg viewBox={`${Math.max(0,p.at[0]-85)} ${Math.max(0,p.at[1]-85)} 170 170`} aria-hidden="true" focusable="false"><image href={geography.terrain} width="1280" height="1920"/><circle cx={p.at[0]} cy={p.at[1]} r="4" fill="#fff1be" stroke="#142832" strokeWidth="1.5"/></svg>}
            <span>{p.name===r.capital?r.capitalType:'지도 속 위치'}</span>
          </div>
          <div className="region-preview-copy"><h3>{p.name}<ArrowRight size={20}/></h3><p>{p.summary}</p></div>
        </Reveal>)}
      </nav>
    </section>
    <div className="region-content">
      <section aria-labelledby="region-directory-heading">
        <Reveal as="h2" id="region-directory-heading">조금 더 둘러볼까요?</Reveal>
        <Reveal as="p" className="muted">도시부터 작은 마을까지, 이곳의 삶을 만나보세요.</Reveal>
        <div className="place-directory">{places.map(p=><Reveal key={p.id} as="a" href={`#/place/${p.id}`}><span>{p.type}</span><h3>{p.name}</h3><p>{p.summary}</p><span className="text-link">자세히 만나보기<ArrowRight size={18}/></span></Reveal>)}</div>
      </section>
      <aside ref={mapRef} id={mapId} tabIndex={-1} aria-label={`${r.name} 지도`}>
        <Reveal as="h2">지도에서 만나보세요</Reveal>
        <Reveal><RegionMap regionId={r.id}/></Reveal>
      </aside>
    </div>
    {people.length>0&&<section className="page-section region-people"><Reveal as="h2">{r.name}에서 만나는 사람들</Reveal><div className="related-people">{people.map(p=><Reveal as="a" key={p.id} href={`#/person/${p.id}`}><Picture src={p.image} alt="" width="705" height="1005"/><span>{p.name}</span></Reveal>)}</div></section>}
  </div>;
}
export function PlacePage({place:p}){
  const r=content.regions.find(r=>r.id===p.regionId);
  const people=content.people.filter(x=>x.placeId===p.id);
  const art=placeArt[p.id];
  return <div className="hub-page place-page">
    <section className="place-introduction" aria-label={`${p.name} 소개`}>
      {art&&<div className="place-intro-backdrop"><Picture key={p.id} className="place-intro-art" src={art.src} alt={`${p.name} 전경`} loading="eager" fetchPriority="high"/></div>}
      <Back href={`#/region/${r.id}`}>{r.name}로 돌아가기</Back>
      <PageTitle eyebrow={`${r.name} · ${p.type}`} title={p.name}>{p.summary}</PageTitle>
    </section>
    <div className="place-detail-layout"><RegionMap regionId={p.regionId} placeId={p.id}/><div className="place-detail-copy"><h2>어디쯤에 있을까요?</h2><p>지도에서 조금 더 밝게 빛나는 점이 {p.name}의 자리예요. 가까운 점을 짚어 다른 장소도 함께 둘러보세요.</p><p>{r.copy}</p><Link href={`#/region/${r.id}`}>{r.name}의 다른 곳 만나보기</Link><figure><Picture src={`/assets/explore/capitals/${r.id}.webp`} alt={`${r.name}의 ${r.capital} 전경`}/><figcaption>함께 보는 지역 풍경 · {r.capital}<br/>{p.name.includes(r.capital)?'이곳의 전경이에요.':'위 그림은 이 장소가 아닌, 같은 권역의 대표 풍경이에요.'}</figcaption></figure></div></div>
    {people.length>0&&<section className="page-section"><h2>이곳에서 만날 수 있어요</h2><div className="related-people">{people.map(x=><a key={x.id} href={`#/person/${x.id}`}><Picture src={x.image} alt=""/><span>{x.name}</span></a>)}</div></section>}
  </div>;
}
