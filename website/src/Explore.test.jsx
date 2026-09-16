// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {Explore} from './Explore.jsx';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});
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
