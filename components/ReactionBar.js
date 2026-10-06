'use client'
import {useEffect,useState} from 'react'
import {sb} from '@/lib/supabase'
const R=[['heart','❤️'],['laugh','😂'],['cry','😭'],['like','👍'],['wow','😮']]
export default function ReactionBar({id,type}){
 const [c,setC]=useState({}),[b,setB]=useState(null)
 useEffect(()=>{sb.from('reaction_counts').select('*').eq('content_id',id).then(({data})=>setC(Object.fromEntries((data||[]).map(r=>[r.reaction_type,r.n]))))},[id])
 const add=async k=>{
  if(localStorage.getItem('r'+id+k))return
  localStorage.setItem('r'+id+k,1);setC(x=>({...x,[k]:(x[k]||0)+1}));setB(k);setTimeout(()=>setB(null),700)
  await sb.from('reactions').insert({content_id:id,content_type:type,reaction_type:k})}
 return <div className="rx">{R.map(([k,e])=><button key={k} onClick={()=>add(k)}>{e} {c[k]||0}
  {b==k&&[0,1,2,3,4,5].map(n=><i key={n} className="burst" style={{'--x':Math.cos(n*1.05)*30+'px','--y':Math.sin(n*1.05)*30-10+'px'}}>{e}</i>)}</button>)}</div>}
