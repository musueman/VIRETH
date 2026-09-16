import React,{useState} from 'react';
import {ArrowRight,ArrowLeft,Diamond} from '@phosphor-icons/react';
import {Reveal} from './Reveal.jsx';
export {Footer} from './Footer.jsx';
import content from './content.json';
import {returnToList} from './Router.jsx';
export {content};
export function Link({href,children,className=''}){return <Reveal as="a" className={`text-link ${className}`} href={href}>{children}<ArrowRight size={20}/></Reveal>;}
export function Back({href,children}){return <Reveal as="a" className="back-link" href={returnToList(href)}><ArrowLeft size={18}/>{children}</Reveal>;}
export function Eyebrow({children,reveal=false,delay=0}){const label=<><Diamond size={12} weight="duotone"/>{children}</>;return reveal?<Reveal as="p" className="hub-eyebrow" delay={delay}>{label}</Reveal>:<p className="hub-eyebrow">{label}</p>;}
export function PageTitle({eyebrow,title,children}){return <div className="page-title"><Eyebrow reveal delay={40}>{eyebrow}</Eyebrow><Reveal as="h1" tabIndex={-1} delay={120}>{title}</Reveal>{children&&<Reveal as="p" className="page-intro" delay={220}>{children}</Reveal>}</div>;}
export function Picture({src,alt,className='',...props}){const[failed,setFailed]=useState(false);return failed?<Reveal className={`image-fallback ${className}`} role="img" aria-label={alt}>그림을 잠시 불러오지 못했어요.</Reveal>:<Reveal as="img" src={src} alt={alt} className={className} loading="lazy" decoding="async" onError={()=>setFailed(true)} {...props}/>;}
export function StoryLinks({ids}){return <div className="story-links">{ids.map(id=>{const s=content.stories.find(s=>s.id===id);return s&&<Link key={id} href={`#/story/${id}`}>{s.title}</Link>;})}</div>;}
export function Empty({reset}){return <div className="empty-state"><h2>아직 그 이름을 찾지 못했어요.</h2><p>이름을 짧게 적거나, 고른 조건을 조금 덜어보세요.</p><button className="text-link" onClick={reset}>조건 지우기<ArrowRight size={18}/></button></div>;}
export function RegionSelect({value,onChange}){return <label>나라와 권역<select value={value} onChange={e=>onChange(e.target.value)}><option value="">모든 곳</option>{content.regions.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>;}
