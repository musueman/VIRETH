import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowCounterClockwise,Compass} from '@phosphor-icons/react';
import {content,Link} from './HubShared.jsx';
import {Reveal} from './Reveal.jsx';
import catalog from './atlas-catalog.json';
import {atlasReturnHref} from './atlas-return.js';
import {AtlasResetDialog} from './AtlasResetDialog.jsx';
import './atlas-pilot.css';

export const CAPITAL_ID='place-c91992123771823b';
const maps=new Map(catalog.maps.map(m=>[m.id,m]));
export const atlasMapExists=id=>maps.has(id);
const publicURL=url=>url?.startsWith('/atlas-engine/')?`${import.meta.env.BASE_URL}${url.slice(1)}`:url;
function introFor(map){
  if(map.placeId&&content.places.some(p=>p.id===map.placeId))return {href:`#/place/${map.placeId}`,label:`${map.name} 소개 읽기`};
  if(map.regionId)return {href:`#/region/${map.regionId}`,label:`${map.name} 소개 읽기`};
  return null;
}

export function TirisMapPreview({placeId}){
  const [selected,setSelected]=useState(placeId||CAPITAL_ID);
  const place=catalog.places.find(p=>p.id===selected)||catalog.places[0];
  return <div className="pilot-inline-map">
    <a className="pilot-inline-art" href="#/atlas/tiris" aria-label="티리스 원본 지역도 펼치기"><img src={publicURL(maps.get('tiris').preview)} alt="완성된 티리스 지역도" loading="lazy"/></a>
    <div className="pilot-inline-copy"><p>그림 속 구획을 짚어 생활권과 도시의 상세 지도로 들어가 보세요.</p>
      <Link href="#/atlas/tiris">티리스 지역도 펼치기</Link>
      <label>티리스의 도시와 마을<select value={selected} onChange={e=>setSelected(e.target.value)}>{catalog.places.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <a className="pilot-small-link" href={`#/atlas/${place.mapId}`}>선택한 장소 지도 펼치기 <ArrowRight size={16}/></a>
      <a className="pilot-small-link" href={`#/place/${place.id}`}>{place.name} 알아보기 <ArrowRight size={16}/></a>
    </div>
  </div>;
}

export function SilverkeepPreview(){return <section className="pilot-city-section" aria-labelledby="pilot-city-title">
  <Reveal className="pilot-city-copy"><p className="pilot-eyebrow">VIRETH ATLAS · CITY</p><h2 id="pilot-city-title">성문 안쪽을 펼쳐보세요</h2><p>라드바르할의 상세도에서 시설을 살펴보고, 법정·신전 구획으로 더 가까이 들어가 보세요.</p><Link href="#/atlas/silverkeep">도시 상세 지도 펼치기</Link><p className="pilot-note">원본 지도의 시설 배치와 하위 지도를 연결했어요. 그림의 배율은 실제 이동 거리를 뜻하지 않아요.</p></Reveal>
  <Reveal as="a" className="pilot-city-art" href="#/atlas/silverkeep" aria-label="라드바르할 도시 상세 지도 펼치기"><img src={publicURL(maps.get('silverkeep').preview)} width="720" height="720" loading="lazy" alt="라드바르할 / 실버킵 도시 상세도 미리보기"/><span><Compass size={22}/> 라드바르할 / 실버킵 <ArrowRight size={20}/></span></Reveal>
</section>;}

export function AtlasPilotPage({mapId='world'}){
  const frame=useRef(null);
  const [entryMap]=useState(()=>{
    const queryPlace=new URLSearchParams(window.location.hash.split('?')[1]).get('place');
    return catalog.places.find(p=>p.id===queryPlace)?.mapId||mapId;
  });
  const [current,setCurrent]=useState(entryMap),[height,setHeight]=useState(920),[ready,setReady]=useState(false);
  const [resetVersion,setResetVersion]=useState(0);
  useEffect(()=>{
    if(resetVersion)frame.current?.closest('.pilot-atlas-page')?.querySelector('h1')?.focus({preventScroll:true});
  },[resetVersion]);
  const [confirmReset,setConfirmReset]=useState(false);
  const resetButton=useRef(null);
  const entry=maps.get(entryMap)||maps.get('world');
  function resetExploration(){
    setConfirmReset(false);
    setReady(false);setCurrent(entryMap);setResetVersion(version=>version+1);
  }
  const map=maps.get(current)||maps.get('world'),intro=introFor(map);
  useEffect(()=>{
    function receive(event){
      if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||event.data?.type!=='vireth-atlas-state'||!maps.has(event.data.mapId))return;
      setCurrent(event.data.mapId);setReady(true);
      if(Number.isFinite(event.data.height))setHeight(Math.max(480,Math.min(3600,event.data.height)));
      // Do not rewrite the top document's joint session history. The unmodified
      // original iframe owns back/forward and its saved camera history.
    }
    window.addEventListener('message',receive);
    return()=>window.removeEventListener('message',receive);
  },[]);
  useEffect(()=>{document.title=`${map.name} 지도 · VIRETH`;},[map.name]);
  return <div className="pilot-atlas-page">
    <div className="pilot-topline"><a href={atlasReturnHref()} className="pilot-return"><ArrowLeft size={18}/> 홈페이지로</a><span>VIRETH ATLAS</span><span className="pilot-edition">원본 지도 · 미리보기</span></div>
    <div className="pilot-heading"><div><p className="pilot-eyebrow">산맥 너머, 펼쳐지는 세계</p><h1 tabIndex={-1}>{map.name}</h1></div><div className="pilot-heading-actions"><button ref={resetButton} type="button" className="pilot-reset text-link" disabled={!ready} onClick={()=>setConfirmReset(true)} title={`${entry.name}의 저장된 탐색 위치를 초기화하고 첫 지도를 기본 배율로 엽니다.`}>{entry.name} 처음부터<ArrowCounterClockwise size={16}/></button>{intro&&<a className="pilot-intro-link text-link" href={intro.href}>{intro.label}<ArrowRight size={16}/></a>}</div></div>
    {confirmReset&&<AtlasResetDialog name={entry.name} openerRef={resetButton} onCancel={()=>setConfirmReset(false)} onConfirm={resetExploration}/>}
    {!ready&&<p className="pilot-frame-loading" role="status">원본 지도와 탐색 경계를 불러오고 있어요…</p>}
    <iframe key={resetVersion} ref={frame} className="pilot-original-frame" title="비레스 원본 지도 탐색" src={`${import.meta.env.BASE_URL}atlas-engine/index.html${resetVersion?'?reset=1':''}#${encodeURIComponent(entryMap)}`} style={{height}}/>
    <p className="pilot-note">완성된 지도 원본의 경계·강조·하위 연결을 그대로 사용해요. 표시 영역은 실제 영토나 이동 거리의 확정값이 아니에요.</p>
  </div>;
}
