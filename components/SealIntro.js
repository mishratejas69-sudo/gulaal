'use client'
import {useState} from 'react'
export default function SealIntro({onDone}){
 const [s,setS]=useState(0)
 const sparks=Array.from({length:14},(_,k)=>({x:(Math.random()-.5)*240+'px',y:(Math.random()-.8)*200+'px',k}))
 const go=()=>{if(s)return;setS(1);setTimeout(()=>setS(2),350);setTimeout(()=>{setS(3);onDone()},1500)}
 return <div className={'intro '+(s==3?'out':'')}>
  <div className={'env '+(s>=3?'open':'')}>
   <button className={'seal '+(s==1?'shake':'')+(s>=2?' crack':'')} onClick={go} aria-label="Break the seal">
    {[0,1,2,3].map(i=><span key={i} className="p">{i==0?'🥀':''}</span>)}
    {s>=1&&sparks.map(p=><i key={p.k} className="spark" style={{'--x':p.x,'--y':p.y}}/>)}
   </button>
  </div>
  {!s&&<p className="hint">Break the seal.</p>}
 </div>}
