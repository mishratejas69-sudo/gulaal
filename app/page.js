'use client'
import {useEffect,useState} from 'react'
import {sb} from '@/lib/supabase'
import SealIntro from '@/components/SealIntro'
import Background from '@/components/Background'
import FloatingWords from '@/components/FloatingWords'
import Nav from '@/components/Nav'
import PoetryCard from '@/components/PoetryCard'
import Reader from '@/components/Reader'
import PlaylistCard from '@/components/PlaylistCard'
import Gate,{Welcome} from '@/components/Gate'
import Decor,{Filler} from '@/components/Decor'
const q=t=>sb.from(t).select('*').order('created_at',{ascending:false})
export default function Home(){
 const [stage,setStage]=useState('intro'),open=stage=='site',[tab,setTab]=useState('poetry'),[d,setD]=useState({poems:[],stories:[],playlists:[],about:null}),[sel,setSel]=useState(null)
 useEffect(()=>{Promise.all([q('poems'),q('stories'),q('playlists'),sb.from('about').select('*').limit(1)]).then(([a,b,c,e])=>setD({poems:a.data||[],stories:b.data||[],playlists:c.data||[],about:e.data?.[0]}))},[])
 useEffect(()=>{if(new URLSearchParams(location.search).has('gate')){setStage('gate');history.replaceState(null,'','/')}},[])
 useEffect(()=>{const p=new URLSearchParams(location.search),id=p.get('poem')||p.get('story');if(!id)return;setStage('site')
  const f=[...d.poems.map(x=>({...x,_t:'poem'})),...d.stories.map(x=>({...x,_t:'story'}))].find(x=>x.id==id);if(f)setSel(f)},[d])
 const empty=<p className="hand" style={{fontSize:'1.6rem'}}>nothing here yet — the shelves are still being filled…</p>
 return <div className="grain">
  {(stage=='intro'||stage=='welcome')&&<SealIntro onDone={()=>setStage('welcome')}/>}{stage=='welcome'&&<Welcome onDone={()=>setStage('gate')}/>}{stage=='gate'&&<Gate go={t=>{setTab(t);setStage('site')}}/>}
  <Background/><FloatingWords/>
  {open&&<><Nav tab={tab} setTab={setTab} onHome={()=>setStage('gate')}/>
  <main key={tab} style={{position:'relative',animation:'fade 1.2s'}}>
   <Decor tab={tab}/><style>{'@keyframes fade{from{opacity:0;transform:translateY(20px) rotateX(4deg)}}'}</style>
   {tab=='poetry'&&<div className="scatter"><span className="note" style={{left:'4%',top:-40}}>found between pages</span>
    {d.poems.length?d.poems.map((p,i)=>[<PoetryCard key={p.id} p={p} i={i} onOpen={x=>setSel({...x,_t:'poem'})}/>,i%2==0&&<Filler key={'f'+i} k={i/2}/>]):empty}</div>}
   {tab=='stories'&&<div className="scatter">{d.stories.length?d.stories.map((s,i)=>
    <article key={s.id} className="paper book" onClick={()=>setSel({...s,_t:'story'})} style={{width:[420,320,380][i%3],'--r':[1.5,-2,.5][i%3]+'deg',marginTop:i%2*40,display:'flex',gap:'1rem'}}>
     {s.cover_image&&<img src={s.cover_image} alt="" loading="lazy" style={{width:90,height:130,objectFit:'cover',boxShadow:'4px 4px 10px #0006'}}/>}
     <div><p className="meta">{s.date}</p><h3>{s.title}</h3><p>{s.description}</p></div></article>):empty}</div>}
   {tab=='playlists'&&<div className="scatter">{d.playlists.length?d.playlists.map((p,i)=><PlaylistCard key={p.id} p={p} i={i}/>):empty}</div>}
   {tab=='about'&&<div className="paper" style={{maxWidth:520,margin:'0 auto','--r':'-1deg',cursor:'default'}}>
    <h3 className="hand" style={{fontSize:'2.6rem'}}>Gulaal 🥀</h3><p className="meta">POET · WRITER · DISCORD CREATOR</p>
    <p style={{margin:'1rem 0',whiteSpace:'pre-wrap'}}>{d.about?.content||''}</p>
    {Object.entries(d.about?.social_links||{}).map(([k,v])=><a key={k} href={v} className="tag" target="_blank" rel="noreferrer">{k}</a>)}</div>}
  </main>
  <footer className="hand" style={{position:'relative',zIndex:5,textAlign:'center',padding:'2rem',opacity:.6}}>— Gulaal 🥀 <a className="kt-link inl" href="/kiting">Kiting</a></footer></>}
  {sel&&<Reader item={sel} type={sel._t} onClose={()=>{setSel(null);if(location.search)history.replaceState(null,'','/')}}/>}
 </div>}
