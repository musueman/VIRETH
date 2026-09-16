// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {Explore} from './Explore.jsx';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});

function stackedViewport(initial=true){
 let matches=initial;const listeners=new Set();
 vi.stubGlobal('matchMedia',query=>({get matches(){return query==='(max-width: 1000px)'&&matches;},addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)}));
 return value=>{matches=value;act(()=>listeners.forEach(fn=>fn({matches:value})));};
}
it('keeps a selected mobile card below the map, scrolls to it only on activation, and never portals it',()=>{
 stackedViewport();HTMLElement.prototype.scrollIntoView=vi.fn();
 render(<Explore/>);
 const picker=screen.getByRole('combobox',{name:'나라와 권역 고르기'});
 const map=document.querySelector('.atlas-preview');
 expect(picker.closest('.explore-heading')).toBeNull();
 expect(picker.compareDocumentPosition(map)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 const marker=screen.getByRole('button',{name:'노르가르드 살펴보기',exact:true});
 fireEvent.focus(marker);expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
 fireEvent.click(marker);
 expect(document.querySelector('.place-slot .place-box')).not.toBeNull();
 expect(document.querySelector('.place-box[data-floating="true"]')).toBeNull();
 expect(screen.getByRole('heading',{name:'노르가르드',level:3})).not.toBeNull();
 expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({behavior:'smooth',block:'start'});
 fireEvent.scroll(window);
 expect(document.querySelector('.place-slot .place-box')).not.toBeNull();
});
it('resets floating motion when changing to stacked layout, and preserves desktop selection afterward',()=>{
 const resize=stackedViewport(false);render(<Explore/>);
 const marker=screen.getByRole('button',{name:'레오니아 살펴보기',exact:true});
 fireEvent.click(marker);expect(document.querySelector('.place-box[data-floating="true"]')).not.toBeNull();
 resize(true);expect(document.querySelector('.place-slot .place-box')).not.toBeNull();
 expect(document.querySelector('.country-close')).toBeNull();
 resize(false);fireEvent.click(marker);
 expect(document.querySelector('.place-box[data-floating="true"]')).not.toBeNull();
});
it('stays dismissed after scroll exit without remounting the inline card, and reopens on deliberate selection',()=>{
 vi.useFakeTimers();let mapTop=0;
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(){return this.classList.contains('atlas-preview')?{top:mapTop,bottom:mapTop+1200,height:1200}:{top:200,bottom:700,height:500};});
 render(<Explore/>);const marker=screen.getByRole('button',{name:'레오니아 살펴보기',exact:true});
 fireEvent.mouseEnter(marker);expect(document.querySelector('.place-box[data-floating="true"]')).not.toBeNull();
 const reserved=document.querySelector('.place-slot').style.minHeight;
 mapTop=400;fireEvent.scroll(window);act(()=>vi.advanceTimersByTime(400));
 expect(document.querySelector('.place-box')).toBeNull();
 const watermark=document.querySelector('.explore-empty-mark');
 expect(watermark).not.toBeNull();
 expect(watermark.getAttribute('aria-hidden')).toBe('true');
 expect(watermark.querySelector('img').alt).toBe('');
 expect(watermark.querySelector('img').draggable).toBe(false);
 expect(document.querySelector('.place-slot').style.minHeight).toBe(reserved);
 fireEvent.mouseEnter(marker);expect(document.querySelector('.place-box')).toBeNull();
 fireEvent.mouseMove(marker,{clientX:500,clientY:300});
 expect(document.querySelector('.place-box[data-floating="true"]')).not.toBeNull();
 expect(document.querySelector('.explore-empty-mark')).toBe(watermark);
 expect(document.querySelector('.place-slot').style.minHeight).toBe(reserved);
});
