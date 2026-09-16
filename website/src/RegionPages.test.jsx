// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {RegionPage,RegionsPage,PlacePage} from './RegionPages.jsx';
import {content} from './HubShared.jsx';

afterEach(()=>{cleanup();vi.restoreAllMocks();});

it('uses each place own panorama rather than its region capital for the header',()=>{
  for(const id of ['place-f76dcd1e8ca3a223','place-d3fcde024aeebb50','place-c91992123771823b']){
    const p=content.places.find(x=>x.id===id);
    render(<PlacePage place={p}/>);
    const hero=screen.getByRole('region',{name:`${p.name} 소개`});
    const art=within(hero).getByAltText(`${p.name} 전경`);
    expect(art.getAttribute('src')).toBe(`/assets/places/${id}.webp`);
    expect(screen.getByRole('heading',{level:1}).textContent).toBe(p.name);
    expect(screen.getByRole('img',{name:'확정 지형 위의 지역과 장소 위치'})).not.toBeNull();
    cleanup();
  }
});

it('keeps each approved crest paired with its country after filtering',()=>{
  render(<RegionsPage/>);
  const crest=screen.getByAltText('레오니아 문장');
  expect(crest.getAttribute('src')).toBe('/assets/explore/crests/leonia.png');
  expect(crest.closest('a').getAttribute('href')).toBe('#/region/leonia');
  fireEvent.change(screen.getByRole('textbox',{name:'나라와 권역 찾기'}),{target:{value:'티리스'}});
  expect(screen.queryByAltText('레오니아 문장')).toBeNull();
  expect(screen.getByAltText('티리스 문장').getAttribute('src')).toBe('/assets/explore/crests/tiris.png');
});

it('moves the map action to the current country map without leaving its route',()=>{
  const {container}=render(<RegionPage region={content.regions.find(r=>r.id==='leonia')}/>);
  const action=screen.getByRole('button',{name:'지도에서 위치 보기'});
  const map=container.querySelector(`#${action.getAttribute('aria-controls')}`);
  expect(map).not.toBeNull();
  map.scrollIntoView=vi.fn();
  fireEvent.click(action);
  expect(document.activeElement).toBe(map);
  expect(within(map).getByRole('img',{name:'확정 지형 위의 지역과 장소 위치'})).not.toBeNull();
});

it('keeps every place reachable after the two introductory destinations',()=>{
  const {container}=render(<RegionPage region={content.regions.find(r=>r.id==='leonia')}/>);
  const highlights=screen.getByRole('navigation',{name:'먼저 만나는 도시와 마을'});
  expect(within(highlights).getAllByRole('link')).toHaveLength(2);
  expect(within(highlights).getByRole('link',{name:/라드아르할/}).getAttribute('href')).toBe('#/place/place-f76dcd1e8ca3a223');
  expect(within(highlights).getByRole('link',{name:/지르바르에트/}).getAttribute('href')).toBe('#/place/place-d3fcde024aeebb50');
  expect(container.querySelectorAll('.place-directory > a')).toHaveLength(8);
  expect(screen.getByRole('link',{name:/렘켈가.*자세히/}).getAttribute('href')).toBe('#/place/place-9cde411459ec9d58');
});

it('does not invent capital art or sovereign borders for an outlying region',()=>{
  render(<RegionPage region={content.regions.find(r=>r.id==='dragonspire')}/>);
  const highlights=screen.getByRole('navigation',{name:'먼저 만나는 도시와 마을'});
  expect(within(highlights).queryByAltText(/지르바르에트/)).toBeNull();
  const map=screen.getByRole('img',{name:'확정 지형 위의 지역과 장소 위치'});
  expect(map.querySelectorAll('path')).toHaveLength(0);
});
