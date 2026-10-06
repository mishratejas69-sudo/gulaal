'use client'
import {useEffect} from 'react'
import useDecor from '@/lib/useDecor'
// Scenes for photograph placeholders (swap for real images in /public/photos/*.jpg via `src`)
const SC=['radial-gradient(circle at 70% 30%,#f2d9a0 0 8%,#0000 9%),linear-gradient(#3a2618,#14100c)','linear-gradient(#0000 55%,#2f3d2e 56%),linear-gradient(#c47f2c,#3a2618)','radial-gradient(circle at 30% 40%,#e8d9b5 0 6%,#0000 7%),linear-gradient(#1d2a30,#0d0806)']
export const Photo=({n=0,cap,src,style,cls='',sp})=><figure className={'photo '+cls} style={style} data-sp={sp}>
 <div style={{background:src?`url(${src}) center/cover`:SC[n%3]}}/><figcaption className="hand">{cap}</figcaption></figure>
export const Scrap=({children,style,cls='',...r})=><div className={'scrap '+cls} style={style} data-sp={r['data-sp']}>{children}</div>
export const Stamp=({t='GULAAL',s,style})=><div className="stamp type" style={style}>{t}<br/><small>{s}</small></div>
export const Bookmark=({style})=><div className="bookmark" style={style}/>
export const Quote=({children,style})=><p className="fquote serif" style={style}>{children}</p>
// Inline fillers placed between cards so rows never look like a grid
const F=[
 d=><Scrap cls="n1" style={{'--r':'-4deg',marginLeft:'-2rem'}}><span className="hand">{d('poetry','note',1,"don't forget the rain")}</span><span className="meta">p. 14</span></Scrap>,
 d=><Photo n={0} cap={d('poetry','caption',1,'the window, 2 AM')} style={{'--r':'3deg',width:150,marginTop:'-1rem'}}/>,
 d=><Quote style={{maxWidth:240,'--r':'-1deg'}}>{d('poetry','quote',1,'“some words stay in the room long after you leave.”')}</Quote>,
 d=><Stamp t={d('poetry','stamp',1,'FROM THE ARCHIVE')} s="· no. 07 ·" style={{'--r':'-8deg',marginTop:'2rem'}}/>,
 d=><Scrap cls="n2" style={{'--r':'2deg'}}><span className="meta">{d('poetry','label',2,'UNSENT — MIDNIGHT')}</span><span className="hand">{d('poetry','note',2,'to whoever finds this')}</span></Scrap>,
 d=><Photo n={1} cap={d('poetry','caption',2,'somewhere on the road')} style={{'--r':'-3deg',width:170}}/>,
]
export const Filler=({k})=>{const d=useDecor();return <div className="filler">{F[k%F.length](d)}</div>}
// Absolutely-positioned scatter behind/around content + scroll parallax
export default function Decor({tab}){
 const d=useDecor()
 useEffect(()=>{
  if(matchMedia('(max-width:700px),(prefers-reduced-motion:reduce)').matches)return
  let r;const f=()=>{r=0;document.querySelectorAll('[data-sp]').forEach(e=>e.style.translate=`0 ${-scrollY*e.dataset.sp}px`)}
  const on=()=>r||(r=requestAnimationFrame(f));addEventListener('scroll',on,{passive:true});return()=>removeEventListener('scroll',on)},[tab])
 const L={
  poetry:<>
   <Photo n={2} cap={d('poetry','caption',0,'moon over the shelf')} style={{left:'-3%',top:'42%','--r':'-5deg',width:150}} cls="abs" sp=".08"/>
   <Scrap cls="abs n1" style={{right:'1%',top:'6%','--r':'5deg'}} data-sp=".12"><span className="meta">{d('poetry','label',0,'MIDNIGHT THOUGHT')}</span><span className="hand">{d('poetry','note',0,'it was never about the moon')}</span></Scrap>
   <Stamp t={d('poetry','stamp',0,'POSTED')} s="OCT · 1962" style={{right:'4%',top:'55%','--r':'12deg'}}/>
   <Bookmark style={{left:'6%',top:'-40px'}}/>
   <Quote style={{position:'absolute',right:'8%',bottom:'4%',maxWidth:260,'--r':'2deg'}}>{d('poetry','quote',0,'“write it down before the morning takes it.”')}</Quote>
   <span className="bigword serif" style={{left:'30%',top:'30%'}}>memory</span></>,
  stories:<>
   <Photo n={1} cap={d('stories','caption',0,'the last chapter')} style={{right:'2%',top:'8%','--r':'4deg',width:160}} cls="abs"/>
   <Scrap cls="abs n2" style={{left:'0',bottom:'8%','--r':'-3deg'}}><span className="meta">{d('stories','label',0,'FOUND BETWEEN PAGES')}</span><span className="hand">{d('stories','note',0,'chapter 3 smells like rain')}</span></Scrap>
   <Bookmark style={{right:'12%',top:'-40px'}}/><Quote style={{position:'absolute',left:'8%',top:'38%',maxWidth:240,'--r':'-2deg'}}>{d('stories','quote',0,'“every ending is a door left slightly open.”')}</Quote><span className="bigword serif" style={{left:'45%',top:'55%'}}>once</span></>,
  playlists:<>
   <Scrap cls="abs n1" style={{left:'2%',top:'4.4rem','--r':'-2deg'}}><span className="meta">{d('playlists','label',0,'CURRENTLY LISTENING')}</span><span className="hand">{d('playlists','note',0,'♪ something slow & rainy')}</span></Scrap>
   <Stamp t={d('playlists','stamp',0,'SIDE A')} s="· 33⅓ ·" style={{right:'6%',top:'40%','--r':'-10deg'}}/>
   <Photo n={0} cap={d('playlists','caption',0,'songs for 2 AM')} style={{right:'1%',bottom:'6%','--r':'5deg',width:150}} cls="abs"/>
   <span className="bigword serif" style={{left:'10%',top:'60%'}}>echo</span></>,
  about:<>
   <Photo n={2} cap={d('about','caption',0,'me, probably')} style={{left:'6%',top:'12%','--r':'-6deg',width:170}} cls="abs"/>
   <Stamp t={d('about','stamp',0,'GULAAL 🥀')} s="EST. MIDNIGHT" style={{right:'8%',top:'10%','--r':'9deg'}}/>
   <Scrap cls="abs n2" style={{right:'4%',bottom:'10%','--r':'4deg'}}><span className="hand">{d('about','note',0,'thanks for staying a while')}</span></Scrap>
   <Bookmark style={{left:'48%',top:'-40px'}}/><Quote style={{position:'absolute',left:'10%',bottom:'6%',maxWidth:240,'--r':'2deg'}}>{d('about','quote',0,'“I keep my small sadnesses in the margins.”')}</Quote></>}
 return <div className="decor" aria-hidden>{L[tab]}</div>}
