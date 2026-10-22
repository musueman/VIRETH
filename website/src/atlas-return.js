const key='vireth:atlas-home-return:v1';
const homeHashes=new Set(['#welcome','#first-steps','#explore','#stories','#people','#journey','#main']);
let fallback=null;
let writeFailed=false;
export function readAtlasReturn(){
  let value;
  try{value=writeFailed?fallback:JSON.parse(sessionStorage.getItem(key)||'null');}catch{value=fallback;}
  return value&&homeHashes.has(value.hash)&&Number.isFinite(value.y)&&value.y>=0?value:null;
}
export const atlasReturnHref=()=>readAtlasReturn()?.hash||'#explore';
export function rememberAtlasReturn(anchor){
  const hash=window.location.hash||'#welcome';
  if(!homeHashes.has(hash))return;
  const value={hash,y:window.scrollY,country:document.getElementById('explore-country')?.value,focusHref:anchor.hash};
  fallback=value;
  try{sessionStorage.setItem(key,JSON.stringify(value));writeFailed=false;}catch{writeFailed=true;/* Prefer the latest trip over an older readable record. */}
}
