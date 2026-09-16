// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {PeoplePage,LibraryPage,PersonPage} from './CatalogPages.jsx';
import {content} from './HubShared.jsx';

afterEach(()=>{cleanup();window.history.replaceState(null,'','#/people');});

it.each([
  [PeoplePage,'인물대백과','/assets/journey-scenes/v1/30_market-view.webp','인물 이름 또는 하는 일','.person-card',content.people[0].name],
  [LibraryPage,'이야기서고','/assets/journey-scenes/v1/25_ledger-clue.webp','이야기 제목 또는 글의 종류','.library-entry',content.stories[0].title],
])('adds decorative catalog art while preserving searchable results', (Page,label,src,input,card,query)=>{
  const {container}=render(<Page/>);
  const hero=screen.getByRole('region',{name:`${label} 소개`});
  const art=hero.querySelector('img');
  expect(art?.getAttribute('src')).toBe(src);
  expect(art.getAttribute('alt')).toBe('');
  expect(art.getAttribute('loading')).toBe('eager');
  expect(hero.contains(screen.getByRole('heading',{level:1}))).toBe(true);
  expect(hero.contains(screen.getByRole('textbox',{name:input}))).toBe(false);
  fireEvent.change(screen.getByRole('textbox',{name:input}),{target:{value:query}});
  expect(container.querySelectorAll(card)).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:'조건 지우기'}));
  expect(container.querySelectorAll(card).length).toBeGreaterThan(1);
});

it('does not apply catalog header artwork to person details',()=>{
  const {container}=render(<PersonPage person={content.people[0]}/>);
  expect(container.querySelector('.catalog-introduction')).toBeNull();
});
