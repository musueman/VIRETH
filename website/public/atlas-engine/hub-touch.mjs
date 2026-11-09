// Host input layer. Original rendering, navigation, bounds and zoom limits own the camera.
export function installAtlasTouch({map,viewport,nav,metrics,camera,cancelCamera,
  requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame}) {
  const points=new Map(),listeners=[];
  let baseline=null,pending=null,frame=null,suppressClick=false;
  const stop=e=>{e.stopImmediatePropagation();};
  const ready=()=>map.dataset.loadState==='ready'&&!viewport.dataset.traveling;
  const release=id=>{try{if(map.hasPointerCapture(id))map.releasePointerCapture(id);}catch{/* Already cancelled by browser. */}};
  const capture=()=>{for(const id of points.keys())try{map.setPointerCapture(id);}catch{/* Pointer already released. */}};
  function flush(){
    if(frame!==null)cancelFrame(frame);frame=null;
    const next=pending;pending=null;
    if(next&&next.id===nav.current().id&&ready()){nav.update(next.patch);camera();}
  }
  function reset(){
    if(frame!==null)cancelFrame(frame);frame=null;pending=null;baseline=null;
    const ids=[...points.keys()];points.clear();ids.forEach(release);
  }
  function rebase(){
    const pair=[...points.values()].slice(0,2),s=nav.current(),rect=viewport.getBoundingClientRect();
    if(!pair.length){baseline=null;return;}
    const mid=pair.length===2?[(pair[0][0]+pair[1][0])/2,(pair[0][1]+pair[1][1])/2]:pair[0];
    baseline={state:s,mid,distance:pair.length===2?Math.hypot(pair[1][0]-pair[0][0],pair[1][1]-pair[0][1]):0,
      origin:[rect.left+rect.width/2,rect.top+rect.height/2],fit:metrics().fit,pinch:pair.length===2};
  }
  function update(){
    if(!baseline||baseline.state.id!==nav.current().id||!ready()){reset();return;}
    const pair=[...points.values()].slice(0,2),b=baseline,s=b.state;
    const mid=pair.length===2?[(pair[0][0]+pair[1][0])/2,(pair[0][1]+pair[1][1])/2]:pair[0];
    if(!mid||b.fit<=0)return;
    if(!b.pinch&&!suppressClick&&Math.hypot(mid[0]-b.mid[0],mid[1]-b.mid[1])<5)return;
    suppressClick=true;capture();
    const distance=pair.length===2?Math.hypot(pair[1][0]-pair[0][0],pair[1][1]-pair[0][1]):0;
    // Coincident fingers have no meaningful scale; rebase once they separate.
    if(b.pinch&&b.distance<1){rebase();return;}
    const zoom=Math.max(1,Math.min(metrics().max,b.pinch?s.zoom*distance/b.distance:s.zoom));
    const center=b.mid.map((start,i)=>{
      const anchor=s.center[i]+(start-b.origin[i])/(b.fit*s.zoom);
      return Math.max(s.bounds[i],Math.min(s.bounds[i]+s.bounds[i+2],anchor-(mid[i]-b.origin[i])/(b.fit*zoom)));
    });
    pending={id:s.id,patch:{zoom,center}};
    if(frame===null)frame=requestFrame(flush);
  }
  function down(e){
    if(e.pointerType!=='touch'){if(!points.size)suppressClick=false;return;}
    stop(e);if(!ready())return;
    const hint=map.closest('.map-panel')?.querySelector('.hint');
    if(hint)hint.textContent='한 손가락으로 이동 · 두 손가락으로 확대·축소 · 구획을 가볍게 눌러 상세도로 이동';
    flush();cancelCamera();
    if(!points.size)suppressClick=false;
    points.set(e.pointerId,[e.clientX,e.clientY]);
    if(points.size>1){suppressClick=true;capture();}
    rebase();
  }
  function move(e){
    if(e.pointerType!=='touch')return;stop(e);
    if(!points.has(e.pointerId))return;
    e.preventDefault();points.set(e.pointerId,[e.clientX,e.clientY]);update();
  }
  function end(e){
    // A child loses implicit capture when we intentionally capture on the SVG.
    // That bubbling notification is not the end of the still-active finger.
    if(e.type==='lostpointercapture'&&e.target!==map)return;
    if(e.pointerType!=='touch'&&!points.has(e.pointerId))return;stop(e);
    if(!points.has(e.pointerId))return;
    if(e.type==='pointerup'){points.set(e.pointerId,[e.clientX,e.clientY]);update();}
    else suppressClick=true;
    flush();points.delete(e.pointerId);release(e.pointerId);rebase();
  }
  function listen(target,type,fn,options){target.addEventListener(type,fn,options);listeners.push(()=>target.removeEventListener(type,fn,options));}
  for(const [type,fn] of [['pointerdown',down],['pointermove',move],['pointerup',end],['pointercancel',end],['lostpointercapture',end]])listen(map,type,fn,{capture:true,passive:false});
  listen(map,'click',e=>{if(suppressClick&&e.detail!==0){e.preventDefault();stop(e);}},{capture:true});
  const interrupted=()=>{if(points.size)suppressClick=true;flush();reset();};
  listen(window,'blur',interrupted);listen(window,'pagehide',interrupted);listen(window,'resize',interrupted);
  listen(document,'visibilitychange',()=>{if(document.hidden)interrupted();});
  const observer=new MutationObserver(()=>{if(baseline&&(map.dataset.mapId!==baseline.state.id||!ready()))interrupted();});
  observer.observe(map,{attributes:true,attributeFilter:['data-map-id','data-load-state']});
  return ()=>{interrupted();observer.disconnect();listeners.forEach(remove=>remove());};
}
