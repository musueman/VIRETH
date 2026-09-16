import React,{useEffect,useState} from 'react';
import {Reveal} from './Reveal.jsx';
import {content,Back,PageTitle,Picture,StoryLinks,Link} from './HubShared.jsx';
import './guide-background.css';
const guideBackgrounds={
  first:{src:'/assets/expansion/journey-background.webp',position:'68% center'},
  daily:{src:'/assets/journey-scenes/v1/14_inn-rumor.webp',position:'60% center'},
  places:{src:'/assets/journey-scenes/v1/19_mountain-route.webp',position:'62% center'},
  roads:{src:'/assets/journey-scenes/v2/16_ferry-crossing.webp',position:'60% center'},
  promises:{src:'/assets/journey-scenes/v2/06_contract-table.webp',position:'65% center'},
  history:{src:'/assets/expansion/archive-background.webp',position:'20% center'},
};
export function Reader({story:s}){
  const[size,setSize]=useState(19);const[progress,setProgress]=useState(0);
  useEffect(()=>{const update=()=>{const el=document.querySelector('.story-original');if(!el)return;const r=el.getBoundingClientRect();setProgress(Math.max(0,Math.min(100,(-r.top+160)/(r.height-window.innerHeight+240)*100)));};window.addEventListener('scroll',update,{passive:true});update();return()=>window.removeEventListener('scroll',update);},[]);
  const index=content.stories.indexOf(s);const related=content.stories.filter(x=>x.id!==s.id&&x.regionIds.some(id=>s.regionIds.includes(id))).slice(0,3);
  return <article className="hub-page reader-page"><div className="reading-progress" aria-hidden="true" style={{width:`${progress}%`}}/><Back href="#/stories">이야기서고로</Back><PageTitle eyebrow={`이야기서고 · ${s.minutes}분 정도`} title={s.title}>{s.form}</PageTitle><div className="reading-tools"><span>편한 크기로 읽어보세요</span><button aria-label="글자 작게" disabled={size<=17} onClick={()=>setSize(size-1)}>가−</button><button aria-label="글자 크게" disabled={size>=24} onClick={()=>setSize(size+1)}>가＋</button></div><Reveal className="reader-illustration"><Picture src={s.illustrations[0]?.asset} alt={s.illustrations[0]?.alt||''}/></Reveal><div className="reading-layout"><div><div className="story-original" style={{fontSize:size}} dangerouslySetInnerHTML={{__html:s.html}}/>{s.illustrations[1]&&<figure className="reader-end-art"><Picture src={s.illustrations[1].asset} alt={s.illustrations[1].alt}/><figcaption>{s.illustrations[1].alt}</figcaption></figure>}<Reveal className="reading-guide"><p className="hub-eyebrow">원문을 읽은 뒤에</p><h2>{s.guide.label}</h2><p>{s.guide.summary}</p></Reveal></div><aside className="reader-aside"><h2>낯선 말, 함께 알아봐요</h2>{s.references.map(r=><details key={r.term}><summary>{r.term}</summary><p>{r.explanation}</p></details>)}<Link href="#/guide/first">세계 이야기 더 읽기</Link></aside></div><nav className="reader-neighbors" aria-label="이전과 다음 이야기">{index>0?<Back href={`#/story/${content.stories[index-1].id}`}>{content.stories[index-1].title}</Back>:<Back href="#/stories">서고로 돌아가기</Back>}{index<content.stories.length-1&&<Link href={`#/story/${content.stories[index+1].id}`}>{content.stories[index+1].title}</Link>}</nav>{related.length>0&&<section className="page-section"><h2>이어서 읽어볼까요?</h2><StoryLinks ids={related.map(s=>s.id)}/></section>}</article>;
}
export function GuidePage({guide:g}){
  const index=content.guide.indexOf(g);
  const backdrop=guideBackgrounds[g.id];
  const sceneRegion=content.regions.find(r=>r.id===['leonia','tiris','linrenet','norghard','senhalet','tiris'][index]);
  return <div className="hub-page guide-page">{backdrop&&<div className="guide-fixed-background" aria-hidden="true" key={g.id}><Picture src={backdrop.src} alt="" loading="eager" fetchPriority="high" style={{objectPosition:backdrop.position}}/></div>}<Back href="#first-steps">첫 관문으로</Back><div className="guide-layout">
    <aside className="guide-toc"><p className="hub-eyebrow">처음 만나는 비레스</p><nav aria-label="세계 안내 목차">{content.guide.map((x,i)=><a key={x.id} href={`#/guide/${x.id}`} aria-current={x.id===g.id?'page':undefined}><span>0{i+1}</span>{x.eyebrow}</a>)}</nav><Link href="#/regions">나라와 장소 둘러보기</Link></aside>
    <article><PageTitle eyebrow={`첫 만남 ${index+1} / 6 · ${g.eyebrow}`} title={g.title}/><div className="guide-reading">{g.blocks.map((b,i)=><React.Fragment key={i}><Reveal as={b.type==='heading'?'h2':b.type==='list'?'ul':'p'}>{b.type==='list'?b.text.split('\n').map((s,j)=><li key={j}>{s.replace(/^- /,'')}</li>):b.text}</Reveal>{i===2&&<Reveal as="figure" className="guide-scene"><Picture src={`/assets/explore/capitals/${sceneRegion.id}.webp`} alt={`${sceneRegion.name}의 ${sceneRegion.capital} 풍경`}/><figcaption>잠깐, 풍경도 함께 만나보세요 · {sceneRegion.name}, {sceneRegion.capital}</figcaption></Reveal>}</React.Fragment>)}</div><Reveal className="guide-related"><h2>글 속에서 만나보세요</h2><StoryLinks ids={g.storyIds}/></Reveal><nav className="reader-neighbors" aria-label="안내 순서">{index>0&&<Back href={`#/guide/${content.guide[index-1].id}`}>이전 이야기</Back>}{index<5?<Link href={`#/guide/${content.guide[index+1].id}`}>다음 이야기 · {content.guide[index+1].eyebrow}</Link>:<Link href="#/stories">이제 서고에서 만나보세요</Link>}</nav></article>
  </div></div>;
}
