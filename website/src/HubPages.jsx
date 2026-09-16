import React,{useEffect,useState} from 'react';
import {Reveal} from './Reveal.jsx';
import {content,Back,PageTitle,Link,Picture,StoryLinks} from './HubShared.jsx';
import {PeoplePage,PersonPage,LibraryPage} from './CatalogPages.jsx';
import {Reader,GuidePage} from './Reader.jsx';
import {RegionsPage,RegionPage,PlacePage} from './RegionPages.jsx';
import './category-overview.css';
function StartsPage(){return <div className="hub-page"><PageTitle eyebrow="당신의 이야기가 시작되는 곳" title="첫 장면을 골라보세요">성문 앞에 선 여행자가 되어볼까요, 새벽 항구를 걸어볼까요?<br/>장면을 고르면 함께 읽을 기록을 안내해 드릴게요.</PageTitle><div className="starts-grid">{content.starts.map((s,i)=><Reveal as="a" className="start-tile" key={s.id} href={`#/start/${s.id}`} delay={i%2*80}><Picture src={s.image} alt={s.imageAlt}/><div><h2>{s.title}</h2><p>{s.problem}</p><span className="text-link">이 장면 만나보기 →</span></div></Reveal>)}</div></div>;}
function StartDetail({scene:s}){const[copied,setCopied]=useState(false);const[copyError,setCopyError]=useState(false);return <div className="hub-page start-detail"><Back href="#/start">다른 첫 장면 만나보기</Back><PageTitle eyebrow="이야기를 시작하기 전에" title={s.title}>{s.invitation}</PageTitle><Reveal className="scene-art"><Picture src={s.image} alt={s.imageAlt}/></Reveal><div className="start-reading"><h2>이 장면 속의 나는</h2><p>{s.role}</p><h2>눈앞에 놓인 일</h2><p>{s.problem}</p><h2>먼저 읽어두면 좋은 이야기</h2><StoryLinks ids={s.documentIds}/><div className="start-actions"><button className="button-secondary" onClick={async()=>{try{await navigator.clipboard.writeText(`${s.title}\n역할: ${s.role}\n첫 상황: ${s.problem}`);setCopied(true);setCopyError(false);}catch{setCopyError(true);}}}>{copied?'장면을 복사했어요':'이 장면 복사하기'}</button><a className="text-link" href="https://lunatalk.chat/character/detail/70170" target="_blank" rel="noopener noreferrer">루나톡 소개 페이지 ↗</a></div><p className="small-note">루나톡의 캐릭터 소개 페이지가 새 창으로 열려요. 이곳은 채팅 화면이 아니며, 이용하려면 로그인이 필요할 수 있어요.</p>{copyError&&<p role="status">복사가 허용되지 않았어요. 위의 역할과 첫 상황을 직접 선택해 복사해 주세요.</p>}{copied&&<p className="small-note" role="status">역할과 첫 상황을 함께 복사했어요.</p>}</div></div>;}
function InfoPage({materials}){return <div className="hub-page utility-page"><PageTitle eyebrow="비레스 공식 허브" title={materials?'자료를 읽는 길잡이':'편하게 둘러보세요'}>{materials?'설명과 이야기, 지도는 조금씩 다른 방식으로 읽으면 좋아요.':'모든 이름을 한 번에 외우실 필요는 없어요. 마음이 가는 곳부터 시작해 보세요.'}</PageTitle><div className="guide-reading">{materials?<><h2>설명과 원문은 나누어 놓았어요</h2><p>세계 안내는 비레스를 처음 만나는 분들을 위한 쉬운 설명이에요. 이야기서고의 본문은 기록 속 사람의 목소리를 그대로 담고, 풀이와 낯선 말 안내는 본문 바깥에 두었어요.</p><h2>지도의 땅과 나라의 힘</h2><p>땅이 넓다고 반드시 더 강한 나라는 아니에요. 항구와 길, 사람과 기술, 왕실과 주변 나라에 미치는 힘도 함께 살펴보세요. 나라로 묶이지 않는 권역은 국경선 대신 위치로 안내해요.</p><h2>그림을 보는 법</h2><p>나라 소개에는 수도나 대표 장소의 풍경을 함께 두었어요. 개별 장소의 그림이 아닌 경우에는 그림 아래에 구분해 안내합니다. 분위기를 위한 장식 그림은 실제 지도나 인물 정보와 구분해 사용해요.</p><h2>전해지는 이야기와 확인된 일</h2><p>편지에는 글쓴이의 생각이, 전승에는 오래 전해진 믿음이 담겨 있어요. 모든 문장을 세계 전체의 확정된 사실로 읽기보다는, 누가 어떤 자리에서 남긴 글인지도 함께 살펴보세요.</p></>:<><h2>처음이라면 여섯 번의 짧은 만남부터</h2><p>세계 안내는 일상에서 출발해 나라와 길, 약속과 오래된 이야기로 이어져요. 순서대로 읽어도, 궁금한 부분만 골라도 좋아요.</p><Link href="#/guide/first">처음 만나는 비레스</Link><h2>지도에서, 이름에서 출발해 보세요</h2><p>지도에서는 나라를 고르고 도시와 마을로 들어갈 수 있어요. 인물대백과에서는 이름, 하는 일, 나라와 종족으로 사람을 찾을 수 있답니다. 위쪽 검색은 일상에서 쓰는 장소 이름도 함께 찾아줘요.</p><Link href="#/regions">나라와 장소 둘러보기</Link><h2>읽기 편한 화면으로</h2><p>이야기 본문 위의 ‘가−’와 ‘가＋’로 글자 크기를 바꿀 수 있어요. 움직임이 부담스럽다면 기기의 ‘동작 줄이기’ 설정을 켜주세요. 검색창은 Esc 키로 닫을 수 있어요.</p></>}</div></div>;}
export function HubPages({route}){
  const[kind,id]=route.parts;let page,title='비레스';
  const find=(key)=>content[key].find(x=>x.id===id);
  if(kind==='people'){page=<PeoplePage/>;title='인물대백과';}
  if(kind==='stories'){page=<LibraryPage/>;title='이야기서고';}
  if(kind==='regions'){page=<RegionsPage/>;title='나라와 장소';}
  if(kind==='person'&&find('people')){page=<PersonPage person={find('people')}/>;title=find('people').name;}
  if(kind==='story'&&find('stories')){page=<Reader story={find('stories')}/>;title=find('stories').title;}
  if(kind==='guide'&&find('guide')){page=<GuidePage guide={find('guide')}/>;title=find('guide').title;}
  if(kind==='region'&&find('regions')){page=<RegionPage region={find('regions')}/>;title=find('regions').name;}
  if(kind==='place'&&find('places')){page=<PlacePage place={find('places')}/>;title=find('places').name;}
  if(kind==='start'&&!id){page=<StartsPage/>;title='첫 장면 고르기';}
  if(kind==='start'&&find('starts')){page=<StartDetail scene={find('starts')}/>;title=find('starts').title;}
  if(['about','materials'].includes(kind)){page=<InfoPage materials={kind==='materials'}/>;title=kind==='about'?'이용 안내':'자료 안내';}
  useEffect(()=>{document.title=`${title} · VIRETH`;},[title]);
  if(page&&!id&&['regions','stories','people','start'].includes(kind))return <div className="category-overview">{page}</div>;
  return page||<div className="hub-page not-found"><PageTitle eyebrow="잠깐, 이쪽으로 오세요" title="길을 조금 벗어났네요">찾는 페이지의 주소가 바뀌었거나, 아직 없는 이름일 수 있어요.</PageTitle><Link href="#welcome">처음으로 돌아가기</Link></div>;
}
