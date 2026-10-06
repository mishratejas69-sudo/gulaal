'use client'
import {useEffect,useState} from 'react'
import {sb} from './supabase'
let cache=null,pr=null
const load=()=>pr||(pr=sb.from('site_decor').select('section,element_type,text,position_key').eq('is_active',true).order('created_at')
 .then(({data,error})=>(cache=error?[]:data||[]),()=>(cache=[])))
// returns pick(section,type,slot,fallback): pinned row > nth free row > hardcoded fallback
export default function useDecor(){
 const [rows,set]=useState(cache||[])
 useEffect(()=>{load().then(set)},[])
 return (sec,type,i,def)=>{
  const pool=rows.filter(r=>r.element_type==type&&(r.section==sec||r.section=='global')).sort((a,b)=>(b.section==sec)-(a.section==sec))
  return (pool.find(r=>r.position_key==`${sec}.${type}-${i}`)||pool.filter(r=>!r.position_key)[i])?.text||def}}
