// Presentation bridge only: the upstream engine owns all navigation and geometry.
const map=document.getElementById('map');
// Reuse the homepage's already-loaded typefaces inside the isolated document.
try{
  const style=document.createElement('style');
  style.textContent=[...window.parent.document.styleSheets].flatMap(sheet=>{
    try{return [...sheet.cssRules].filter(rule=>rule.type===CSSRule.FONT_FACE_RULE).map(rule=>rule.cssText.replace(/url\(["']?([^"')]+)["']?\)/g,(_,url)=>`url("${new URL(url,sheet.href||window.parent.document.baseURI).href}")`));}catch{return [];}
  }).join('\n');
  document.head.append(style);
}catch{/* Standalone viewing keeps the original fallback typeface. */}
let previous='';
function report(){
  // Resizing an iframe during an upstream View Transition cancels its snapshot.
  if(document.getElementById('viewport').dataset.traveling)return;
  // Do not enable host reset while the original engine is loading imagery.
  // An error is settled too: keep reset available as a recovery action.
  if(!['ready','error'].includes(map?.dataset.loadState))return;
  const mapId=map?.dataset.mapId;
  // Layout height is independent of focus-induced document/body scrolling.
  const height=Math.ceil(document.getElementById('atlas-app').offsetHeight+20);
  const stamp=`${mapId}:${height}`;
  if(!mapId||stamp===previous)return;
  previous=stamp;
  window.parent.postMessage({type:'vireth-atlas-state',mapId,height},window.location.origin);
}
new MutationObserver(report).observe(map,{attributes:true,attributeFilter:['data-map-id','data-load-state']});
new MutationObserver(report).observe(document.getElementById('viewport'),{attributes:true,attributeFilter:['data-traveling']});
new ResizeObserver(report).observe(document.getElementById('atlas-app'));
window.addEventListener('load',report);
window.addEventListener('resize',report);
report();
