// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {HomeSections} from './HomeSections.jsx';
import {Reveal} from './Reveal.jsx';

let observers;
beforeEach(()=>{
  observers=[];
  vi.stubGlobal('IntersectionObserver',class{
    constructor(callback){this.callback=callback;}
    observe(target){observers.push({target,callback:this.callback});}
    disconnect(){}
  });
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});

it('reveals journey artwork and each copy object independently on every entry',()=>{
  render(<HomeSections/>);
  const elements=[...document.querySelectorAll('.journey-copy > *, .journey-section > .section-backdrop')];
  expect(elements.length).toBe(5);
  for(const element of elements){
    expect(element.dataset.reveal).toBe('pending');
    const observer=observers.find(o=>o.target===element);
    act(()=>observer.callback([{target:element,isIntersecting:true}]));
    expect(element.dataset.reveal).toBe('visible');
    act(()=>observer.callback([{target:element,isIntersecting:false}]));
    expect(element.dataset.reveal).toBe('pending');
    act(()=>observer.callback([{target:element,isIntersecting:true}]));
    expect(element.dataset.reveal).toBe('visible');
  }
});
it('covers archive artwork and person description that previously lacked entrance effects',()=>{
  render(<HomeSections/>);
  for(const selector of ['.archive-art-plane','.person-profile-band','.people-video','#archive-title','#people-title']){
    expect(document.querySelector(selector).dataset.reveal).toBe('pending');
  }
});
it('preserves the entrance delay when the artwork supplies geometry styles',()=>{
  const {container}=render(<Reveal delay={160} style={{width:250}}>Art</Reveal>);
  expect(container.firstChild.style.getPropertyValue('--reveal-delay')).toBe('160ms');
  expect(container.firstChild.style.width).toBe('250px');
});
it('does not double the movement of artwork inside an already animated card',()=>{
  const {container}=render(<Reveal><Reveal as="img" alt="card art" src="/art.png"/></Reveal>);
  expect(container.firstChild.dataset.reveal).toBe('pending');
  expect(container.querySelector('img').dataset.reveal).toBe('static');
});
it('keeps every journey object readable with reduced motion',()=>{
  vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener(){},removeEventListener(){}}));
  render(<HomeSections/>);
  for(const element of document.querySelectorAll('.journey-copy > *, .journey-section > .section-backdrop'))expect(element.dataset.reveal).toBe('static');
});
it('releases entrance styling when its own entrance completes and replays after leaving',()=>{
  const {container}=render(<Reveal as="a" href="#next"><span>Next</span></Reveal>);
  const element=container.firstChild,observer=observers.find(o=>o.target===element);
  act(()=>observer.callback([{isIntersecting:true}]));
  const ended=()=>Object.assign(new Event('animationend',{bubbles:true}),{animationName:'reveal-enter'});
  fireEvent(element.firstChild,ended());
  expect(element.dataset.reveal).toBe('visible');
  fireEvent(element,ended());
  expect(element.dataset.reveal).toBe('settled');
  act(()=>observer.callback([{isIntersecting:true}]));
  expect(element.dataset.reveal).toBe('settled');
  act(()=>observer.callback([{isIntersecting:false}]));
  expect(element.dataset.reveal).toBe('pending');
  act(()=>observer.callback([{isIntersecting:true}]));
  expect(element.dataset.reveal).toBe('visible');
});
it('uses a completion fallback and cancels stale completions after leaving',()=>{
  vi.useFakeTimers();
  const {container}=render(<Reveal delay={320}>Next</Reveal>);
  const element=container.firstChild,observer=observers.find(o=>o.target===element);
  act(()=>observer.callback([{isIntersecting:true}]));
  act(()=>vi.advanceTimersByTime(1100));
  expect(element.dataset.reveal).toBe('settled');
  act(()=>observer.callback([{isIntersecting:false}]));
  act(()=>observer.callback([{isIntersecting:true}]));
  act(()=>vi.advanceTimersByTime(100));
  act(()=>observer.callback([{isIntersecting:false}]));
  act(()=>vi.advanceTimersByTime(2000));
  expect(element.dataset.reveal).toBe('pending');
});
