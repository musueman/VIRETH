// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {JourneyGallery} from './JourneyGallery.jsx';
const scenes=[{id:'harbor',title:'항구의 동행',category:'만남',src:'/harbor.webp',alt:'밧줄을 당기는 두 여행자'},{id:'market',title:'장터의 소동',category:'사건',src:'/market.webp',alt:'사과를 줍는 상인과 여행자'},{id:'forest',title:'숲길의 흔적',category:'모험',src:'/forest.webp',alt:'발자국을 찾는 추적자'}];
beforeEach(()=>{vi.useFakeTimers();});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
function ready(){document.querySelectorAll('.journey-slide img').forEach(image=>fireEvent.load(image));}
const caption=()=>document.querySelector('.journey-caption strong')?.textContent;
it('resumes autoplay after a pointer-clicked next button loses hover but keeps focus',()=>{
 render(<JourneyGallery scenes={scenes}/>);ready();const gallery=screen.getByRole('region');const next=screen.getByRole('button',{name:'다음 장면'});
 fireEvent.mouseEnter(gallery);fireEvent.pointerDown(next);fireEvent.focus(next);fireEvent.pointerUp(next);fireEvent.click(next);ready();fireEvent.mouseLeave(gallery);
 expect(gallery.dataset.running).toBe('true');act(()=>vi.advanceTimersByTime(6000));expect(caption()).toBe('숲길의 흔적');
});
it('discards a canceled touch gesture instead of turning its stale end into a swipe',()=>{
 render(<JourneyGallery scenes={scenes}/>);ready();const gallery=screen.getByRole('region');
 fireEvent.touchStart(gallery,{touches:[{clientX:240,clientY:100}]});fireEvent.touchCancel(gallery);fireEvent.touchEnd(gallery,{changedTouches:[{clientX:100,clientY:100}]});expect(caption()).toBe('항구의 동행');
});
it('retains outgoing artwork throughout the full soft crossfade before cleanup',()=>{
 render(<JourneyGallery scenes={scenes}/>);ready();
 fireEvent.click(screen.getByRole('button',{name:'다음 장면'}));
 act(()=>vi.advanceTimersByTime(1500));
 expect(document.querySelector('[data-state="leaving"] img')?.getAttribute('src')).toBe('/harbor.webp');
 expect(document.querySelector('[data-state="active"] img')?.getAttribute('src')).toBe('/market.webp');
 act(()=>vi.advanceTimersByTime(200));
 expect(document.querySelector('[data-state="leaving"]')).toBeNull();
});
it('waits six seconds and crossfades only to a loaded image, then wraps',()=>{
 render(<JourneyGallery scenes={scenes}/>);ready();
 act(()=>vi.advanceTimersByTime(5999));expect(caption()).toBe('항구의 동행');
 act(()=>vi.advanceTimersByTime(1));expect(caption()).toBe('장터의 소동');
 expect(document.querySelectorAll('[data-state="leaving"]').length).toBe(1);
 act(()=>vi.advanceTimersByTime(1700));expect(document.querySelector('[data-state="leaving"]')).toBeNull();ready();
 act(()=>vi.advanceTimersByTime(4300));expect(caption()).toBe('숲길의 흔적');ready();
 act(()=>vi.advanceTimersByTime(6000));expect(caption()).toBe('항구의 동행');
});
it('keeps current art until the requested image loads, and retains it on a failed load',()=>{
 render(<JourneyGallery scenes={scenes}/>);fireEvent.load(document.querySelector('[data-state="active"] img'));
 fireEvent.click(screen.getByRole('button',{name:'다음 장면'}));expect(caption()).toBe('항구의 동행');
 fireEvent.error(document.querySelector('[data-state="waiting"] img'));
 expect(caption()).toBe('항구의 동행');expect(screen.getByRole('status').textContent).toContain('불러오지 못');
 fireEvent.click(screen.getByRole('button',{name:'이전 장면'}));ready();expect(caption()).toBe('숲길의 흔적');
});
it('supports pause, previous, next and keyboard navigation without a stale autoplay timer',()=>{
 render(<JourneyGallery scenes={scenes}/>);ready();
 fireEvent.click(screen.getByRole('button',{name:'장면 자동 재생 멈추기'}));act(()=>vi.advanceTimersByTime(9000));expect(caption()).toBe('항구의 동행');
 fireEvent.click(screen.getByRole('button',{name:'이전 장면'}));ready();expect(caption()).toBe('숲길의 흔적');
 fireEvent.keyDown(screen.getByRole('region',{name:'비레스에서 만날 장면들'}),{key:'ArrowRight'});ready();expect(caption()).toBe('항구의 동행');
});
it('does not autoplay offscreen, while focused, or in a hidden tab',()=>{
 const observations=[];vi.stubGlobal('IntersectionObserver',class{constructor(callback){this.callback=callback;}observe(element){observations.push({element,callback:this.callback});}disconnect(){}});
 render(<JourneyGallery scenes={scenes}/>);ready();
 act(()=>vi.advanceTimersByTime(7000));expect(caption()).toBe('항구의 동행');
 const own=observations.find(o=>o.element.classList.contains('journey-gallery'));act(()=>own.callback([{isIntersecting:true}]));
 fireEvent.focus(screen.getByRole('button',{name:'다음 장면'}));act(()=>vi.advanceTimersByTime(7000));expect(caption()).toBe('항구의 동행');
 fireEvent.blur(screen.getByRole('button',{name:'다음 장면'}));vi.spyOn(document,'hidden','get').mockReturnValue(true);fireEvent(document,new Event('visibilitychange'));
 act(()=>vi.advanceTimersByTime(7000));expect(caption()).toBe('항구의 동행');
});
it('reduced motion disables autoplay and the outgoing transition but not manual browsing',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener(){},removeEventListener(){}}));render(<JourneyGallery scenes={scenes}/>);ready();
 act(()=>vi.advanceTimersByTime(10000));expect(caption()).toBe('항구의 동행');fireEvent.click(screen.getByRole('button',{name:'다음 장면'}));expect(caption()).toBe('장터의 소동');expect(document.querySelector('[data-state="leaving"]')).toBeNull();
});
it('reports an image which failed during preloading instead of waiting forever when selected',()=>{
 render(<JourneyGallery scenes={scenes}/>);fireEvent.load(document.querySelector('[data-state="active"] img'));
 fireEvent.error(document.querySelector('[data-state="waiting"] img'));
 fireEvent.click(screen.getByRole('button',{name:'다음 장면'}));
 expect(caption()).toBe('항구의 동행');expect(screen.getByRole('status').textContent).toContain('불러오지 못');
});
it('pauses under the pointer and supports a horizontal swipe without consuming vertical scroll',()=>{
 render(<JourneyGallery scenes={scenes}/>);ready();const gallery=screen.getByRole('region',{name:'비레스에서 만날 장면들'});
 fireEvent.mouseEnter(gallery);act(()=>vi.advanceTimersByTime(7000));expect(caption()).toBe('항구의 동행');
 fireEvent.touchStart(gallery,{touches:[{clientX:200,clientY:100}]});fireEvent.touchEnd(gallery,{changedTouches:[{clientX:180,clientY:210}]});expect(caption()).toBe('항구의 동행');
 fireEvent.touchStart(gallery,{touches:[{clientX:240,clientY:100}]});fireEvent.touchEnd(gallery,{changedTouches:[{clientX:120,clientY:104}]});expect(caption()).toBe('장터의 소동');
});
