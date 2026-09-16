import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {MagnifyingGlass,X,ArrowRight} from '@phosphor-icons/react';
import {content} from './HubShared.jsx';
const entries=[
  ...content.regions.map(x=>({title:x.name,text:x.copy,kind:'나라와 권역',href:`#/region/${x.id}`})),
  ...content.places.map(x=>({title:x.name,text:`${x.region} · ${x.summary}`,kind:'장소',href:`#/place/${x.id}`})),
  ...content.people.map(x=>({title:x.name,text:`${x.region} · ${x.place} · ${x.role}`,kind:'인물',href:`#/person/${x.id}`})),
  ...content.stories.map(x=>({title:x.title,text:x.form,kind:'이야기',href:`#/story/${x.id}`})),
  ...content.guide.map(x=>({title:x.title,text:x.blocks.map(b=>b.text).join(' '),kind:'세계 안내',href:`#/guide/${x.id}`})),
];
export function SearchDialog({onClose}){
  const[query,setQuery]=useState('');const[kind,setKind]=useState('전체');const ref=useRef(null);
  const results=entries.filter(x=>(kind==='전체'||x.kind===kind)&&`${x.title} ${x.text}`.replace(/\s/g,'').toLowerCase().includes(query.replace(/\s/g,'').toLowerCase()));
  useEffect(()=>{const opener=document.activeElement;const old=document.body.style.overflow;document.body.style.overflow='hidden';ref.current.querySelector('input').focus();const key=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const nodes=[...ref.current.querySelectorAll('input,button,a')];const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);opener?.focus();};},[onClose]);
  const displayed=query||kind!=='전체'?results:results.filter(x=>['티리스','베켈 오르민','같은 땅, 두 이름','비레스에 첫발을 들이면'].includes(x.title));
  return createPortal(<div className="search-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section ref={ref} className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <button className="notice-close" aria-label="안내 닫기" onClick={onClose}><X size={24}/></button><p className="hub-eyebrow">비레스에서 찾기</p><h2 id="search-title">궁금한 이름이 있나요?</h2>
      <label className="search-field"><MagnifyingGlass size={22}/><input aria-label="궁금한 이름" placeholder="사람, 나라, 도시, 이야기의 이름을 적어보세요" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <div className="filter-tabs" aria-label="검색 종류">{['전체','나라와 권역','장소','인물','이야기','세계 안내'].map(k=><button key={k} aria-pressed={kind===k} onClick={()=>setKind(k)}>{k}</button>)}</div>
      <p className="result-count" aria-live="polite">{query||kind!=='전체'?`${results.length}곳에서 찾았어요.`:'처음이라면, 이런 곳부터 만나보세요.'}</p>
      <div className="search-results">{displayed.map(r=><a key={r.href} href={r.href} onClick={onClose}><span className="hub-eyebrow">{r.kind}</span><strong>{r.title}</strong><p>{r.text.slice(0,95)}{r.text.length>95?'…':''}</p><ArrowRight size={20}/></a>)}{query&&!results.length&&<p>아직 그 이름을 찾지 못했어요. 이름을 짧게 적어보세요.</p>}</div>
    </section></div>,document.body);
}
