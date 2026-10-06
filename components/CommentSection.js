'use client'
import {useEffect,useState} from 'react'
import {sb} from '@/lib/supabase'
export default function CommentSection({id,type}){
 const [l,setL]=useState([]),[u,setU]=useState(''),[c,setC]=useState(''),[h,setH]=useState('')
 const load=()=>sb.from('comments').select('*').eq('content_id',id).order('created_at',{ascending:false}).then(({data})=>setL(data||[]))
 useEffect(()=>{load()},[id])
 const send=async()=>{
  const last=+localStorage.getItem('lc')||0
  if(h||!u.trim()||!c.trim()||Date.now()-last<30000)return
  localStorage.setItem('lc',Date.now());await sb.from('comments').insert({content_id:id,content_type:type,username:u.trim().slice(0,40),comment:c.trim().slice(0,500)});setC('');load()}
 return <div className="cm"><p className="meta" style={{margin:'1rem 0 .3rem'}}>LEAVE A NOTE</p>
  <input placeholder="Name" value={u} onChange={e=>setU(e.target.value)} maxLength={40}/>
  <input style={{display:'none'}} tabIndex={-1} value={h} onChange={e=>setH(e.target.value)}/>
  <textarea placeholder="Comment" rows={2} value={c} onChange={e=>setC(e.target.value)} maxLength={500}/>
  <button onClick={send}>Send</button>
  {l.map(m=><p key={m.id} style={{marginTop:'.8rem'}}><b className="type" style={{fontSize:'.85rem'}}>{m.username}</b><br/>{m.comment}</p>)}</div>}
