import React,{useLayoutEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {X} from '@phosphor-icons/react';

export function AtlasResetDialog({name,openerRef,onCancel,onConfirm}){
  const backdrop=useRef(null),panel=useRef(null),cancel=useRef(null);
  const cancelAction=useRef(onCancel);cancelAction.current=onCancel;
  useLayoutEffect(()=>{
    const html=document.documentElement;
    const previous={overflow:html.style.overflow,gutter:html.style.scrollbarGutter};
    html.style.scrollbarGutter='stable';html.style.overflow='hidden';
    const background=[...document.body.children].filter(el=>el!==backdrop.current&&!['SCRIPT','STYLE'].includes(el.tagName));
    const states=background.map(el=>({el,inert:el.inert}));
    background.forEach(el=>{el.inert=true;});
    cancel.current.focus({preventScroll:true});
    const key=event=>{
      if(event.key==='Escape'){event.preventDefault();cancelAction.current();return;}
      if(event.key!=='Tab')return;
      const buttons=[...panel.current.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);
      if(event.shiftKey&&(document.activeElement===first||!buttons.includes(document.activeElement))){event.preventDefault();last.focus({preventScroll:true});}
      else if(!event.shiftKey&&(document.activeElement===last||!buttons.includes(document.activeElement))){event.preventDefault();first.focus({preventScroll:true});}
    };
    document.addEventListener('keydown',key);
    return()=>{
      document.removeEventListener('keydown',key);
      states.forEach(({el,inert})=>{el.inert=inert;});
      html.style.overflow=previous.overflow;html.style.scrollbarGutter=previous.gutter;
      if(openerRef.current?.isConnected)openerRef.current.focus({preventScroll:true});
    };
  },[openerRef]);
  return createPortal(<div ref={backdrop} className="notice-backdrop atlas-reset-backdrop">
    <section ref={panel} className="notice atlas-reset-dialog" role="dialog" aria-modal="true" aria-labelledby="atlas-reset-title" aria-describedby="atlas-reset-description">
      <button type="button" className="notice-close" aria-label="확인창 닫기" onClick={onCancel}><X size={24}/></button>
      <p className="notice-eyebrow">VIRETH ATLAS</p>
      <h2 id="atlas-reset-title">{name} 지도를 처음부터 볼까요?</h2>
      <p id="atlas-reset-description">저장된 하위 지도와 확대·이동 위치가 초기화됩니다. 다른 나라의 기록은 유지됩니다.</p>
      <div className="reset-dialog-actions">
        <button ref={cancel} type="button" onClick={onCancel}>계속 둘러보기</button>
        <button type="button" className="reset-dialog-confirm" onClick={onConfirm}>초기화하기</button>
      </div>
    </section>
  </div>,document.body);
}
