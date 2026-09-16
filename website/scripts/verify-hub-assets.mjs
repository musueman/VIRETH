import fs from 'node:fs';
const content=JSON.parse(fs.readFileSync('src/content.json','utf8'));
const urls=[...content.people.map(x=>x.image),...content.stories.flatMap(x=>x.illustrations.map(a=>a.asset)),...content.starts.map(x=>x.image),...content.regions.flatMap(r=>[`/assets/explore/capitals/${r.id}.webp`,`/assets/explore/crests/${r.id}.png`]),'/assets/explore/v63/terrain.png','/assets/expansion/archive-background.webp','/assets/expansion/journey-background.webp','/assets/hero/hero-desktop.png','/assets/hero/hero-mobile.png','/assets/hero/hero-city-edge.png','/assets/branding/vireth-logo-20260915.png','/assets/characters/duran-guide-v2-cutout-20260915.png'];
const rows=[];
for(let start=0;start<urls.length;start+=12){rows.push(...await Promise.all(urls.slice(start,start+12).map(async url=>{const response=await fetch('http://127.0.0.1:4173'+url,{method:'HEAD'});return {url,status:response.status,type:response.headers.get('content-type'),bytes:fs.statSync('public'+url).size};})));}
const failed=rows.filter(r=>r.status!==200||!r.type?.startsWith('image/')||!r.bytes);
fs.writeFileSync('qa/assets-http.json',JSON.stringify({checkedAt:new Date().toISOString(),count:rows.length,failed,assets:rows},null,2));
console.log({assets:rows.length,failed:failed.length});if(failed.length)process.exitCode=1;
