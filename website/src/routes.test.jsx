// @vitest-environment jsdom
import React from 'react';
import {it,expect} from 'vitest';
import {render,cleanup,screen} from '@testing-library/react';
import {HubPages} from './HubPages.jsx';
import content from './content.json';
const definitions=[['person','people'],['place','places'],['region','regions'],['story','stories'],['guide','guide'],['start','starts']];
const routes=definitions.flatMap(([kind,key])=>content[key].map(x=>({kind,id:x.id,title:x.name||x.title})));
const valid=new Set(['#welcome','#first-steps','#explore','#/people','#/stories','#/regions','#/start','#/about','#/materials',...routes.map(r=>`#/${r.kind}/${r.id}`)]);
it('limits the approved category hierarchy to the four peer overview routes',()=>{
 for(const kind of ['people','stories','regions','start']){
  const {container}=render(<HubPages route={{parts:[kind]}}/>);
  expect(container.querySelector('.category-overview > .hub-page'),kind).not.toBeNull();
  expect(container.querySelectorAll('h1')).toHaveLength(1);
  cleanup();
 }
 for(const [kind,key] of definitions){
  const {container}=render(<HubPages route={{parts:[kind,content[key][0].id]}}/>);
  expect(container.querySelector('.category-overview'),kind).toBeNull();
  cleanup();
 }
 for(const kind of ['about','materials']){
  const {container}=render(<HubPages route={{parts:[kind]}}/>);
  expect(container.querySelector('.category-overview'),kind).toBeNull();
  cleanup();
 }
});
it('renders every data-backed detail and keeps every internal link resolvable',()=>{
 for(const route of routes){
  const{container}=render(<HubPages route={{parts:[route.kind,route.id]}}/>);
  expect(screen.queryByText('길을 조금 벗어났네요')).toBeNull();
  expect(container.querySelector('h1')?.textContent).toBe(route.title);
  for(const a of container.querySelectorAll('a[href^="#"]'))expect(valid.has(a.getAttribute('href').split('?')[0]),a.getAttribute('href')).toBe(true);
  cleanup();
 }
},20000);
