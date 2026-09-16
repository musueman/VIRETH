// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {HomeSections} from './HomeSections.jsx';

let observations,preference,motionChange;
beforeEach(()=>{
  observations=[];
  preference={matches:false,addEventListener:(_,fn)=>{motionChange=fn;},removeEventListener(){}};
  vi.stubGlobal('matchMedia',()=>preference);
  vi.stubGlobal('IntersectionObserver',class{
    constructor(callback){this.callback=callback;}
    observe(element){observations.push({element,callback:this.callback});}
    disconnect(){}
  });
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
const light=()=>document.querySelector('.archive-atmosphere');
const enter=()=>observations.find(o=>o.element.classList.contains('archive-atmosphere')).callback([{isIntersecting:true}]);

it('keeps decorative light paused offscreen and resumes only in view',()=>{
  render(<HomeSections/>);
  expect(light()?.dataset.running).toBe('false');
  act(enter);
  expect(light().dataset.running).toBe('true');
  act(()=>observations.find(o=>o.element===light()).callback([{isIntersecting:false}]));
  expect(light().dataset.running).toBe('false');
});
it('pauses the light while the browser document is hidden',()=>{
  render(<HomeSections/>);
  expect(light()).not.toBeNull();
  act(enter);
  vi.spyOn(document,'hidden','get').mockReturnValue(true);
  fireEvent(document,new Event('visibilitychange'));
  expect(light().dataset.running).toBe('false');
});
it('keeps reduced-motion illumination still even on screen',()=>{
  preference.matches=true;
  render(<HomeSections/>);
  expect(light()).not.toBeNull();
  act(enter);
  expect(light().dataset.running).toBe('false');
  expect(light().getAttribute('aria-hidden')).toBe('true');
});

it('updates independent continuous candle motion and freezes it after leaving the screen',()=>{
  const frames=new Map();let id=0;
  vi.stubGlobal('requestAnimationFrame',fn=>{frames.set(++id,fn);return id;});
  vi.stubGlobal('cancelAnimationFrame',key=>frames.delete(key));
  const tick=time=>act(()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));});
  render(<HomeSections/>);act(enter);tick(0);
  const lights=[...document.querySelectorAll('.archive-candle-light')];
  const initial=lights.map(e=>e.style.getPropertyValue('--candle-opacity'));
  expect(initial.every(Boolean)).toBe(true);
  expect(new Set(initial).size).toBeGreaterThan(1);
  tick(90);
  const next=lights.map(e=>e.style.getPropertyValue('--candle-opacity'));
  expect(next).not.toEqual(initial);
  next.forEach((value,i)=>{expect(Number(value)).toBeGreaterThan(.4);expect(Number(value)).toBeLessThan(.95);expect(Math.abs(Number(value)-Number(initial[i]))).toBeLessThan(.2);});
  act(()=>observations.find(o=>o.element===light()).callback([{isIntersecting:false}]));
  tick(2000);
  expect(lights.map(e=>e.style.getPropertyValue('--candle-opacity'))).toEqual(next);
});
