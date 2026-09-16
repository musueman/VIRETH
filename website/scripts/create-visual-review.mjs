import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require('C:/Users/musue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const mocks=path.resolve('../../assets/site/vireth/expansion/2026-09-16-v1/design-mocks');
for(const [mock,capture] of [['h4','home-archive-desktop'],['h5','home-people-desktop'],['guide','guide-desktop'],['region','region-desktop'],['h6','home-journey-desktop'],['people','people-desktop'],['reader','reader-desktop'],['start','start-desktop']]){
 const files=[path.join(mocks,mock+'.png'),'qa/'+capture+'.png'];
 const input=await Promise.all(files.map(p=>sharp(p).resize(720,520,{fit:'contain',background:'#061d28'}).toBuffer()));
 await sharp({create:{width:1440,height:520,channels:3,background:'#061d28'}}).composite(input.map((input,i)=>({input,left:i*720,top:0}))).png().toFile('qa/compare-'+mock+'.png');
}
const people=JSON.parse(fs.readFileSync('src/content.json','utf8')).people;
for(let sheet=0;sheet<4;sheet++){
 const items=await Promise.all(people.slice(sheet*25,sheet*25+25).map(async(p,i)=>({input:await sharp('public'+p.image).resize(160,228,{fit:'contain',background:'#102b37'}).toBuffer(),left:i%5*180+10,top:Math.floor(i/5)*248+10})));
 await sharp({create:{width:900,height:1240,channels:3,background:'#061d28'}}).composite(items).png().toFile(`qa/portraits-${sheet+1}.png`);
}
console.log('Eight design comparisons and four approved portrait inspection sheets saved.');
