// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {RegionMap} from './RegionPages.jsx';
import {PersonPage} from './CatalogPages.jsx';
import {content} from './HubShared.jsx';

afterEach(cleanup);

it('lets a user select any nearby place without hitting a small map point',()=>{
  for(const region of content.regions){
    const places=content.places.filter(p=>p.regionId===region.id);
    render(<RegionMap regionId={region.id} placeId={places[0].id}/>);
    const picker=screen.getByRole('combobox',{name:'지도에서 장소 고르기'});
    expect(within(picker).getAllByRole('option')).toHaveLength(places.length);
    for(const place of places){
      fireEvent.change(picker,{target:{value:place.id}});
      expect(screen.getByRole('link',{name:'선택한 장소 살펴보기'}).getAttribute('href')).toBe(`#/place/${place.id}`);
    }
    cleanup();
  }
});

it('keeps the current place selected when navigating between nearby places',()=>{
  const places=content.places.filter(p=>p.regionId==='leonia');
  const {rerender}=render(<RegionMap regionId="leonia" placeId={places[0].id}/>);
  rerender(<RegionMap regionId="leonia" placeId={places[1].id}/>);
  expect(screen.getByRole('combobox',{name:'지도에서 장소 고르기'}).value).toBe(places[1].id);
});

it('introduces each person by name and role before their portrait in reading order',()=>{
  for(const person of content.people){
    const {container}=render(<PersonPage person={person}/>);
    const heading=screen.getByRole('heading',{level:1});
    const portrait=container.querySelector('.profile-portrait');
    expect(heading.compareDocumentPosition(portrait)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector('.profile-heading')?.textContent).toContain(person.role);
    expect(screen.getAllByRole('heading',{level:1})).toHaveLength(1);
    cleanup();
  }
});
