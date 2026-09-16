import React from 'react';
import { FlagPennant } from '@phosphor-icons/react';
import geography from './geography-v63.json';
import places from './countries.json';

// Country imagery/copy is independent of geography. Never use the legacy x/y
// in countries.json: every displayed anchor comes from the approved v63 ledger.
export function Atlas({ selected, onSelect, onHover, onMove }) {
  const interactive=Boolean(onSelect);
  const events=id=>interactive ? {
    onMouseEnter:event=>onHover(id,event),
    onMouseMove:event=>onMove(id,event),
    onFocus:event=>onSelect(id,event),
    onClick:event=>onSelect(id,event),
  } : {};
  return <div className={`atlas-art${interactive ? '' : ' atlas-readonly'}`} data-map-version={geography.version}>
    <img src={geography.terrain} width="3200" height="4800" alt="비레스의 나라와 권역을 살펴보는 지도" decoding="async" />
    <svg className="territory-layer" viewBox={`0 0 ${geography.width} ${geography.height}`} role="group" aria-label="비레스 국가 영역" preserveAspectRatio="xMidYMid meet">
      {geography.countries.map(country=><path key={country.id} className="country-territory" data-country={country.id}
        d={country.path} fillRule="evenodd" vectorEffect="non-scaling-stroke"
        data-active={selected===country.id} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `${country.name} 영역 살펴보기` : undefined} aria-pressed={interactive ? selected===country.id : undefined}
        aria-controls={interactive ? `place-${country.id}` : undefined} {...events(country.id)}
        onKeyDown={interactive ? event=>{if(event.key==='Enter' || event.key===' '){event.preventDefault();onSelect(country.id,event);}} : undefined}>
        <title>{country.name}</title>
      </path>)}
    </svg>
    <div className="map-locations" role="group" aria-label={interactive ? '지도에서 나라 고르기' : '나라와 권역의 이름'}>
      {places.map(place=>{
        const [x,y]=geography.centers.find(center=>center.id===place.id).at;
        const style={left:`${x/geography.width*100}%`,top:`${y/geography.height*100}%`};
        return interactive ? <button key={place.id} className="map-location" data-label-side={x>900 ? 'left' : 'right'} style={style}
          aria-label={`${place.name} 살펴보기`} aria-pressed={selected===place.id} aria-controls={`place-${place.id}`} {...events(place.id)}>
          <FlagPennant size={26} weight="fill" /><span>{place.name}</span>
        </button> : <div key={place.id} className="atlas-name" style={style} data-label-side={x>900 ? 'left' : 'right'} data-label-level={place.id==='linrenet' ? 'below' : 'above'}><i aria-hidden="true" /><span>{place.name}</span></div>;
      })}
    </div>
  </div>;
}
