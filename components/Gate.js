'use client'
import {useEffect} from 'react'
import {Photo,Scrap,Stamp} from './Decor'
export function Welcome({onDone}){
 useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t)},[])
 return <div className="welcome serif">{'Welcome to the Garden of Poetry'.split(' ').map((w,i)=>
  <span key={i} style={{'--d':i*.16+'s','--r':[-5,3,-3,4,-4][i]+'deg','--x':[-8,5,-4,7,-5][i]+'px'}}>{w}</span>)}</div>}
// label, tab, caption, left, top, size, rotation
const W=[['POETRY','poetry','verse & fragments','12%','24%','clamp(2.8rem,8vw,5.8rem)','-4deg'],
 ['STORIES','stories','pages worth keeping','55%','13%','clamp(2.4rem,6.5vw,4.6rem)','3deg'],
 ['MUSIC','playlists','songs for the room','26%','60%','clamp(2.4rem,6vw,4.2rem)','-2deg'],
 ['ABOUT','about','who writes here','66%','56%','clamp(2rem,5vw,3.6rem)','5deg'],
 ['MEMORY','poetry','','5%','72%','clamp(1.4rem,3vw,2rem)','-6deg'],
 ['LETTERS','stories','','80%','34%','clamp(1.4rem,3vw,2rem)','4deg'],
 ['DREAMS','playlists','','44%','40%','clamp(1.3rem,2.6vw,1.8rem)','-3deg']]
export default function Gate({go}){
 return <div className="gate">
  <button className="gtitle hand" onClick={()=>go('poetry')}>Gulaal</button>
  {W.map(([l,t,c,x,y,s,r])=><button key={l} className="gw serif" style={{'--l':x,'--t':y,'--r':r,fontSize:s}} onClick={()=>go(t)}>{l}{c&&<small className="type">{c}</small>}</button>)}
  <span className="gx"><Photo n={2} cap="the way in" cls="abs" style={{left:'87%',top:'7%','--r':'5deg',width:130}}/></span>
  <span className="gx"><Scrap cls="abs n1" style={{left:'8%',top:'50%','--r':'-4deg'}}><span className="meta">LEFT ON THE DESK</span><span className="hand">come in, softly</span></Scrap></span>
  <a className="kt-link" href="/kiting">Kiting</a>
  <span className="gx"><Stamp t="ENTER" s="· quietly ·" style={{left:'84%',top:'74%','--r':'10deg'}}/></span></div>}
