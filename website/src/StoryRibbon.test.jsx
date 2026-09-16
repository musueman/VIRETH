// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {StoryRibbon} from './StoryRibbon.jsx';
const stories=[{id:'one',title:'첫 이야기',illustrations:[{asset:'/one.webp',alt:'첫 삽화'},{asset:'/two.webp',alt:'둘째 삽화'}]},{id:'two',title:'다른 이야기',illustrations:[{asset:'/three.webp',alt:'셋째 삽화'}]}];
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('resumes after pointer focus and leaving without requiring a blur',()=>{
 render(<StoryRibbon stories={stories}/>);const region=screen.getByRole('region');const link=screen.getAllByRole('link')[0];
 fireEvent.mouseEnter(region);fireEvent.pointerDown(link);fireEvent.focus(link);fireEvent.pointerUp(link);fireEvent.mouseLeave(region);
 expect(region.dataset.running).toBe('true');
 fireEvent.keyDown(link,{key:'Tab'});fireEvent.focus(link);expect(region.dataset.running).toBe('false');
});
it('blocks native image dragging and a drag-release click but allows the next ordinary click',()=>{
 render(<StoryRibbon stories={stories}/>);const link=screen.getAllByRole('link')[0];
 expect(fireEvent.dragStart(link.querySelector('img'))).toBe(false);
 fireEvent.pointerDown(link,{clientX:100,clientY:100});fireEvent.pointerMove(document,{clientX:140,clientY:100});fireEvent.pointerUp(document,{clientX:140,clientY:100});
 expect(fireEvent.click(link)).toBe(false);
 fireEvent.pointerDown(link,{clientX:100,clientY:100});fireEvent.pointerUp(link,{clientX:100,clientY:100});expect(fireEvent.click(link)).toBe(true);
});
it('recovers from pointer cancellation without clearing a manual pause',()=>{
 render(<StoryRibbon stories={stories}/>);const region=screen.getByRole('region');const link=screen.getAllByRole('link')[0];
 fireEvent.mouseEnter(region);fireEvent.pointerDown(link);fireEvent.focus(link);fireEvent.pointerCancel(document);fireEvent.mouseLeave(region);expect(region.dataset.running).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'삽화 흐름 멈추기'}));fireEvent.pointerDown(link);fireEvent.pointerCancel(document);expect(region.dataset.running).toBe('false');
});
it('links every illustration to its own story and hides loop duplicates from keyboard and accessibility',()=>{
 render(<StoryRibbon stories={stories}/>);
 const links=screen.getAllByRole('link');expect(links.map(a=>a.getAttribute('href'))).toEqual(['#/story/one','#/story/one','#/story/two']);
 expect(document.querySelectorAll('[data-copy="true"] a').length).toBe(3);
 document.querySelectorAll('[data-copy="true"] a').forEach(a=>expect(a.tabIndex).toBe(-1));
});
it('pauses on hover and focus, preserves explicit pause after leaving, and resumes on request',()=>{
 render(<StoryRibbon stories={stories}/>);const region=screen.getByRole('region',{name:'삽화로 만나는 이야기'});
 expect(region.dataset.running).toBe('true');fireEvent.mouseEnter(region);expect(region.dataset.running).toBe('false');fireEvent.mouseLeave(region);expect(region.dataset.running).toBe('true');
 fireEvent.focus(screen.getAllByRole('link')[0]);expect(region.dataset.running).toBe('false');fireEvent.blur(screen.getAllByRole('link')[0]);expect(region.dataset.running).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'삽화 흐름 멈추기'}));fireEvent.mouseLeave(region);expect(region.dataset.running).toBe('false');fireEvent.focus(screen.getByRole('button',{name:'삽화 흐름 재생하기'}));fireEvent.click(screen.getByRole('button',{name:'삽화 흐름 재생하기'}));expect(region.dataset.running).toBe('true');
});
it('pauses offscreen and in hidden tabs',()=>{
 const observed=[];vi.stubGlobal('IntersectionObserver',class{constructor(cb){this.cb=cb;}observe(el){observed.push({cb:this.cb,el});}disconnect(){}});
 render(<StoryRibbon stories={stories}/>);const region=screen.getByRole('region',{name:'삽화로 만나는 이야기'});
 expect(region.dataset.running).toBe('false');act(()=>observed.find(o=>o.el===region).cb([{isIntersecting:true}]));expect(region.dataset.running).toBe('true');
 vi.spyOn(document,'hidden','get').mockReturnValue(true);fireEvent(document,new Event('visibilitychange'));expect(region.dataset.running).toBe('false');
});
it('keeps story links available without automatic movement for reduced motion',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener(){},removeEventListener(){}}));render(<StoryRibbon stories={stories}/>);
 expect(screen.getByRole('region',{name:'삽화로 만나는 이야기'}).dataset.running).toBe('false');expect(screen.getAllByRole('link')).toHaveLength(3);expect(screen.getByRole('button').disabled).toBe(true);
});
