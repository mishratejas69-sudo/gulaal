'use client'
import ReactionBar from './ReactionBar'
import CommentSection from './CommentSection'
import {useEffect} from 'react'
export default function Reader({item,type,onClose}){
 useEffect(()=>{const k=e=>e.key=='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[])
 return <div className="reader" onClick={onClose}><div className="paper" onClick={e=>e.stopPropagation()}>
  <p className="meta">{item.date} · <button onClick={onClose} style={{all:'unset',cursor:'pointer'}}>CLOSE ✕</button></p>
  <h3>{item.title}</h3><pre>{item.content}</pre>
  <p className="hand" style={{fontSize:'1.6rem'}}>— {item.author||'Gulaal 🥀'}</p>
  <ReactionBar id={item.id} type={type}/><CommentSection id={item.id} type={type}/>
  <a className="meta" href={`/?${type}=${item.id}`}>share link</a></div></div>}
