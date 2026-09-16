// @vitest-environment jsdom
import React from 'react';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {Footer} from './Footer.jsx';

beforeEach(()=>{
 // jsdom has no audio decoder. Model only native playback events; exercise the real player UI.
 vi.spyOn(HTMLMediaElement.prototype,'play').mockImplementation(function(){this.dispatchEvent(new Event('play'));this.dispatchEvent(new Event('playing'));return Promise.resolve();});
 vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(function(){this.dispatchEvent(new Event('pause'));});
 vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('starts silent, plays the selected track, and keeps the same audio element across page changes',async()=>{
 const {rerender}=render(<Footer/>);
 fireEvent.click(screen.getByRole('button',{name:'배경음악 재생'}));
 await screen.findByRole('button',{name:'배경음악 일시정지'});
 const audio=document.querySelector('audio');expect(audio.autoplay).toBe(false);
 expect(audio.getAttribute('src')).toContain('rest-stop.mp3');
 rerender(<Footer home/>);expect(document.querySelector('audio')).toBe(audio);
 rerender(<Footer/>);
 fireEvent.click(screen.getByRole('button',{name:'배경음악 일시정지'}));
 expect(screen.getByRole('button',{name:'배경음악 재생'})).not.toBeNull();
});
it('selects all three supplied tracks, loops after the last, and preserves paused state when skipping',async()=>{
 render(<Footer/>);const picker=screen.getByRole('combobox',{name:'배경음악 선택'});
 expect(picker.options).toHaveLength(3);
 fireEvent.click(screen.getByRole('button',{name:'다음 곡'}));
 expect(picker.value).toBe('1');expect(screen.getByRole('button',{name:'배경음악 재생'})).not.toBeNull();
 fireEvent.change(picker,{target:{value:'2'}});fireEvent.click(screen.getByRole('button',{name:'배경음악 재생'}));
 await screen.findByRole('button',{name:'배경음악 일시정지'});
 fireEvent.ended(document.querySelector('audio'));
 await waitFor(()=>expect(picker.value).toBe('0'));
 expect(screen.getByRole('button',{name:'배경음악 일시정지'})).not.toBeNull();
});
it('shows a recoverable playback error instead of a false playing state',async()=>{
 vi.spyOn(HTMLMediaElement.prototype,'play').mockRejectedValue(new Error('blocked'));
 render(<Footer/>);fireEvent.click(screen.getByRole('button',{name:'배경음악 재생'}));
 expect(await screen.findByRole('status')).not.toBeNull();
 expect(screen.getByRole('button',{name:'배경음악 재생'})).not.toBeNull();
});
