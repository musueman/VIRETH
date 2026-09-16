// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {Footer} from './HubShared.jsx';
beforeEach(()=>vi.useFakeTimers());
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
const sprite=who=>document.querySelector(`[data-companion="${who}"]`);
const load=()=>document.querySelectorAll('.footer-companion-preload').forEach(e=>fireEvent.load(e));
it('animates original sprites and connects walking to an idle action without changing footer links',()=>{
 render(<Footer/>);load();
 expect(sprite('duran')).not.toBeNull();expect(sprite('bobo')).not.toBeNull();
 const start=sprite('duran').style.backgroundPosition;
 act(()=>vi.advanceTimersByTime(300));expect(sprite('duran').style.backgroundPosition).not.toBe(start);
 act(()=>vi.advanceTimersByTime(3900));expect(sprite('bobo').dataset.clip).toBe('bobo-sniff');
 expect(screen.getByRole('link',{name:'자료 안내'}).getAttribute('href')).toBe('#/materials');
});
it('freezes motion while paused and resumes without resetting the pose',()=>{
 render(<Footer/>);load();act(()=>vi.advanceTimersByTime(700));
 fireEvent.click(screen.getByRole('button',{name:'캐릭터 움직임 멈추기'}));
 const frame=sprite('duran').style.backgroundPosition;
 act(()=>vi.advanceTimersByTime(2000));expect(sprite('duran').style.backgroundPosition).toBe(frame);
 fireEvent.click(screen.getByRole('button',{name:'캐릭터 움직임 재생하기'}));
 act(()=>vi.advanceTimersByTime(100));expect(sprite('duran').style.backgroundPosition).not.toBe(frame);
});
it('keeps a still pose for reduced motion',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener(){},removeEventListener(){}}));
 render(<Footer/>);load();expect(sprite('duran')).not.toBeNull();const frame=sprite('duran').style.backgroundPosition;
 act(()=>vi.advanceTimersByTime(6000));expect(sprite('duran').style.backgroundPosition).toBe(frame);
 expect(screen.queryByRole('button',{name:'캐릭터 움직임 멈추기'})).toBeNull();
});
it('stops frame changes outside the viewport and while the document is hidden',()=>{
 const observations=[];vi.stubGlobal('IntersectionObserver',class{constructor(cb){this.cb=cb;}observe(el){observations.push({el,cb:this.cb});}disconnect(){}});
 render(<Footer/>);load();expect(sprite('duran')).not.toBeNull();const frame=sprite('duran').style.backgroundPosition;
 act(()=>vi.advanceTimersByTime(500));expect(sprite('duran').style.backgroundPosition).toBe(frame);
 act(()=>observations.find(o=>o.el.classList.contains('footer-companions')).cb([{isIntersecting:true}]));
 act(()=>vi.advanceTimersByTime(100));expect(sprite('duran').style.backgroundPosition).not.toBe(frame);
 vi.spyOn(document,'hidden','get').mockReturnValue(true);fireEvent(document,new Event('visibilitychange'));
 const stopped=sprite('duran').style.backgroundPosition;act(()=>vi.advanceTimersByTime(500));expect(sprite('duran').style.backgroundPosition).toBe(stopped);
});
