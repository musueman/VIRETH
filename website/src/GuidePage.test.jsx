// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import {GuidePage,Reader} from './Reader.jsx';
import {content} from './HubShared.jsx';

afterEach(cleanup);
it('gives all six guides distinct decorative backdrops separate from the menu',()=>{
  const sources=new Set();
  for(const guide of content.guide){
    const {container}=render(<GuidePage guide={guide}/>);
    const background=container.querySelector('.guide-fixed-background');
    expect(background).not.toBeNull();
    expect(background.getAttribute('aria-hidden')).toBe('true');
    sources.add(background.querySelector('img').getAttribute('src'));
    const menu=screen.getByRole('navigation',{name:'세계 안내 목차'});
    expect(menu.contains(background)).toBe(false);
    expect(within(menu).getAllByRole('link')).toHaveLength(6);
    expect(menu.querySelector('[aria-current="page"]').getAttribute('href')).toBe(`#/guide/${guide.id}`);
    expect(screen.getByRole('heading',{level:1}).textContent).toBe(guide.title);
    cleanup();
  }
  expect(sources.size).toBe(6);
});
it('does not leak guide backgrounds into story readers',()=>{
  const {container}=render(<Reader story={content.stories[0]}/>);
  expect(container.querySelector('.guide-fixed-background')).toBeNull();
});
