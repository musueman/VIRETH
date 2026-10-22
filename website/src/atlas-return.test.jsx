// @vitest-environment jsdom
import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {App} from './App.jsx';

// JSDOM has no layout or audio engine; keep the actual router and components.
const preventNativeNavigation=e=>e.preventDefault();
const tick=()=>act(()=>vi.advanceTimersByTime(32));
function route(hash){act(()=>{window.history.pushState(null,'',hash);window.dispatchEvent(new HashChangeEvent('hashchange'));});tick();}
function enterMap(y){
  vi.stubGlobal('scrollY',y);
  fireEvent.click(screen.getByRole('link',{name:'티리스 상세 지도 펼치기'}));
  route('#/atlas/tiris');
}
beforeEach(()=>{
  vi.useFakeTimers();sessionStorage.clear();window.history.replaceState(null,'','#welcome');
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  vi.stubGlobal('scrollTo',vi.fn());
  vi.stubGlobal('scrollY',0);
  vi.stubGlobal('matchMedia',q=>({matches:q==='(prefers-reduced-motion: reduce)',addEventListener(){},removeEventListener(){}}));
  HTMLElement.prototype.scrollIntoView=vi.fn();
});
afterEach(()=>{cleanup();document.removeEventListener('click',preventNativeNavigation);vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();sessionStorage.clear();window.history.replaceState(null,'','#welcome');});
function home(){render(<App/>);tick();document.addEventListener('click',preventNativeNavigation);fireEvent.change(screen.getByRole('combobox',{name:'나라와 권역 고르기'}),{target:{value:'tiris'}});}
it('returns to the original homepage hash instead of always jumping to explore',()=>{
  home();enterMap(2687);
  expect(screen.getByRole('link',{name:'홈페이지로'}).getAttribute('href')).toBe('#welcome');
});
it('restores country selection and exact scroll offset on the homepage return link',()=>{
  home();enterMap(2687);
  const href=screen.getByRole('link',{name:'홈페이지로'}).getAttribute('href');
  vi.stubGlobal('scrollY',0);window.scrollTo.mockClear();route(href);
  expect(screen.getByRole('combobox',{name:'나라와 권역 고르기'}).value).toBe('tiris');
  expect(screen.getByRole('button',{name:'티리스 살펴보기',exact:true}).getAttribute('aria-pressed')).toBe('true');
  expect(window.scrollTo).toHaveBeenLastCalledWith({top:2687,behavior:'instant'});
});
it('restores the same state on browser-history hash traversal, without hijacking another home anchor',()=>{
  home();enterMap(3142);vi.stubGlobal('scrollY',0);window.scrollTo.mockClear();
  route('#welcome');
  expect(window.scrollTo).toHaveBeenLastCalledWith({top:3142,behavior:'instant'});
  expect(screen.getByRole('combobox',{name:'나라와 권역 고르기'}).value).toBe('tiris');
  route('#/atlas/tiris');window.scrollTo.mockClear();route('#first-steps');
  expect(window.scrollTo).not.toHaveBeenCalledWith({top:3142,behavior:'instant'});
  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
});
it('replaces the previous trip with the latest selected country and scroll position',()=>{
  home();enterMap(2687);route('#welcome');
  fireEvent.change(screen.getByRole('combobox',{name:'나라와 권역 고르기'}),{target:{value:'leonia'}});
  vi.stubGlobal('scrollY',2825);
  fireEvent.click(screen.getByRole('link',{name:'레오니아 상세 지도 탐색'}));
  route('#/atlas/leonia');vi.stubGlobal('scrollY',0);window.scrollTo.mockClear();route('#welcome');
  expect(screen.getByRole('combobox',{name:'나라와 권역 고르기'}).value).toBe('leonia');
  expect(window.scrollTo).toHaveBeenLastCalledWith({top:2825,behavior:'instant'});
});
it('restores the latest trip when writes fail but an older stored trip remains readable',()=>{
  home();enterMap(1200);route('#welcome');
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('Full','QuotaExceededError');});
  enterMap(2900);window.scrollTo.mockClear();route('#welcome');
  expect(window.scrollTo).toHaveBeenLastCalledWith({top:2900,behavior:'instant'});
});
