import {useEffect,useRef,useState} from 'react';

// Pointer focus must not latch autoplay off after the pointer leaves.
// Keep keyboard focus intact, and never change the user's explicit pause state.
export function useSliderInteraction(root){
 const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const modality=useRef('keyboard'),gesture=useRef(null),suppressClick=useRef(false);
 useEffect(()=>{
  const keyboard=event=>{
   if(['Shift','Control','Alt','Meta'].includes(event.key))return;
   modality.current='keyboard';suppressClick.current=false;
   if(root.current?.contains(document.activeElement))setFocused(true);
  };
  const pointer=()=>{modality.current='pointer';setFocused(false);suppressClick.current=false;};
  const move=event=>{
   const start=gesture.current;
   if(start&&start.id===event.pointerId&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)start.moved=true;
  };
  const end=event=>{
   if(!gesture.current||gesture.current.id!==event.pointerId)return;
   move(event);suppressClick.current=gesture.current.moved;gesture.current=null;
  };
  const cancel=()=>{gesture.current=null;suppressClick.current=false;};
  const blur=()=>{cancel();setHovered(false);};
  document.addEventListener('keydown',keyboard,true);
  document.addEventListener('pointerdown',pointer,true);
  document.addEventListener('pointermove',move);
  document.addEventListener('pointerup',end);
  document.addEventListener('pointercancel',cancel);
  window.addEventListener('blur',blur);
  return()=>{
   document.removeEventListener('keydown',keyboard,true);
   document.removeEventListener('pointerdown',pointer,true);
   document.removeEventListener('pointermove',move);
   document.removeEventListener('pointerup',end);
   document.removeEventListener('pointercancel',cancel);
   window.removeEventListener('blur',blur);
  };
 },[root]);
 return {hovered,focused,clearFocus:()=>setFocused(false),handlers:{
  onMouseEnter:()=>setHovered(true),onMouseLeave:()=>setHovered(false),
  onFocusCapture:()=>setFocused(modality.current==='keyboard'),
  onBlurCapture:event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);},
  onPointerDownCapture:event=>{gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};},
  onDragStart:event=>event.preventDefault(),
  onClickCapture:event=>{if(suppressClick.current){suppressClick.current=false;event.preventDefault();event.stopPropagation();}}
 }};
}
