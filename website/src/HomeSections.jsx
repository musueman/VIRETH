import React from 'react';
import {CaretRight} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';
import {content,Eyebrow,Link,Picture} from './HubShared.jsx';
import {PeopleFeature} from './PeopleFeature.jsx';
import {ArchiveAtmosphere} from './ArchiveAtmosphere.jsx';
import {JourneyGallery} from './JourneyGallery.jsx';
import journeyScenes from './journey-scenes.json';
import {StoryRibbon} from './StoryRibbon.jsx';
export function HomeSections(){
  return <>
    <section className="archive-section hub-section" id="stories" aria-labelledby="archive-title">
      <ArchiveAtmosphere/>
      <div className="archive-left"><div className="archive-heading"><Eyebrow reveal delay={40}>이야기서고</Eyebrow><Reveal as="h2" id="archive-title" delay={120}>이곳에 남겨진<br/>이야기</Reveal><Reveal as="p" delay={220}>편지 한 통, 장부 한 장에도<br/>누군가의 하루가 담겨 있어요.</Reveal></div><StoryRibbon stories={content.stories}/></div>
      <div className="archive-selection">{['ini-com-02','ini-com-05','ini-com-06'].map((id,index)=>{const s=content.stories.find(s=>s.id===id);return <Reveal key={id} as="a" href={`#/story/${id}`} className="archive-story" delay={index*90}><span className="story-number">0{index+1}</span><div><p>{s.form} · {s.minutes}분</p><h3>{s.title}</h3><span>한 편 펼쳐보기 <CaretRight size={16}/></span></div></Reveal>;})}<Reveal delay={280}><Link href="#/stories">모든 이야기 만나보기</Link></Reveal></div>
    </section>
    <PeopleFeature/>
    <section className="journey-section hub-section" id="journey" aria-labelledby="journey-title"><Picture className="section-backdrop" src="/assets/expansion/journey-background.webp" alt=""/><div className="journey-copy"><Eyebrow reveal delay={40}>이야기의 다음 장</Eyebrow><Reveal as="h2" id="journey-title" delay={120}>이제, 당신의 이야기도<br/>시작해 보세요</Reveal><Reveal as="p" delay={220}>성문 앞에서, 장터에서, 새벽의 항구에서.<br/>마음이 가는 첫 장면을 골라보세요.</Reveal><Reveal as="a" className="button-secondary" href="#/start" delay={320}>첫 장면 고르기<CaretRight size={18}/></Reveal></div><JourneyGallery scenes={journeyScenes}/></section>
  </>;
}
