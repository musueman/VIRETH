import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {expect,it} from 'vitest';
import content from './content.json';
import provenance from '../qa/content-provenance.json';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
it('preserves every imported story body exactly and all approved portrait pixels',()=>{
 const source=fs.readFileSync(provenance.sources.find(s=>s.kind==='reading').path,'utf8');
 const original=JSON.parse(source.slice(source.indexOf('=')+1).trim().replace(/;$/,''));
 content.stories.forEach(s=>expect(s.html).toBe(original.documents.find(x=>x.id===s.id).html));
 for(const a of provenance.assets)expect(hash(path.join(process.cwd(),'public',a.url))).toBe(a.sha256);
 expect(provenance.assets.filter(a=>a.url.includes('/people/'))).toHaveLength(100);
});
it('keeps the approved v63 geography and source terrain unchanged',()=>{
 expect(hash('src/geography-v63.json')).toBe('49091ec1cbe682e1205a585e0b995195819931daf6e1a01e5c0583e9902475d2');
 expect(hash('public/assets/explore/v63/terrain.png')).toBe('30c70fb1896f01b158ab1203d584f6170b8d68d27011dcc6db04487074fa68ab');
});
