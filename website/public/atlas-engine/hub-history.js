// Only embedded navigation is isolated; the upstream navigator and camera stack
// remain unchanged. Native iframe traversal shares the host's session history.
(()=>{
  if(window.parent===window)return;
  const nativeReplace=history.replaceState.bind(history);
  let entries=[{state:history.state,url:location.href}],index=0;
  history.replaceState=(state,title,url)=>{
    nativeReplace(state,title,url);
    entries[index]={state,url:url??entries[index].url};
  };
  history.pushState=(state,title,url)=>{
    nativeReplace(state,title,url);
    entries=entries.slice(0,index+1);
    entries.push({state,url:url??entries[index].url});index++;
  };
  history.go=delta=>{
    const next=index+Number(delta);
    if(!Number.isInteger(next)||next<0||next>=entries.length||next===index)return;
    index=next;const entry=entries[index];
    nativeReplace(entry.state,'',entry.url);
    window.dispatchEvent(new PopStateEvent('popstate',{state:entry.state}));
  };
  history.back=()=>history.go(-1);
  history.forward=()=>history.go(1);
})();
