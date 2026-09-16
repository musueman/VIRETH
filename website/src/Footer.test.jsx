// @vitest-environment jsdom
import React from 'react';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {Footer} from './HubShared.jsx';
import {SiteHeader} from './SiteHeader.jsx';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
it('shows the footer at the same scroll boundary as the white header and hides it again at the top',()=>{
 let y=0;vi.spyOn(window,'scrollY','get').mockImplementation(()=>y);
 render(<><SiteHeader home onSearch={()=>{}}/><Footer home/></>);
 const footer=document.querySelector('.hub-footer'),header=document.querySelector('.site-header');
 expect(footer.dataset.visible).toBe('false');expect(footer.hasAttribute('inert')).toBe(true);
 y=24;fireEvent.scroll(window);expect(footer.dataset.visible).toBe('false');
 y=25;fireEvent.scroll(window);expect(footer.dataset.visible).toBe('true');expect(header.dataset.scrolled).toBe('true');expect(footer.hasAttribute('inert')).toBe(false);
 y=0;fireEvent.scroll(window);expect(footer.dataset.visible).toBe('false');expect(header.dataset.scrolled).toBe('false');
});
it('keeps internal-page footer visible and places companions after navigation',()=>{
 render(<Footer home={false}/>);const footer=document.querySelector('.hub-footer');
 expect(footer.dataset.visible).toBe('true');
 const nav=screen.getByRole('navigation',{name:'아래 메뉴'}),companions=document.querySelector('.footer-companions');
 expect(nav.compareDocumentPosition(companions)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
it('reserves the measured footer height and releases its obstruction when hidden or unmounted',()=>{
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockReturnValue({height:85});
 let y=100;vi.spyOn(window,'scrollY','get').mockImplementation(()=>y);
 const {unmount}=render(<Footer home/>);
 expect(document.documentElement.style.getPropertyValue('--footer-obstruction')).toBe('85px');
 expect(document.querySelector('.footer-spacer').style.height).toBe('85px');
 y=0;fireEvent.scroll(window);expect(document.documentElement.style.getPropertyValue('--footer-obstruction')).toBe('0px');
 unmount();expect(document.documentElement.style.getPropertyValue('--footer-obstruction')).toBe('');
});
it('does not advance decorative frames while the footer is hidden at the homepage top',()=>{
 vi.useFakeTimers();vi.spyOn(window,'scrollY','get').mockReturnValue(0);
 render(<Footer home/>);document.querySelectorAll('.footer-companion-preload').forEach(e=>fireEvent.load(e));
 const sprite=document.querySelector('[data-companion="duran"]'),frame=sprite.style.backgroundPosition;
 act(()=>vi.advanceTimersByTime(300));expect(sprite.style.backgroundPosition).toBe(frame);
 expect(document.querySelector('.footer-companions').dataset.running).toBe('false');
});
