// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App.jsx';

// JSDOM lacks AnimationEvent; advertise it before React chooses native vs
// WebKit-prefixed event names so these tests dispatch the real browser event.
vi.hoisted(() => { window.AnimationEvent ??= window.Event; });

// JSDOM has no media engine; interaction behavior is covered by the carousel tests.
beforeEach(()=>{vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });
describe('gateway preview behavior', () => {
  it('distinguishes territory size from influence in the guide and country cards', () => {
    render(<App />);
    expect(screen.getByText(/땅이 넓다고 꼭 더 강한 나라는 아니에요/)).not.toBeNull();
    expect(screen.getByText(/궁정과 기사들의 영지가 이어진 대국/)).not.toBeNull();
    fireEvent.click(screen.getByRole('button', {name: '노르가르드 살펴보기'}));
    expect(document.querySelector('.place-panel[data-active="true"]').textContent).toContain('해군과 항구');
    fireEvent.click(screen.getByRole('button', {name: '티리스 살펴보기'}));
    const text = document.querySelector('.place-panel[data-active="true"]').textContent;
    expect(text).toContain('중견 왕국');
    expect(text).toContain('땅은 넓지만 두 대국만큼 주변을 좌우하지는 않아요');
    expect(text).not.toContain('소국');
  });
  it('uses the v63 terrain and approved representative coordinates', () => {
    render(<App />);
    expect(document.querySelector('.atlas-preview img').getAttribute('src')).toBe('/assets/explore/v63/terrain.png');
    const dragon = screen.getByRole('button', {name:'드래곤스파이어 살펴보기'});
    expect(parseFloat(dragon.style.left)).toBeCloseTo(870 / 1280 * 100);
    expect(parseFloat(dragon.style.top)).toBeCloseTo(1533 / 1920 * 100);
    const syl = screen.getByRole('button', {name:'실바니아 살펴보기'});
    expect(parseFloat(syl.style.left)).toBeLessThan(35);
  });
  it('selects actual sovereign territory shapes without inventing nonstate borders', () => {
    render(<App />);
    const shapes=document.querySelectorAll('.atlas-preview .country-territory');
    expect(shapes).toHaveLength(15);
    expect(document.querySelector('.country-territory[data-country="dragonspire"]')).toBeNull();
    const north=screen.getByRole('button',{name:'노르가르드 영역 살펴보기'});
    fireEvent.mouseEnter(north);
    expect(screen.getByRole('heading',{name:'노르가르드'})).not.toBeNull();
    expect(north.getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(screen.getByRole('button',{name:'티리스 영역 살펴보기'}),{key:'Enter'});
    expect(screen.getByRole('heading',{name:'티리스'})).not.toBeNull();
    expect(screen.getByRole('button',{name:'티리스 살펴보기'}).getAttribute('aria-pressed')).toBe('true');
  });
  it('fades upward at the map top plus 56px and freezes its exit position until animation ends', () => {
    vi.stubGlobal('innerHeight',900);
    render(<App />);
    let mapTop=419;
    vi.spyOn(document.querySelector('.atlas-preview'),'getBoundingClientRect').mockImplementation(()=>({top:mapTop,bottom:mapTop+1000}));
    fireEvent.click(screen.getByRole('button',{name:'레오니아 살펴보기'}));
    const card=document.querySelector('.place-box[data-floating="true"]');
    vi.spyOn(card,'getBoundingClientRect').mockReturnValue({top:476,bottom:876,height:400});
    fireEvent.scroll(window);
    expect(card.dataset.exiting).toBe('false');
    mapTop=420;
    fireEvent.scroll(window);
    expect(card.dataset.exiting).toBe('true');
    expect(card.style.bottom).toBe('24px');
    mapTop=-500;
    fireEvent.scroll(window);
    expect(card.style.bottom).toBe('24px');
    fireEvent.animationEnd(card);
    expect(document.querySelector('.place-box[data-floating="true"]')).toBeNull();
  });
  it('cancels a pending exit when another country is deliberately selected', () => {
    vi.useFakeTimers(); render(<App />);
    fireEvent.click(screen.getByRole('button',{name:'레오니아 살펴보기'}));
    fireEvent.click(screen.getByRole('button',{name:'나라 소개 닫기'}));
    expect(document.querySelector('.place-box').dataset.exiting).toBe('true');
    fireEvent.click(screen.getByRole('button',{name:'노르가르드 살펴보기'}));
    act(()=>vi.advanceTimersByTime(500));
    expect(document.querySelector('.place-box[data-floating="true"]').dataset.exiting).toBe('false');
    expect(screen.getByRole('heading',{name:'노르가르드'})).not.toBeNull();
  });
  it('dismisses without movement when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener(){},removeEventListener(){}}));
    render(<App />);
    fireEvent.click(screen.getByRole('button',{name:'레오니아 살펴보기'}));
    fireEvent.click(screen.getByRole('button',{name:'나라 소개 닫기'}));
    expect(document.querySelector('.place-box[data-floating="true"]')).toBeNull();
  });
  it('floats above the viewport bottom until its bottom meets the map bottom minus 56px', () => {
    vi.stubGlobal('innerHeight',900);
    render(<App />);
    const atlas=document.querySelector('.atlas-preview');
    let mapBottom=1300;
    const bounds=vi.spyOn(atlas,'getBoundingClientRect').mockImplementation(()=>({bottom:mapBottom}));
    fireEvent.click(screen.getByRole('button',{name:'레오니아 살펴보기'}));
    expect(document.querySelector('.place-box').style.bottom).toBe('24px');
    mapBottom=800;
    fireEvent.scroll(window);
    expect(document.querySelector('.place-box').style.bottom).toBe('156px');
    mapBottom=600;
    fireEvent.scroll(window);
    expect(document.querySelector('.place-box').style.bottom).toBe('356px');
    mapBottom=1300;
    fireEvent.resize(window);
    expect(document.querySelector('.place-box').style.bottom).toBe('24px');
    bounds.mockRestore();
  });
  it('lifts the selected card out of section transforms and dismisses it without reopening', () => {
    render(<App />);
    const north = screen.getByRole('button', {name:'노르가르드 살펴보기'});
    fireEvent.click(north);
    const card = screen.getByRole('heading', {name:'노르가르드'}).closest('.place-box');
    expect(card.parentElement).toBe(document.body);
    expect(card.dataset.floating).toBe('true');
    fireEvent.click(screen.getByRole('button', {name:'나라 소개 닫기'}));
    fireEvent.animationEnd(card);
    expect(document.querySelector('.place-box[data-floating="true"]')).toBeNull();
    expect(document.activeElement).toBe(north);
  });
  it('ignores scroll-induced hover until the pointer actually moves, while allowing explicit selection', () => {
    render(<App />);
    const north = screen.getByRole('button', {name:'노르가르드 살펴보기'});
    const arts = screen.getByRole('button', {name:'린레네트 살펴보기'});
    fireEvent.mouseEnter(north, {clientX:800,clientY:300});
    fireEvent.mouseMove(window, {clientX:800,clientY:300});
    fireEvent.scroll(window);
    fireEvent.mouseEnter(arts, {clientX:800,clientY:300});
    fireEvent.mouseMove(arts, {clientX:800,clientY:300});
    expect(north.getAttribute('aria-pressed')).toBe('true');
    fireEvent.mouseMove(arts, {clientX:802,clientY:302});
    expect(arts.getAttribute('aria-pressed')).toBe('true');
    fireEvent.scroll(window);
    fireEvent.click(north);
    expect(north.getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(document, {key:'Escape'});
    fireEvent.animationEnd(document.querySelector('.place-box[data-floating="true"]'));
    expect(document.querySelector('.place-box[data-floating="true"]')).toBeNull();
  });
  it('removes the viewport card when the map section leaves the screen', () => {
    const observers=[];
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { this.callback=callback; observers.push(this); }
      observe(target) { this.target=target; }
      disconnect() {}
    });
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name:'레오니아 살펴보기'}));
    const observer=observers.find(o=>o.target===document.querySelector('#explore'));
    expect(observer).toBeDefined();
    act(()=>observer.callback([{isIntersecting:false}]));
    fireEvent.animationEnd(document.querySelector('.place-box[data-floating="true"]'));
    expect(document.querySelector('.place-box[data-floating="true"]')).toBeNull();
  });
  it('keeps the fixed navigation outside the hero stacking context', () => {
    render(<App />);
    expect(screen.getByRole('navigation', {name:'주 메뉴'}).closest('.gateway')).toBeNull();
  });
  it('changes country, capital and heraldry together on hover, focus and touch', async () => {
    const user = userEvent.setup(); render(<App />);
    const north = screen.getByRole('button', {name:'노르가르드 살펴보기'});
    fireEvent.mouseEnter(north);
    expect(north.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('heading', {name:'노르가르드'})).not.toBeNull();
    expect(screen.getByRole('img', {name:'노르가르드 문장'}).getAttribute('src')).toBe('/assets/explore/crests/norghard.png');
    expect(screen.getByRole('img', {name:'노르가르드의 수도 마르나브미르 전경'}).getAttribute('src')).toBe('/assets/explore/capitals/norghard.webp');
    const arts = screen.getByRole('button', {name:'린레네트 살펴보기'});
    fireEvent.focus(arts);
    expect(screen.getByRole('heading', {name:'린레네트'})).not.toBeNull();
    expect(screen.getByRole('img', {name:'린레네트의 중심도시 레눔가 전경'})).not.toBeNull();
    expect(north.getAttribute('aria-pressed')).toBe('false');
    await user.click(screen.getByRole('button', {name:'레오니아 살펴보기'}));
    expect(screen.getByRole('heading', {name:'레오니아'})).not.toBeNull();
    expect(screen.getByRole('img', {name:'레오니아 문장'}).getAttribute('src')).toBe('/assets/explore/crests/leonia.png');
  });
  it('offers all twenty canonical countries and regions with synchronized map selection', () => {
    render(<App />);
    const names = ['레오니아','노르가르드','티리스','린레네트','벡도레트','센할레트','헤스페레트','켈나베트','헤스베케트','옌메베트','님나레트','실니메트','아르도레트','가르메베트','실할레트','메르할레트','님소레트','실바니아','드래곤스파이어','펜리르의 눈'];
    const picker = screen.getByRole('combobox', {name:'나라와 권역 고르기'});
    expect(picker.querySelectorAll('option')).toHaveLength(20);
    for (const name of names) {
      const marker = screen.getByRole('button', {name:`${name} 살펴보기`});
      fireEvent.mouseEnter(marker);
      expect(screen.getByRole('heading', {name, exact:true})).not.toBeNull();
      expect(picker.value).toBe(marker.getAttribute('aria-controls').replace('place-', ''));
    }
    fireEvent.change(picker, {target:{value:'silnimet'}});
    expect(screen.getByRole('img', {name:'실니메트의 중심도시 도르소르산 전경'})).not.toBeNull();
    expect(screen.getByRole('button', {name:'실니메트 살펴보기'}).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('group', {name:'나라 밖으로 이어지는 권역'}).querySelectorAll('option')).toHaveLength(5);
  });
  it('opens the actual atlas from exploration and restores focus after closing', async () => {
    const user = userEvent.setup(); render(<App />);
    const trigger = screen.getByRole('button', {name:'큰 지도로 둘러보기'});
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('img').getAttribute('src')).toBe('/assets/explore/v63/terrain.png');
    expect(dialog.querySelectorAll('.country-territory')).toHaveLength(15);
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).not.toBe('hidden');
  });
  it('lets keyboard users focus the enlarged map and cycles focus inside its dialog', async () => {
    const user=userEvent.setup();render(<App />);
    await user.click(screen.getByRole('button',{name:'큰 지도로 둘러보기'}));
    await user.tab();
    expect(document.activeElement.classList.contains('atlas-scroll')).toBe(true);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button',{name:'안내 닫기'}));
    await user.tab({shift:true});
    expect(document.activeElement.classList.contains('atlas-scroll')).toBe(true);
  });
  it('uses the supplied header logo while retaining an accessible home link', () => {
    render(<App />);
    const home = screen.getByRole('link', {name:'비레스 처음으로'});
    expect(home.querySelector('img[alt="비레스"]')).not.toBeNull();
    expect(document.querySelector(home.getAttribute('href'))).not.toBeNull();
    expect(document.querySelector('.hero-copy .hero-wordmark').textContent).toBe('VIRETH');
  });
  it('keeps the supplied backdrop logo out of the reading order', () => {
    render(<App />);
    const logo = screen.getByAltText('비레스 배경 로고');
    expect(logo.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('img', {name:'비레스 배경 로고'})).toBeNull();
  });
  it('keeps the background guide decorative without hiding the introductory copy', () => {
    render(<App />);
    expect(screen.queryByRole('img', {name:'손을 펼쳐 비레스를 안내하는 듀란'})).toBeNull();
    expect(screen.getByRole('heading', {name:'처음이라면, 여기부터 만나보세요'})).not.toBeNull();
  });
  it('reveals the guide again whenever the character re-enters the viewport', () => {
    const observers = [];
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(target) { this.target = target; }
      disconnect() {}
    });
    render(<App />);
    const guide = screen.getByAltText('손을 펼쳐 비레스를 안내하는 듀란');
    const observer = observers.find(o => o.target === guide);
    expect(guide.dataset.reveal).toBe('pending');
    act(() => observer.callback([{target:guide,isIntersecting:true,intersectionRatio:1}]));
    expect(guide.dataset.reveal).toBe('visible');
    act(() => observer.callback([{target:guide,isIntersecting:false,intersectionRatio:0}]));
    expect(guide.dataset.reveal).toBe('pending');
    act(() => observer.callback([{target:guide,isIntersecting:true,intersectionRatio:1}]));
    expect(guide.dataset.reveal).toBe('visible');
  });
  it('shows the guide without motion when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({matches:true,addEventListener(){},removeEventListener(){}}));
    render(<App />);
    expect(screen.getByAltText('손을 펼쳐 비레스를 안내하는 듀란').dataset.reveal).toBe('static');
  });
  it('pauses the decorative fireflies outside the viewport and resumes them on return', () => {
    const observers = [];
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(target) { this.target = target; }
      disconnect() {}
    });
    render(<App />);
    const layer = document.querySelector('.fireflies');
    expect(layer).not.toBeNull();
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    const observer = observers.find(o => o.target === layer);
    act(() => observer.callback([{isIntersecting:false}]));
    expect(layer.dataset.active).toBe('false');
    act(() => observer.callback([{isIntersecting:true}]));
    expect(layer.dataset.active).toBe('true');
  });
  it('lets visitors turn off the decorative motion', async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', {name:'반딧불 끄기'}));
    expect(document.querySelector('.fireflies').dataset.active).toBe('false');
    expect(screen.getByRole('button', {name:'반딧불 켜기'})).not.toBeNull();
  });
  it('does not animate fireflies when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({matches:true,addEventListener(){},removeEventListener(){}}));
    render(<App />);
    expect(document.querySelector('.fireflies')?.dataset.active).toBe('false');
  });
  it('switches the fixed header to its light theme on scroll and restores it at the top', () => {
    vi.stubGlobal('scrollY', 0);
    render(<App />);
    const header = document.querySelector('.site-header');
    expect(header.getAttribute('data-scrolled')).toBe('false');
    act(() => { vi.stubGlobal('scrollY', 120); window.dispatchEvent(new Event('scroll')); });
    expect(header.getAttribute('data-scrolled')).toBe('true');
    act(() => { vi.stubGlobal('scrollY', 0); window.dispatchEvent(new Event('scroll')); });
    expect(header.getAttribute('data-scrolled')).toBe('false');
  });
  it('replays a reveal when its object leaves and re-enters the viewport', () => {
    const observers = [];
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(target) { this.target = target; }
      disconnect() {}
    });
    render(<App />);
    const heading = screen.getByRole('heading', {level:1});
    expect(heading.getAttribute('data-reveal')).toBe('pending');
    const observer = observers.find(o => o.target === heading);
    act(() => observer.callback([{target:heading,isIntersecting:true,intersectionRatio:1}]));
    expect(heading.getAttribute('data-reveal')).toBe('visible');
    act(() => observer.callback([{target:heading,isIntersecting:false,intersectionRatio:0}]));
    expect(heading.getAttribute('data-reveal')).toBe('pending');
    act(() => observer.callback([{target:heading,isIntersecting:true,intersectionRatio:1}]));
    expect(heading.getAttribute('data-reveal')).toBe('visible');
  });
  it('keeps content static when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({matches:true,addEventListener(){},removeEventListener(){}}));
    render(<App />);
    expect(screen.getByRole('heading', {level:1}).getAttribute('data-reveal')).toBe('static');
  });
  it('keeps content visible when IntersectionObserver is unavailable', () => {
    render(<App />);
    expect(screen.getByRole('heading', {level:1}).getAttribute('data-reveal')).toBe('static');
  });
  it('offers a real in-page destination for the primary invitation', () => {
    render(<App />);
    const primary = screen.getByRole('link', {name:'비레스 둘러보기', exact:true});
    expect(document.querySelector(primary.getAttribute('href'))).not.toBeNull();
    expect(screen.getByRole('heading', {level:1}).textContent).toBe('비레스에 오신 걸 환영해요');
  });
  it('lets a narrow-screen visitor open and close the menu', async () => {
    const user = userEvent.setup(); render(<App />);
    const toggle = screen.getByRole('button', {name:'메뉴 열기'});
    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await user.click(screen.getByRole('button', {name:'메뉴 닫기'}));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
  it('links the encyclopedia to its completed catalog', () => {
    render(<App />);
    expect(screen.getByRole('link', {name:'인물대백과 만나보기'}).getAttribute('href')).toBe('#/people');
  });
  it('dismisses the scope notice with Escape and restores focus', async () => {
    const user = userEvent.setup(); render(<App />);
    const trigger=screen.getByRole('button', {name:'검색 안내'});
    await user.click(trigger);
    expect(screen.getByRole('dialog').textContent).toContain('궁금한 이름이 있나요?');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
