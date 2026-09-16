import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(app,'../..');
const latest='D:/OneDrive/444_비레스/00_최신본';
const readingRoot=path.join(latest,'08_기록문서_서고/06_public_site/public');
const sourcePaths={
  reading:path.join(readingRoot,'public-reading-data.js'),
  people:path.join(latest,'09_루나톡/01_실투입DB/Arcadia_루나톡_통합DB_실투입_v20_정치규모구분.md'),
  places:path.join(latest,'02_지도/16_지리확정_지도_v63/settlement-migration.json'),
  placeCorrections:path.join(app,'src/approved-place-corrections.json'),
  editorial:path.join(repo,'docs/site-content/2026-09-15-vireth-home-world-copy-v1.md'),
  portraits:'S:/du/o/Anima/Vireth_v17_GitHub_replacement_20260914/verification.json',
};
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const json=p=>JSON.parse(read(p));
const clean=s=>s.replace(/\[\[|\]\]/g,'').trim();
// Public typography only: separate existing occupational nouns, no new duties.
const roleLabel=s=>s.replace(/좌표/g,'담당').replace(/해설자/g,'안내인')
 .replace(/(권위대표|대표|집행자|안내인|담당)$/,' $1')
 .replace(/궁정납품/,'궁정 납품').replace(/궁정출입/,'궁정 출입').replace(/기사봉토/,'기사 봉토')
 .replace(/철강부두/,'철강 부두').replace(/왕실법정/,'왕실 법정').replace(/접경성문/,'접경 성문')
 .replace(/극장질서/,'극장 질서').replace(/필사거리/,'필사 거리').replace(/방어평의회/,'방어 평의회')
 .replace(/성벽공사/,'성벽 공사').replace(/공동창고/,'공동 창고').replace(/수로회의/,'수로 회의')
 .replace(/농촌공동체/,'농촌 공동체').replace(/저장고산악/,'저장고·산악').replace(/고개초소/,'고개 초소')
 .replace(/무기중개/,'무기 중개').replace(/자유항의회/,'자유항 의회').replace(/원정허가/,'원정 허가')
 .replace(/해도보관/,'해도 보관').replace(/혹한저장/,'혹한기 저장').replace(/겨울통행/,'겨울 통행')
 .replace(/불씨공동주거/,'불씨 공동주거').replace(/고공통행/,'고공 통행').replace(/동맹기록/,'동맹 기록')
 .replace(/재료장부/,'재료 장부').replace(/제한학당/,'제한 학당').replace(/산악사원/,'산악 사원')
 .replace(/약초장터/,'약초 장터').replace(/강하교역/,'강하 교역').replace(/산악신정/,'산악 신정')
 .replace(/계절야영/,'계절 야영').replace(/물가약속/,'물가 약속').replace(/이동장부/,'이동 장부')
 .replace(/숲감시/,'숲 감시').replace(/왕실정원/,'왕실 정원').replace(/성림의례/,'성림 의례')
 .replace(/강하항구/,'강하 항구').replace(/세금관문/,'세금 관문').replace(/상업법정/,'상업 법정')
 .replace(/상인의회/,'상인 의회').replace(/철학회합/,'철학 회합').replace(/사본교환/,'사본 교환')
 .replace(/숲전승/,'숲 전승').replace(/탐사허가/,'탐사 허가').replace(/사본열람/,'사본 열람')
 .replace(/탐사거점/,'탐사 거점').replace(/화산항로/,'화산 항로').replace(/분화감시/,'분화 감시')
 .replace(/항만대기/,'항만 대기').replace(/난파기록/,'난파 기록').replace(/구조대기/,'구조 대기');
const provenance={sources:Object.entries(sourcePaths).map(([kind,p])=>({kind,path:p,sha256:hash(p)})),assets:[]};
function copy(source,url,expected){
  const sha256=hash(source);
  if(expected && sha256!==expected.toLowerCase())throw Error('Unapproved asset: '+source);
  const dest=path.join(app,'public',url);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);
  provenance.assets.push({source,url,sha256});return '/'+url;
}
const raw=read(sourcePaths.reading);
const reading=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));
const regions=json(path.join(app,'src/countries.json')).map(({id,name,capital,capitalType,kind,isRegion,copy})=>({id,name,capital,capitalType,kind,isRegion,copy}));
const places=json(sourcePaths.places).map(p=>({id:p.id,name:p.name,regionId:p.regionId,region:p.region,type:p.original['장소유형'],summary:p.original['비고'],at:p.at}));
// User-approved placement corrections survive regeneration while the canon task
// incorporates the same coordinates into the released map dataset.
for(const correction of json(sourcePaths.placeCorrections).places){
  const place=places.find(p=>p.id===correction.id);
  if(!place || place.name!==correction.name)throw Error('Unmapped approved correction: '+correction.id);
  if(![correction.from,correction.at].some(at=>at.every((n,i)=>n===place.at[i])))throw Error('Coordinate source changed; review correction: '+correction.id);
  place.at=[...correction.at];
}
const stories=reading.documents.map(d=>{
  if(/<script|<iframe|\son\w+\s*=|javascript:/i.test(d.html))throw Error('Unsafe source HTML '+d.id);
  const text=d.html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  return {id:d.id,title:d.title,form:d.form,html:d.html,guide:d.guide,references:d.references,
    minutes:Math.max(2,Math.ceil(d.characterCount/450)),excerpt:text.slice(0,105)+'…',
    regionIds:regions.filter(r=>text.includes(r.name)).map(r=>r.id),
    illustrations:d.visual.illustrations.map(a=>({...a,asset:copy(path.join(readingRoot,a.asset),'assets/library/'+path.basename(a.asset))}))};
});
const starts=reading.startReading.readingFlows.map(s=>({...s,image:copy(path.join(readingRoot,s.image),'assets/starts/'+path.basename(s.image))}));
const verification=json(sourcePaths.portraits);
if(verification.status!=='VERIFIED_READY' || !verification.unchanged_mapping)throw Error('Portrait release is not verified');
const people=[...read(sourcePaths.people).matchAll(/^## (C\d{3}) \[\[([^\]]+)\]\]\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(([,code,name,body])=>{
  const field=key=>clean(body.match(new RegExp('^'+key+':(.*)$','m'))?.[1]||'');
  const links=[...body.match(/^위치:(.*)$/m)[1].matchAll(/\[\[([^\]]+)\]\]/g)].map(m=>m[1]);
  const region=regions.find(r=>r.name===links[0]);if(!region)throw Error('Unknown region '+code);
  const filename='char-'+code.toLowerCase()+'.webp';
  const relative='workers/vireth-svg/public/character-assets/'+filename;
  const approved=verification.assets.find(a=>a.path===relative);if(!approved)throw Error('Missing approved portrait '+code);
  const place=places.find(p=>p.regionId===region.id&&p.name.split(/\s*\/\s*/).includes(links[1]));
  return {id:code.toLowerCase(),name,regionId:region.id,region:region.name,place:links[1],placeId:place?.id||null,
    role:roleLabel(field('역할')),
    species:field('종족'),gender:field('성별')==='남'?'남성':'여성',birth:field('출생'),appearance:field('외견'),clothing:field('복식'),belongings:field('소지'),
    image:copy(path.join(repo,relative),'assets/people/'+filename,approved.sha256)};
});
if(people.length!==100)throw Error('Expected 100 public profiles, got '+people.length);
const editorial=read(sourcePaths.editorial);
const chapters=[...editorial.matchAll(/^# (\d+)\. ([^\n]+)\n([\s\S]*?)(?=^# |$(?![\s\S]))/gm)];
function blocks(number){const body=chapters.find(c=>Number(c[1])===number)?.[3];if(!body)throw Error('Missing chapter '+number);return body.trim().split(/\n\s*\n/).filter(s=>s.trim()!=='---').map(s=>({type:s.startsWith('## ')?'heading':s.startsWith('- ')?'list':'paragraph',text:s.replace(/^## /,'').replace(/\*\*/g,'').trim()}));}
const guide=[
  {id:'first',title:'비레스에 첫발을 들이면',eyebrow:'처음 만나는 비레스',chapters:[1,8,4],storyIds:['ini-com-01']},
  {id:'daily',title:'이곳의 하루는 어떻게 흐를까요?',eyebrow:'먹고, 쉬고, 살아가는 일',chapters:[5],storyIds:['ini-com-01','ini-com-05']},
  {id:'places',title:'마음이 가는 곳을 찾아서',eyebrow:'나라와 도시, 그리고 마을',chapters:[3],storyIds:['ini-com-02']},
  {id:'roads',title:'장터에서 길 끝까지',eyebrow:'물건과 소식이 오가는 길',chapters:[7],storyIds:['ini-com-05','ini-com-06']},
  {id:'promises',title:'함께 살아가며 지키는 약속',eyebrow:'믿음과 이름, 기록의 힘',chapters:[6],storyIds:['ini-com-03','ini-rol-01']},
  {id:'history',title:'오래된 이야기가 오늘에 닿을 때',eyebrow:'지나온 시간과 지금의 사람들',chapters:[9,2],storyIds:['ini-com-07','ini-rol-06']},
].map(({chapters,...g})=>({...g,blocks:chapters.flatMap(blocks)}));
const content={regions,places,people,stories,starts,guide};
fs.writeFileSync(path.join(app,'src/content.json'),JSON.stringify(content,null,2)+'\n');
fs.writeFileSync(path.join(app,'qa/content-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(content).map(([k,v])=>[k,v.length])));
console.log('Verified copied assets:',provenance.assets.length);
