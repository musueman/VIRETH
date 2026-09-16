// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {SiteHeader} from './SiteHeader.jsx';

afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();window.history.replaceState(null,'','#welcome');});
it('offers the chatbot entry in a safe new tab with an accessible name', () => {
  render(<SiteHeader home onSearch={()=>{}}/>);
  const entry=screen.getByRole('link',{name:'루나톡에서 비레스 만나기 (새 탭)'});
  expect(entry.getAttribute('href')).toBe('https://lunatalk.chat/character/detail/70170');
  expect(entry.getAttribute('target')).toBe('_blank');
  expect(entry.getAttribute('rel')).toContain('noopener');
  expect(entry.querySelector('img').alt).toBe('');
});

it('opens the full travel directory and restores scrolling and focus after Escape',()=>{
  vi.useFakeTimers();
  const background=document.createElement('div');background.id='root';document.body.append(background);
  const previous=document.documentElement.style.overflow;
  render(<SiteHeader home onSearch={()=>{}}/>);
  const toggle=screen.getByRole('button',{name:'메뉴 열기'});
  fireEvent.click(toggle);
  const menu=screen.getByRole('dialog',{name:'비레스의 모든 길'});
  expect(within(menu).getByRole('link',{name:/나라와 장소/}).getAttribute('href')).toBe('#/regions');
  expect(within(menu).getByRole('link',{name:/첫 장면 고르기/}).getAttribute('href')).toBe('#/start');
  expect(menu.querySelectorAll('a[href^="#/guide/"]')).toHaveLength(6);
  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(background.inert).toBe(true);
  fireEvent.keyDown(document,{key:'Escape'});
  act(()=>vi.advanceTimersByTime(500));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.documentElement.style.overflow).toBe(previous);
  expect(background.inert).toBeFalsy();
  expect(document.activeElement).toBe(toggle);
  background.remove();
});

it('keeps keyboard focus inside the menu and its persistent close toggle',()=>{
  render(<SiteHeader home onSearch={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'메뉴 열기'}));
  const menu=screen.getByRole('dialog',{name:'비레스의 모든 길'});
  const last=within(menu).getByRole('link',{name:'처음으로'});
  last.focus();fireEvent.keyDown(document,{key:'Tab'});
  expect(document.activeElement).toBe(screen.getByRole('button',{name:'메뉴 닫기'}));
  fireEvent.keyDown(document,{key:'Tab',shiftKey:true});
  expect(document.activeElement).toBe(last);
});

it('hands search off after the menu has released its background lock',()=>{
  vi.useFakeTimers();let overflowAtSearch;
  render(<SiteHeader home onSearch={()=>{overflowAtSearch=document.documentElement.style.overflow;}}/>);
  fireEvent.click(screen.getByRole('button',{name:'메뉴 열기'}));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'메뉴에서 검색하기'}));
  act(()=>vi.advanceTimersByTime(500));
  expect(screen.queryByRole('dialog')).toBeNull();
  act(()=>vi.runOnlyPendingTimers());
  expect(overflowAtSearch).not.toBe('hidden');
});

it('closes on route changes and cancels a stale exit when reopened quickly',()=>{
  vi.useFakeTimers();render(<SiteHeader home onSearch={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'메뉴 열기'}));
  fireEvent.click(screen.getByRole('button',{name:'메뉴 닫기'}));
  fireEvent.click(screen.getByRole('button',{name:'메뉴 열기'}));
  act(()=>vi.advanceTimersByTime(500));
  expect(screen.getByRole('dialog')).not.toBeNull();
  act(()=>window.dispatchEvent(new HashChangeEvent('hashchange')));
  act(()=>vi.advanceTimersByTime(500));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('does not leave background controls locked when the header unmounts',()=>{
  const previous=document.documentElement.style.overflow;
  const {unmount}=render(<SiteHeader home onSearch={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'메뉴 열기'}));
  expect(document.documentElement.style.overflow).toBe('hidden');
  unmount();expect(document.documentElement.style.overflow).toBe(previous);
});

it('closes immediately when reduced motion is requested',()=>{
  vi.stubGlobal('matchMedia',query=>({media:query,matches:query.includes('reduced-motion'),onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return true;}}));
  render(<SiteHeader home onSearch={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'메뉴 열기'}));
  fireEvent.keyDown(document,{key:'Escape'});
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.documentElement.style.overflow).not.toBe('hidden');
});

it('finishes the exit before following an internal menu destination',()=>{
  vi.useFakeTimers();render(<SiteHeader home onSearch={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'메뉴 열기'}));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('link',{name:/나라와 장소/}));
  expect(window.location.hash).not.toBe('#/regions');
  act(()=>vi.advanceTimersByTime(500));
  expect(window.location.hash).toBe('#/regions');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.documentElement.style.overflow).not.toBe('hidden');
});
