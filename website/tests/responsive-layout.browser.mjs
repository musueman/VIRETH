// Run measureResponsiveLayout via the connected browser's read-only evaluate API.
// Assertions use live geometry, not CSS source text; test before/after at 390 and 412px.
export function measureResponsiveLayout(){
  const checks=[];
  const add=(name,value,limit)=>checks.push({name,value,limit,pass:value<=limit});
  const cta=document.querySelector('.intro-link');
  if(cta){
    const range=document.createRange();
    const text=Array.from(cta.childNodes).find(n=>n.nodeType===3&&n.textContent.trim());
    range.selectNodeContents(text);
    add('intro CTA text lines',range.getClientRects().length,1);
  }
  if(innerWidth<=760){
    const portrait=document.querySelector('.profile-portrait');
    if(portrait){
      add('person name before portrait',document.querySelector('h1').getBoundingClientRect().bottom-portrait.getBoundingClientRect().top,0);
      add('portrait reserved height',portrait.getBoundingClientRect().height,440);
    }
    const intro=document.querySelector('.place-introduction .page-intro');
    if(intro)add('place intro to map gap',document.querySelector('.detail-map').getBoundingClientRect().top-intro.getBoundingClientRect().bottom,64);
    const related=document.querySelector('.guide-related');
    if(related)add('guide related margin',+getComputedStyle(related).marginTop.replace('px',''),40);
  }
  const map=document.querySelector('.detail-map');
  if(map){
    const picker=map.querySelector('select');
    add('map accessible picker missing',picker?0:1,0);
    if(picker)add('map picker minimum height deficit',44-picker.getBoundingClientRect().height,0);
    const action=map.querySelector('.detail-map-picker>a');
    if(action){
      const text=document.createRange();text.selectNodeContents(action.childNodes[0]);
      const arrow=action.querySelector('svg').getBoundingClientRect();
      add('map action label lines',text.getClientRects().length,1);
      add('map action arrow width',arrow.width,20);
      add('map action arrow right alignment',Math.abs(action.getBoundingClientRect().right-arrow.right-17),1);
    }
  }
  add('page horizontal overflow',document.documentElement.scrollWidth-document.documentElement.clientWidth,1);
  return {route:location.hash,width:innerWidth,checks};
}
