// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {installAtlasTouch} from '../public/atlas-engine/hub-touch.mjs';
import {createNavigator,entryPath} from '../public/atlas-engine/hub-core.mjs';

const maps=[{id:'world',bounds:[0,0,100,100],status:'ready',asset:'world.webp'},{id:'tiris',parentMapId:'world',bounds:[0,0,100,100],status:'ready',asset:'tiris.webp'}];
let dispose;
function setup(){
  window.history.replaceState(null,'','#tiris');sessionStorage.clear();
  // Keep the real session navigator; only iframe identity and missing layout APIs are simulated.
  vi.spyOn(window,'parent','get').mockReturnValue({});
  let nav=createNavigator(maps);for(const id of entryPath(maps,'tiris'))expect(nav.enter(id)).toBe(true);
  expect(nav.current().id).toBe('tiris');
  document.body.innerHTML='<div id="viewport"><svg id="map" data-map-id="tiris" data-load-state="ready"><circle id="place"/></svg></div>';
  const map=document.getElementById('map'),viewport=document.getElementById('viewport'),place=document.getElementById('place');
  viewport.getBoundingClientRect=()=>({left:10,top:20,width:400,height:400});
  const captures=new Set();map.setPointerCapture=id=>captures.add(id);map.hasPointerCapture=id=>captures.has(id);map.releasePointerCapture=id=>captures.delete(id);
  const frames=new Map();let next=0;
  const raf=fn=>{frames.set(++next,fn);return next;},caf=id=>frames.delete(id);
  const draw=()=>{const s=nav.current();map.setAttribute('viewBox',`${s.center[0]-50/s.zoom} ${s.center[1]-50/s.zoom} ${100/s.zoom} ${100/s.zoom}`);};draw();
  dispose=installAtlasTouch({map,viewport,nav,metrics:()=>({fit:4,max:2.5}),camera:draw,cancelCamera:()=>{},requestFrame:raf,cancelFrame:caf});
  function point(type,id,x,y,target=map,pointerType='touch'){
    const event=new MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0});
    Object.defineProperties(event,{pointerId:{value:id},pointerType:{value:pointerType}});target.dispatchEvent(event);return event;
  }
  const flush=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());};
  return {map,place,nav,point,flush,captures,frames,reopen(){nav=createNavigator(maps);for(const id of entryPath(maps,'tiris'))nav.enter(id);return nav.current();}};
}
afterEach(()=>{dispose?.();vi.restoreAllMocks();document.body.innerHTML='';sessionStorage.clear();});
it('pinches about an off-centre finger midpoint while using the actual clamped zoom',()=>{
  const h=setup();h.point('pointerdown',1,210,220);h.point('pointerdown',2,310,220);
  h.point('pointermove',1,160,220);h.point('pointermove',2,360,220);h.flush();
  expect(h.nav.current().zoom).toBe(2);expect(h.nav.current().center).toEqual([56.25,50]);
  h.point('pointermove',2,960,220);h.flush();expect(h.nav.current().zoom).toBe(2.5);
});
it('rebases one finger to two and back without jumps, including a pending last move',()=>{
  const h=setup();h.point('pointerdown',1,110,220);h.point('pointermove',1,150,220);
  h.point('pointerdown',2,250,220);expect(h.nav.current().center).toEqual([40,50]);
  h.point('pointermove',1,100,220);h.point('pointermove',2,300,220);
  h.point('pointerup',2,300,220);expect(h.nav.current().zoom).toBe(2);
  const before=[...h.nav.current().center];h.point('pointermove',1,100,220);h.flush();expect(h.nav.current().center).toEqual(before);
  h.point('pointermove',1,140,220);h.point('pointerup',1,140,220);
  expect(h.nav.current().center).toEqual([before[0]-5,before[1]]);
  expect(h.captures.size).toBe(0);expect(h.frames.size).toBe(0);
});
it('persists the final gesture camera for reopening the same country',()=>{
  const h=setup();h.point('pointerdown',1,110,220);h.point('pointerdown',2,210,220);
  h.point('pointermove',2,310,220);h.point('pointerup',2,310,220);h.point('pointermove',1,150,240);h.point('pointerup',1,150,240);
  const {zoom,center}=h.nav.current();const restored=h.reopen();
  expect(zoom).toBe(2);expect(restored.zoom).toBe(zoom);expect(restored.center).toEqual(center);
});
it('preserves taps and keyboard activation, suppressing only post-gesture clicks',()=>{
  const h=setup();let activations=0;h.map.addEventListener('click',()=>activations++);
  const click=detail=>h.place.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail}));
  h.point('pointerdown',1,110,220,h.place);h.point('pointerup',1,111,220,h.place);click(1);expect(activations).toBe(1);
  h.point('pointerdown',1,110,220);h.point('pointermove',1,150,220);h.point('pointerup',1,150,220);click(1);expect(activations).toBe(1);
  click(0);expect(activations).toBe(2);
  h.point('pointerdown',1,110,220,h.place);h.point('pointerup',1,110,220,h.place);click(1);expect(activations).toBe(3);
});
it('leaves mouse input alone and prevents original single-pointer handlers from consuming touch',()=>{
  const h=setup();let originalCalls=0;h.map.addEventListener('pointerdown',()=>originalCalls++);
  h.point('pointerdown',1,100,100,h.map,'mouse');expect(originalCalls).toBe(1);
  h.point('pointerdown',2,100,100);expect(originalCalls).toBe(1);
});
it('clamps pan at original map bounds and zoom at the original minimum',()=>{
  const h=setup();h.point('pointerdown',1,100,100);h.point('pointermove',1,900,900);h.point('pointerup',1,900,900);
  expect(h.nav.current().center).toEqual([0,0]);
  h.point('pointerdown',1,100,100);h.point('pointerdown',2,300,100);h.point('pointermove',2,101,100);h.flush();expect(h.nav.current().zoom).toBe(1);
});
it('cancellation and lost capture leave no stuck gesture or accidental click',()=>{
  const h=setup();h.point('pointerdown',1,100,100);h.point('pointerdown',2,200,100);h.point('pointermove',2,300,100);
  h.point('pointercancel',2,300,100);h.point('lostpointercapture',1,100,100);
  const before=h.nav.current();h.point('pointermove',1,500,500);h.flush();expect(h.nav.current()).toEqual(before);
  expect(h.captures.size).toBe(0);
});
it('keeps dragging when implicit capture transfers from a child to the map',()=>{
  const h=setup();h.point('pointerdown',1,100,100,h.place);h.point('pointermove',1,140,100,h.place);h.flush();
  h.point('lostpointercapture',1,140,100,h.place);
  h.point('pointermove',1,180,100);h.point('pointerup',1,180,100);
  expect(h.nav.current().center).toEqual([30,50]);
});
it('ignores gesture updates while loading or changing maps',()=>{
  const h=setup();h.map.dataset.loadState='loading';h.point('pointerdown',1,100,100);h.point('pointermove',1,200,200);h.flush();expect(h.nav.current().center).toEqual([50,50]);
  h.map.dataset.loadState='ready';h.point('pointerdown',1,100,100);h.point('pointermove',1,200,200);
  h.nav.back();h.map.dataset.mapId='world';h.flush();expect(h.nav.current().center).toEqual([50,50]);
});
it('flushes final movement on interruption and allows a fresh gesture',()=>{
  const h=setup();h.point('pointerdown',1,100,100);h.point('pointermove',1,140,100);
  window.dispatchEvent(new Event('blur'));expect(h.nav.current().center).toEqual([40,50]);
  h.point('pointermove',1,240,100);h.flush();expect(h.nav.current().center).toEqual([40,50]);
  h.point('pointerdown',2,100,100);h.point('pointermove',2,140,100);h.point('pointerup',2,140,100);
  expect(h.nav.current().center).toEqual([30,50]);expect(h.captures.size).toBe(0);
});
it('handles coincident fingers and an extra finger without invalid camera values or jumps',()=>{
  const h=setup();h.point('pointerdown',1,100,100);h.point('pointerdown',2,100,100);h.point('pointermove',2,200,100);h.flush();
  expect(h.nav.current().zoom).toBe(1);
  h.point('pointermove',2,300,100);h.flush();expect(h.nav.current().zoom).toBe(2);
  const before=h.nav.current();h.point('pointerdown',3,200,200);h.point('pointermove',3,400,400);h.point('pointerup',3,400,400);h.flush();
  expect(h.nav.current()).toEqual(before);
  h.point('pointerup',2,300,100);h.point('pointerup',1,100,100);expect(h.captures.size).toBe(0);
});
