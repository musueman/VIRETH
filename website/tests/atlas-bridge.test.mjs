import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

test('bridge does not mark a loading map ready and reports it after imagery settles',()=>{
  const map={dataset:{mapId:'tiris',loadState:'loading'}};
  const viewport={dataset:{}};
  const messages=[],callbacks=[];
  const window={location:{origin:'https://example.test'},addEventListener(){},parent:{postMessage(message){messages.push(message);}}};
  class Observer{constructor(callback){callbacks.push(callback);}observe(){}}
  const document={getElementById(id){return id==='map'?map:id==='viewport'?viewport:{offsetHeight:900};},createElement(){return {};}};
  vm.runInNewContext(readFileSync(new URL('../public/atlas-engine/hub-bridge.mjs',import.meta.url),'utf8'),{window,document,MutationObserver:Observer,ResizeObserver:Observer});
  assert.equal(messages.length,0);
  map.dataset.loadState='ready';callbacks[0]();
  assert.equal(messages.length,1);
  assert.equal(messages[0].mapId,'tiris');
  assert.equal(messages[0].height,920);
});
