'use client'
import {useEffect,useRef,useState} from 'react'
import Background from '@/components/Background'
const today=()=>new Date().toISOString().slice(0,10)
async function api(p,body){
 const r=await fetch('/api/kiting/'+p,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin',cache:'no-store'})
 const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'Something went wrong.'),{status:r.status});return j}
const pick=(r,ks)=>Object.fromEntries(ks.map(k=>[k,r[k]??'']))
const CFG={
 poems:{name:'Poetry',one:'Poem',head:r=>r.title,sub:r=>r.date,pv:1,
  fields:[['title','Title'],['date','Date','date'],['tags','Tags (comma separated)'],['cover_image','Cover image URL (optional)'],['author','Author'],['content','Poem','area']],
  blank:()=>({title:'',date:today(),tags:'',cover_image:'',author:'Gulaal 🥀',content:''}),
  toForm:r=>({...pick(r,['title','date','cover_image','author','content']),tags:(r.tags||[]).join(', ')}),toRow:f=>({...f,tags:f.tags.split(',').map(s=>s.trim()).filter(Boolean)})},
 stories:{name:'Stories',one:'Story',head:r=>r.title,sub:r=>r.date,pv:1,
  fields:[['title','Title'],['date','Date','date'],['description','Short description','area2'],['cover_image','Cover image URL (optional)'],['content','Story','area']],
  blank:()=>({title:'',date:today(),description:'',cover_image:'',content:''}),toForm:r=>pick(r,['title','date','description','cover_image','content']),toRow:f=>f},
 playlists:{name:'Music',one:'Playlist',head:r=>r.title,sub:r=>r.spotify_url?.replace('https://open.spotify.com/',''),
  fields:[['title','Playlist title'],['spotify_url','Spotify link (playlist, album, track…)'],['description','Description','area2'],['cover_image','Cover image URL (optional)']],
  blank:()=>({title:'',spotify_url:'',description:'',cover_image:''}),toForm:r=>pick(r,['title','spotify_url','description','cover_image']),toRow:f=>f},
 site_decor:{name:'Atmosphere',one:'Fragment',head:r=>r.text,sub:r=>`${r.section} · ${r.element_type}${r.is_active?'':' · off'}`,
  fields:[['section','Section','sel:global,poetry,stories,playlists,about'],['element_type','Type','sel:quote,note,caption,stamp,label,annotation'],['text','Text (max 160)'],['position_key','Slot pin (optional, e.g. poetry.caption-0)'],['is_active','Showing on the site','chk']],
  blank:()=>({section:'global',element_type:'note',text:'',position_key:'',is_active:true}),toForm:r=>({...pick(r,['section','element_type','text','position_key']),is_active:r.is_active!==false}),toRow:f=>f}}
const Field=({d,v,on})=>{const [k,l,t='']=d,id='f_'+k
 return <label className="kt-f" htmlFor={id}><span className="type">{l}</span>
  {t=='area'?<textarea id={id} rows={12} value={v} onChange={e=>on(k,e.target.value)}/>:t=='area2'?<textarea id={id} rows={3} value={v} onChange={e=>on(k,e.target.value)}/>
  :t.startsWith('sel:')?<select id={id} value={v} onChange={e=>on(k,e.target.value)}>{t.slice(4).split(',').map(x=><option key={x}>{x}</option>)}</select>
  :t=='chk'?<input id={id} type="checkbox" checked={!!v} onChange={e=>on(k,e.target.checked)}/>
  :<input id={id} type={t||'text'} value={v} onChange={e=>on(k,e.target.value)}/>}</label>}
function Crud({table,notify,setDirty,lost}){
 const c=CFG[table],[rows,setRows]=useState(null),[sel,setSel]=useState(null),[f,setF]=useState(null),[o,setO]=useState(null),[busy,setBusy]=useState(false),[ask,setAsk]=useState(false),[pv,setPv]=useState(false),ed=useRef()
 const dirty=!!f&&JSON.stringify(f)!==JSON.stringify(o)
 useEffect(()=>{setDirty(dirty);return()=>setDirty(false)},[dirty])
 const fail=e=>e.status==401?lost():notify('err',e.message)
 useEffect(()=>{api('data?t='+table).then(r=>setRows(r.rows)).catch(fail)},[table])
 const open=r=>{if(dirty&&!confirm('Discard your unsaved changes?'))return;const v=r?c.toForm(r):c.blank();setSel(r?r.id:'new');setF(v);setO(v);setAsk(false);setPv(false);setTimeout(()=>ed.current?.scrollIntoView({behavior:'smooth',block:'start'}),60)}
 const save=async()=>{setBusy(true);try{const {row}=await api('save',{table,id:sel=='new'?undefined:sel,row:c.toRow(f)});const v=c.toForm(row);setRows(rs=>sel=='new'?[row,...rs]:rs.map(x=>x.id==row.id?row:x));setSel(row.id);setF(v);setO(v);notify('ok',`${c.one} saved.`)}catch(e){fail(e)}setBusy(false)}
 const del=async()=>{setBusy(true);try{await api('delete',{table,id:sel});setRows(rs=>rs.filter(x=>x.id!=sel));setSel(null);setF(null);setO(null);setAsk(false);notify('ok',`${c.one} deleted.`)}catch(e){fail(e)}setBusy(false)}
 const on=(k,v)=>setF({...f,[k]:v})
 return <div className="kt-two"><aside className="kt-list"><button className="kt-btn gold" onClick={()=>open(null)}>+ New {c.one.toLowerCase()}</button>
  {rows==null?<p className="hand">opening the drawer…</p>:!rows.length?<p className="hand">nothing here yet</p>:rows.map(r=><button key={r.id} className={'kt-slip'+(sel==r.id?' on':'')} onClick={()=>open(r)}><b className="serif">{c.head(r)}</b><small className="type">{c.sub(r)}</small></button>)}</aside>
  <section ref={ed} className="kt-paper">{!f?<p className="hand kt-big">Choose an entry, or begin a new one.</p>:<>
   <p className="meta">{sel=='new'?`NEW ${c.one.toUpperCase()}`:`EDITING ${c.one.toUpperCase()}`} · <b className={dirty?'kt-un':'kt-sv'}>{dirty?'● unsaved':'✓ saved'}</b></p>
   {c.fields.map(d=><Field key={d[0]} d={d} v={f[d[0]]} on={on}/>)}
   {pv&&c.pv&&<div className="paper kt-pv"><p className="meta">{f.date}</p><h3>{f.title||'Untitled'}</h3>{f.description&&<p><i>{f.description}</i></p>}<pre>{f.content}</pre>{table=='poems'&&<p className="hand" style={{fontSize:'1.5rem'}}>— {f.author}</p>}</div>}
   <div className="kt-bar"><button className="kt-btn gold" disabled={busy||!dirty} onClick={save}>{busy?'Saving…':'Save'}</button>
    {c.pv&&<button className="kt-btn" onClick={()=>setPv(!pv)}>{pv?'Hide preview':'Preview'}</button>}
    {dirty&&sel!='new'&&<button className="kt-btn" onClick={()=>setF(o)}>Revert</button>}
    {sel!='new'&&(!ask?<button className="kt-btn red" onClick={()=>setAsk(true)}>Delete…</button>:<span className="kt-ask">Delete this for good? <button className="kt-btn red" disabled={busy} onClick={del}>Yes, delete</button><button className="kt-btn" onClick={()=>setAsk(false)}>Keep</button></span>)}</div></>}</section></div>}
function About({notify,setDirty,lost}){
 const [f,setF]=useState(null),[o,setO]=useState(null),[busy,setBusy]=useState(false)
 const tf=r=>({content:r?.content||'',links:Object.entries(r?.social_links||{})})
 useEffect(()=>{api('data?t=about').then(r=>{const v=tf(r.rows[0]);setF(v);setO(v)}).catch(e=>e.status==401?lost():notify('err',e.message))},[])
 const dirty=!!f&&JSON.stringify(f)!==JSON.stringify(o);useEffect(()=>{setDirty(dirty);return()=>setDirty(false)},[dirty])
 const save=async()=>{setBusy(true);try{const {row}=await api('save',{table:'about',row:{content:f.content,social_links:Object.fromEntries(f.links.filter(([k,v])=>k.trim()||v.trim()))}});const v=tf(row);setF(v);setO(v);notify('ok','About saved.')}catch(e){e.status==401?lost():notify('err',e.message)}setBusy(false)}
 if(!f)return <p className="hand">opening the drawer…</p>
 const setL=(i,j,v)=>setF({...f,links:f.links.map((l,x)=>x==i?l.map((y,z)=>z==j?v:y):l)})
 return <section className="kt-paper kt-one"><p className="meta">ABOUT ME · <b className={dirty?'kt-un':'kt-sv'}>{dirty?'● unsaved':'✓ saved'}</b></p>
  <label className="kt-f"><span className="type">Your words</span><textarea rows={10} value={f.content} onChange={e=>setF({...f,content:e.target.value})}/></label>
  <p className="type" style={{fontSize:'.8rem'}}>Links</p>{f.links.map(([k,v],i)=><div key={i} className="kt-lk"><input placeholder="name (discord)" value={k} onChange={e=>setL(i,0,e.target.value)}/><input placeholder="https://…" value={v} onChange={e=>setL(i,1,e.target.value)}/><button className="kt-btn" onClick={()=>setF({...f,links:f.links.filter((_,x)=>x!=i)})}>×</button></div>)}
  <div className="kt-bar"><button className="kt-btn" onClick={()=>setF({...f,links:[...f.links,['','']]})}>+ link</button><button className="kt-btn gold" disabled={busy||!dirty} onClick={save}>{busy?'Saving…':'Save'}</button></div></section>}
function Comments({notify,lost}){
 const [rows,setRows]=useState(null),[t,setT]=useState({}),[ask,setAsk]=useState(null)
 useEffect(()=>{(async()=>{try{const [c,p,s]=await Promise.all(['comments','poems','stories'].map(x=>api('data?t='+x)));setT(Object.fromEntries([...p.rows,...s.rows].map(x=>[x.id,x.title])));setRows(c.rows)}catch(e){e.status==401?lost():notify('err',e.message)}})()},[])
 const del=async id=>{try{await api('delete_comment',{id});setRows(r=>r.filter(x=>x.id!=id));setAsk(null);notify('ok','Comment removed.')}catch(e){e.status==401?lost():notify('err',e.message)}}
 return <section className="kt-paper kt-one"><p className="meta">COMMENTS · {rows?.length??'…'}</p>{rows&&!rows.length&&<p className="hand kt-big">No notes left yet.</p>}
  {rows?.map(r=><div key={r.id} className="kt-cm"><div><b className="type">{r.username}</b> <small className="meta">on “{t[r.content_id]||'(removed)'}” · {new Date(r.created_at).toLocaleString()}</small><p>{r.comment}</p></div>
   {ask==r.id?<span className="kt-ask"><button className="kt-btn red" onClick={()=>del(r.id)}>Yes, remove</button><button className="kt-btn" onClick={()=>setAsk(null)}>Keep</button></span>:<button className="kt-btn red" onClick={()=>setAsk(r.id)}>Delete…</button>}</div>)}</section>}
function Dash({go,lost,notify}){
 const [c,setC]=useState(null);useEffect(()=>{api('counts').then(r=>setC(r.counts)).catch(e=>e.status==401?lost():notify('err',e.message))},[])
 const L=[['poems','Poems','poems'],['stories','Stories','stories'],['playlists','Playlists','playlists'],['site_decor','Fragments','site_decor'],['comments','Comments','comments']]
 return <section className="kt-paper kt-one"><h2 className="hand">Good evening, Gulaal 🥀</h2><p>Your desk. Everything you save here appears on the site the next time someone opens it.</p>
  <div className="kt-ledger">{L.map(([k,n,t])=><button key={k} className="kt-slip" onClick={()=>go(t)}><b className="serif" style={{fontSize:'2rem'}}>{c?c[k]:'·'}</b><small className="type">{n}</small></button>)}</div></section>}
function Login({onIn,note,configured}){
 const [p,setP]=useState(''),[e,setE]=useState(note||''),[b,setB]=useState(false)
 const go=async ev=>{ev.preventDefault();setB(true);setE('');try{await api('login',{password:p});setP('');onIn()}catch(x){setE(x.message)}setB(false)}
 return <div className="kt-login"><form className="paper kt-lp" onSubmit={go}><span className="pinhead"/><p className="meta">PRIVATE</p><h2 className="hand">Kiting</h2><p className="serif" style={{fontSize:'1.2rem'}}>The writer’s desk. Say the word.</p>
  <input type="password" autoFocus autoComplete="current-password" placeholder="password" value={p} onChange={x=>setP(x.target.value)}/>
  {!configured&&<p className="kt-un">Not configured: set KITING_ADMIN_EMAIL on the server.</p>}{e&&<p className="kt-un" role="alert">{e}</p>}
  <button className="kt-btn gold" disabled={b||!p}>{b?'…':'Enter'}</button> <a className="meta" href="/?gate">← back to Gulaal</a></form></div>}
export default function Kiting({authed:a0,tryRefresh,configured}){
 const [authed,setAuthed]=useState(a0),[tab,setTab]=useState('dash'),[dirty,setDirty]=useState(false),[msg,setMsg]=useState(null),[note,setNote]=useState(''),tm=useRef()
 useEffect(()=>{if(!a0&&tryRefresh)api('session',{}).then(()=>setAuthed(true)).catch(()=>{})},[])
 useEffect(()=>{const h=e=>{if(dirty){e.preventDefault();e.returnValue=''}};addEventListener('beforeunload',h);return()=>removeEventListener('beforeunload',h)},[dirty])
 const notify=(t,x)=>{setMsg({t,x});clearTimeout(tm.current);if(t=='ok')tm.current=setTimeout(()=>setMsg(null),4000)}
 const lost=()=>{setAuthed(false);setDirty(false);setNote('Your session ended — enter the password again.')}
 const go=t=>{if(dirty&&!confirm('Discard your unsaved changes?'))return;setDirty(false);setTab(t);setMsg(null)}
 const out=async()=>{if(dirty&&!confirm('Discard your unsaved changes?'))return;await api('logout',{}).catch(()=>{});setDirty(false);setAuthed(false);setNote('');setTab('dash')}
 const T=[['dash','Dashboard'],['poems','Poetry'],['stories','Stories'],['playlists','Music'],['about','About'],['site_decor','Atmosphere'],['comments','Comments']]
 return <div className="grain kt"><Background/>{!authed?<Login onIn={()=>{setAuthed(true);setNote('')}} note={note} configured={configured}/>:
  <div className="kt-wrap"><header className="kt-head"><span className="hand kt-logo">Kiting</span><a className="type kt-back" href="/?gate">← Back to Gulaal</a><span className={'type kt-pill '+(dirty?'un':'sv')}>{dirty?'● Unsaved changes':'✓ All saved'}</span></header>
   <nav className="kt-tabs">{T.map(([k,n])=><button key={k} className={tab==k?'on':''} onClick={()=>go(k)}>{n}</button>)}<button className="out" onClick={out}>Logout</button></nav>
   {msg&&<div role="status" className={'kt-msg '+msg.t} onClick={()=>setMsg(null)}>{msg.t=='ok'?'✓ ':'⚠ '}{msg.x}</div>}
   <main className="kt-main" key={tab}>{tab=='dash'?<Dash go={go} lost={lost} notify={notify}/>:tab=='about'?<About notify={notify} setDirty={setDirty} lost={lost}/>:tab=='comments'?<Comments notify={notify} lost={lost}/>:<Crud table={tab} notify={notify} setDirty={setDirty} lost={lost}/>}</main></div>}</div>}
