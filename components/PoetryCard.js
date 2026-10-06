import useDecor from '@/lib/useDecor'
// four paper personalities: manuscript, letter, journal page, pinned slip
const V=['ms','letter','journal','pin']
export default function PoetryCard({p,i,onOpen}){
 const d=useDecor()
 const v=V[i%4],w=[380,320,430,260][i%4],r=[-2.5,1.8,-1,3.5][i%4],y=[0,50,-30,70][i%4]
 const lines=p.content.split('\n').slice(0,v=='pin'?3:5).join('\n')
 return <article className={'paper '+v} onClick={()=>onOpen(p)} style={{width:w,'--r':r+'deg','--y':y+'px',marginLeft:i%3==1?'auto':[0,'3rem'][i%2],marginTop:i%5==2?'-3rem':0,zIndex:i%2?3:2}}>
  <span className="pno type">p. {String(i*7+3).padStart(2,'0')}</span>
  {v=='letter'&&<><span className="mini-stamp">🥀</span><p className="hand" style={{fontSize:'1.3rem'}}>Dear reader,</p></>}
  <p className="meta">{p.date}</p><h3>{p.title}</h3>
  <pre>{lines}…</pre>
  {(p.tags||[]).map(t=><span key={t} className="tag">{t}</span>)}
  {v=='ms'&&<span className="note" style={{right:-10,bottom:-34}}>{d('poetry','annotation',0,'midnight thought')}</span>}
  {v=='journal'&&<span className="note ann" style={{left:-40,top:'40%'}}>{d('poetry','annotation',1,'← this line')}</span>}
  {v=='pin'&&<span className="pinhead"/>}</article>}
