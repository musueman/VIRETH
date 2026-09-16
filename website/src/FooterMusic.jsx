import React,{useEffect,useRef,useState} from 'react';
import {Pause,Play,SkipBack,SkipForward,SpeakerHigh} from '@phosphor-icons/react';

const tracks=[
 {title:'Rest Stop Beneath the Starlit Sky',src:'/assets/music/rest-stop.mp3'},
 {title:'Embracing Endless Horizons',src:'/assets/music/endless-horizons.mp3'},
 {title:'Gateways to the Vast Unknown',src:'/assets/music/gateways.mp3'},
];

function Equalizer({graph,playing,active}){
 const root=useRef(null);
 useEffect(()=>{
  const bars=[...root.current.children],motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let frame=0,last=0;
  const clear=()=>bars.forEach(bar=>{bar.style.transform='scaleY(.12)';});
  const draw=time=>{
   const analyser=graph.current?.analyser;
   if(analyser&&time-last>=70){
    const values=new Uint8Array(analyser.frequencyBinCount);analyser.getByteFrequencyData(values);
    const bins=[2,4,8,14,24,40];
    bars.forEach((bar,index)=>{bar.style.transform=`scaleY(${Math.max(.12,values[bins[index]]/255)})`;});last=time;
   }
   frame=requestAnimationFrame(draw);
  };
  const sync=()=>{
   cancelAnimationFrame(frame);clear();
   if(playing&&active&&!document.hidden&&!motion?.matches)frame=requestAnimationFrame(draw);
  };
  sync();document.addEventListener('visibilitychange',sync);motion?.addEventListener('change',sync);
  return()=>{cancelAnimationFrame(frame);clear();document.removeEventListener('visibilitychange',sync);motion?.removeEventListener('change',sync);};
 },[playing,active,graph]);
 return <span ref={root} className="music-equalizer" aria-hidden="true">{Array.from({length:6},(_,i)=><i key={i}/>)}</span>;
}

export function FooterMusic({active=true}){
 const audio=useRef(null),graph=useRef(null),wantsPlay=useRef(false),intent=useRef(0),current=useRef(0);
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[loading,setLoading]=useState(false);
 const [volume,setVolume]=useState(.35),[error,setError]=useState('');
 const volumeRef=useRef(volume);

 function prepareAudio(){
  if(graph.current)return graph.current.context.resume().catch(()=>{});
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context){audio.current.volume=volumeRef.current;return Promise.resolve();}
  let context;
  try{
   context=new Context();
   const analyser=context.createAnalyser(),gain=context.createGain();
   analyser.fftSize=256;analyser.smoothingTimeConstant=.8;gain.gain.value=volumeRef.current;
   const source=context.createMediaElementSource(audio.current);
   source.connect(analyser);analyser.connect(gain);gain.connect(context.destination);
   graph.current={context,analyser,gain,source};
   return context.resume().catch(()=>{});
  }catch{
   context?.close().catch(()=>{});audio.current.volume=volumeRef.current;
   return Promise.resolve();
  }
 }
 function start(){
  const ticket=++intent.current;wantsPlay.current=true;setError('');setLoading(true);
  const ready=prepareAudio();
  if(audio.current.error)audio.current.load();
  // Call play in the original tap/click, before awaiting, for mobile gesture policies.
  const playback=audio.current.play();
  Promise.all([ready,playback]).catch(()=>{
   if(ticket!==intent.current)return;
   wantsPlay.current=false;setPlaying(false);setLoading(false);setError('재생 버튼을 다시 눌러주세요.');
  });
 }
 function pause(){
  ++intent.current;wantsPlay.current=false;audio.current.pause();setPlaying(false);setLoading(false);
 }
 function changeTrack(next,continuePlaying=wantsPlay.current){
  ++intent.current;const value=(next+tracks.length)%tracks.length;
  current.current=value;setIndex(value);setPlaying(false);setError('');
  audio.current.pause();audio.current.src=tracks[value].src;audio.current.load();
  if(continuePlaying)start();else{wantsPlay.current=false;setLoading(false);}
 }
 function changeVolume(event){
  const value=Number(event.target.value);volumeRef.current=value;setVolume(value);
  if(graph.current)graph.current.gain.gain.value=value;else audio.current.volume=value;
 }
 useEffect(()=>()=>{
  ++intent.current;wantsPlay.current=false;
  const context=graph.current?.context;
  context?.close().catch(()=>{});graph.current=null;
 },[]);

 return <div className="footer-music" role="group" aria-label="비레스 배경음악" data-playing={playing}>
  {/* Track changes are applied once, synchronously in changeTrack. Updating this
      prop as well would reload the resource after play() and abort that request. */}
  <audio ref={audio} src={tracks[0].src} preload="none"
   onPlaying={()=>{if(wantsPlay.current){setPlaying(true);setLoading(false);}else audio.current.pause();}}
   onPause={()=>{if(audio.current.paused){wantsPlay.current=false;setPlaying(false);setLoading(false);}}} onWaiting={()=>{if(wantsPlay.current)setLoading(true);}}
   onEnded={()=>changeTrack(current.current+1,true)}
   onError={()=>{++intent.current;wantsPlay.current=false;setPlaying(false);setLoading(false);setError('음원을 불러오지 못했어요. 다시 재생하거나 다음 곡을 골라주세요.');}}/>
  <button className="music-previous music-control" aria-label="이전 곡" onClick={()=>changeTrack(current.current-1)}><SkipBack size={18} weight="fill"/></button>
  <button className="music-play music-control" aria-label={playing||loading?'배경음악 일시정지':'배경음악 재생'} aria-busy={loading} onClick={()=>wantsPlay.current?pause():start()}>
   {playing||loading?<Pause size={20} weight="fill"/>:<Play size={20} weight="fill"/>}
  </button>
  <div className="music-track">
   <span className="music-caption">VIRETH BGM <span>{String(index+1).padStart(2,'0')} / 03</span></span>
   <select aria-label="배경음악 선택" title={tracks[index].title} value={index} onChange={event=>changeTrack(Number(event.target.value))}>
    {tracks.map((track,i)=><option key={track.src} value={i}>{track.title}</option>)}
   </select>
  </div>
  <Equalizer graph={graph} playing={playing&&!loading} active={active}/>
  <button className="music-control" aria-label="다음 곡" onClick={()=>changeTrack(current.current+1)}><SkipForward size={18} weight="fill"/></button>
  <label className="music-volume"><SpeakerHigh size={18} aria-hidden="true"/><input aria-label="배경음악 음량" type="range" min="0" max="1" step=".05" value={volume} onChange={changeVolume}/></label>
  {error&&<p className="music-error" role="status">{error}</p>}
 </div>;
}
