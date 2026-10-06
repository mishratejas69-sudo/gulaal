'use client'
import {useEffect,useState} from 'react'
const N=5
const POS=['50% 38%','50% 28%','50% 45%','50% 84%','50% 82%'] // focal point: desktop crops portrait images to a strip
export default function Background(){
 const [i,setI]=useState(0),[prev,setPrev]=useState(-1),[ready,setReady]=useState(false)
 useEffect(()=>{ // preload everything first -> no broken-image flash while crossfading
  let ok=0,dead=false;for(let k=1;k<=N;k++){const im=new Image();im.onload=im.onerror=()=>{if(++ok==N&&!dead)setReady(true)};im.src=`/bg/${k}.webp`}
  return()=>{dead=true}},[])
 useEffect(()=>{
  if(!ready)return
  const t=setInterval(()=>setI(v=>{setPrev(v);return(v+1)%N}),10000)
  const fine=matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches
  const mv=e=>{if(fine){const b=document.querySelector('.bg');b.style.setProperty('--mx',(e.clientX/innerWidth-.5)*-18+'px');b.style.setProperty('--my',(e.clientY/innerHeight-.5)*-12+'px')}}
  addEventListener('mousemove',mv);return()=>{clearInterval(t);removeEventListener('mousemove',mv)}},[ready])
 return <div className="bg">{Array.from({length:N},(_,k)=><i key={k} className={ready?(k==i?'on':k==prev?'out':''):''} style={{backgroundImage:`url(/bg/${k+1}.webp)`,backgroundPosition:POS[k]}}/>)}</div>}
