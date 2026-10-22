// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {AtlasPilotPage,TirisMapPreview,CAPITAL_ID} from './AtlasPilot.jsx';
import {HubPages} from './HubPages.jsx';
afterEach(()=>{cleanup();window.location.hash='';});
it('resets the entry country rather than the current child, with a fresh frame and loading guard',()=>{
  render(<AtlasPilotPage mapId="tiris"/>);
  const frame=screen.getByTitle('비레스 원본 지도 탐색');
  const reset=screen.getByRole('button',{name:'티리스 처음부터'});
  expect(reset.disabled).toBe(true);
  fireEvent(window,new MessageEvent('message',{data:{type:'vireth-atlas-state',mapId:'silverkeep-civic'},origin:window.location.origin,source:frame.contentWindow}));
  expect(reset.disabled).toBe(false);
  fireEvent.click(reset);
  expect(screen.getByTitle('비레스 원본 지도 탐색')).toBe(frame);
  fireEvent.click(screen.getByRole('button',{name:'초기화하기'}));
  const fresh=screen.getByTitle('비레스 원본 지도 탐색');
  expect(fresh).not.toBe(frame);
  expect(fresh.getAttribute('src')).toBe('/atlas-engine/index.html?reset=1#tiris');
  expect(reset.disabled).toBe(true);
  expect(document.activeElement).toBe(screen.getByRole('heading',{level:1}));
  fireEvent(window,new MessageEvent('message',{data:{type:'vireth-atlas-state',mapId:'tiris'},origin:window.location.origin,source:fresh.contentWindow}));
  expect(screen.getByRole('heading',{level:1}).textContent).toBe('티리스');
  expect(reset.disabled).toBe(false);
});
it.each(['계속 둘러보기','확인창 닫기','Escape'])('dismisses with %s without remounting or resetting the current map',dismiss=>{
  render(<AtlasPilotPage mapId="tiris"/>);
  const frame=screen.getByTitle('비레스 원본 지도 탐색');
  fireEvent(window,new MessageEvent('message',{data:{type:'vireth-atlas-state',mapId:'silverkeep-civic'},origin:window.location.origin,source:frame.contentWindow}));
  const opener=screen.getByRole('button',{name:'티리스 처음부터'});
  opener.focus();fireEvent.click(opener);
  const dialog=screen.getByRole('dialog',{name:'티리스 지도를 처음부터 볼까요?'});
  expect(document.activeElement).toBe(within(dialog).getByRole('button',{name:'계속 둘러보기'}));
  if(dismiss==='Escape')fireEvent.keyDown(document,{key:'Escape'});
  else fireEvent.click(within(dialog).getByRole('button',{name:dismiss}));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByTitle('비레스 원본 지도 탐색')).toBe(frame);
  expect(frame.getAttribute('src')).toBe('/atlas-engine/index.html#tiris');
  expect(screen.getByRole('heading',{level:1}).textContent).toBe('실버킵 법정·신전 구획');
  expect(document.activeElement).toBe(opener);
});
it('opens the original engine rather than rebuilding map geometry in React',()=>{
  const {container}=render(<AtlasPilotPage mapId="world"/>);
  expect(screen.getByTitle('비레스 원본 지도 탐색').getAttribute('src')).toBe('/atlas-engine/index.html#world');
  expect(container.querySelector('.pilot-map-art')).toBeNull();
});
it('keeps original nested map routes reachable',()=>{
  for(const id of ['tiris','silverkeep','silverkeep-civic','exploration-e03']){
    render(<HubPages route={{parts:['atlas',id]}}/>);
    expect(screen.queryByText('길을 조금 벗어났네요')).toBeNull();
    expect(screen.getByTitle('비레스 원본 지도 탐색').getAttribute('src')).toBe(`/atlas-engine/index.html#${id}`);
    cleanup();
  }
});
it('keeps the specific map title on direct homepage route entry',()=>{
  render(<HubPages route={{parts:['atlas','tiris']}}/>);
  expect(document.title).toBe('티리스 지도 · VIRETH');
});
it('uses canonical place-to-detail-map correspondence in the Tiris entry',()=>{
  render(<TirisMapPreview/>);
  fireEvent.change(screen.getByRole('combobox'),{target:{value:'place-d6201cae71141b4c'}});
  expect(screen.getByRole('link',{name:'선택한 장소 지도 펼치기'}).getAttribute('href')).toBe('#/atlas/ravenstone');
  expect(screen.getByRole('link',{name:'티리스 지역도 펼치기'}).getAttribute('href')).toBe('#/atlas/tiris');
});
it('accepts navigation only from the mounted map and restores the matching introduction link',()=>{
  render(<AtlasPilotPage mapId="world"/>);
  const frame=screen.getByTitle('비레스 원본 지도 탐색');
  const data={type:'vireth-atlas-state',mapId:'silverkeep'};
  fireEvent(window,new MessageEvent('message',{data,origin:window.location.origin,source:window}));
  expect(screen.queryByRole('link',{name:'라드바르할 / 실버킵 소개 읽기'})).toBeNull();
  fireEvent(window,new MessageEvent('message',{data,origin:window.location.origin,source:frame.contentWindow}));
  expect(screen.getByRole('link',{name:'라드바르할 / 실버킵 소개 읽기'}).getAttribute('href')).toBe(`#/place/${CAPITAL_ID}`);
  expect(window.location.hash).not.toBe('#/atlas/silverkeep');
});
it('rejects forged origins and unknown map IDs',()=>{
  render(<AtlasPilotPage mapId="tiris"/>);
  const frame=screen.getByTitle('비레스 원본 지도 탐색');
  fireEvent(window,new MessageEvent('message',{data:{type:'vireth-atlas-state',mapId:'silverkeep'},origin:'https://invalid.example',source:frame.contentWindow}));
  expect(screen.getByRole('heading',{level:1}).textContent).toBe('티리스');
  fireEvent(window,new MessageEvent('message',{data:{type:'vireth-atlas-state',mapId:'not-real'},origin:window.location.origin,source:frame.contentWindow}));
  expect(screen.getByRole('heading',{level:1}).textContent).toBe('티리스');
});
it('keeps the legacy place entry stable when the original engine mirrors its route',()=>{
  window.location.hash='#/atlas/tiris?place=place-d6201cae71141b4c';
  render(<AtlasPilotPage mapId="tiris"/>);
  const frame=screen.getByTitle('비레스 원본 지도 탐색');
  expect(frame.getAttribute('src')).toBe('/atlas-engine/index.html#ravenstone');
  fireEvent(window,new MessageEvent('message',{data:{type:'vireth-atlas-state',mapId:'ravenstone',height:1100},origin:window.location.origin,source:frame.contentWindow}));
  expect(frame.getAttribute('src')).toBe('/atlas-engine/index.html#ravenstone');
});
