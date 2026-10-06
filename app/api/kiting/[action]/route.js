import {NextResponse} from 'next/server'
import {createHash,timingSafeEqual} from 'node:crypto'
import {parseSpotify} from '@/lib/spotify'
import {cookies} from 'next/headers'
import {getAuth,setSession,clearSession,anon,asUser,adminEmail,SB_URL,SB_KEY} from '@/lib/kiting-server'
export const dynamic='force-dynamic'
const J=(o,s=200)=>NextResponse.json(o,{status:s,headers:{'Cache-Control':'no-store'}})
const hits=new Map()
const today=()=>new Date().toISOString().slice(0,10)
const S=(v,m)=>typeof v=='string'?v.trim().slice(0,m):''
const U=v=>{v=S(v,500);if(!v)return null;try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:false}catch{return false}}
const D=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v:today()
const SEC=['poetry','stories','playlists','about','global'],TYP=['quote','note','caption','stamp','label','annotation']
const tags=v=>(Array.isArray(v)?v:[]).map(t=>S(t,40)).filter(Boolean).slice(0,20)
const T={ // allow-list: only these tables/columns can ever be written
 poems:f=>{const c=U(f.cover_image);if(!S(f.title,200))return'Title is required.';if(!S(f.content,20000))return'The poem text is required.';if(c===false)return'Cover image must be a full http(s) URL.'
  return{row:{title:S(f.title,200),content:S(f.content,20000),author:S(f.author,80)||'Gulaal 🥀',date:D(f.date),cover_image:c,tags:tags(f.tags)}}},
 stories:f=>{const c=U(f.cover_image);if(!S(f.title,200))return'Title is required.';if(!S(f.content,100000))return'The story text is required.';if(c===false)return'Cover image must be a full http(s) URL.'
  return{row:{title:S(f.title,200),content:S(f.content,100000),description:S(f.description,1000),date:D(f.date),cover_image:c}}},
 playlists:f=>{const m=parseSpotify(S(f.spotify_url,500));const c=U(f.cover_image);if(!S(f.title,200))return'Title is required.';if(!m)return'Paste the open.spotify.com link of a playlist, album or track (spotify.link short links can’t be embedded).';if(c===false)return'Cover image must be a full http(s) URL.'
  return{row:{title:S(f.title,200),description:S(f.description,1000),spotify_url:`https://open.spotify.com/${m.kind}/${m.id}`,cover_image:c}}},
 about:f=>{const l={};const e=Object.entries(f.social_links&&typeof f.social_links=='object'?f.social_links:{}).slice(0,12)
  for(const [k,v] of e){const n=S(k,30),u=U(v);if(!n&&!S(v,500))continue;if(!n||!u)return'Each link needs a name and a full http(s) URL.';l[n]=u}
  return{row:{content:S(f.content,10000),social_links:l,updated_at:new Date().toISOString()}}},
 site_decor:f=>{if(!SEC.includes(f.section)||!TYP.includes(f.element_type))return'Pick a section and a type.';if(!S(f.text,160))return'Text is required (max 160).'
  return{row:{section:f.section,element_type:f.element_type,text:S(f.text,160),position_key:S(f.position_key,60)||null,is_active:f.is_active!==false}}}}
const err=e=>/row-level security|permission denied/i.test(e.message||'')||e.code=='42501'?[ 'Not allowed — is_admin() in Supabase must use the same email as KITING_ADMIN_EMAIL.',403]:[e.message||'Database error.',400]
export async function GET(req,{params}){
 const a=params.action,au=await getAuth(false);if(!au)return J({error:'Not signed in.'},401);const sb=asUser(au.token)
 if(a=='counts'){const c={};for(const t of['poems','stories','playlists','comments','site_decor']){const r=await sb.from(t).select('id',{count:'exact',head:true});c[t]=r.count??0}return J({counts:c})}
 if(a=='data'){const t=new URL(req.url).searchParams.get('t');if(!['poems','stories','playlists','about','site_decor','comments'].includes(t))return J({error:'Unknown list.'},400)
  const r=await sb.from(t).select('*').order(t=='about'?'updated_at':'created_at',{ascending:false}).limit(t=='comments'?300:500);if(r.error){const[m,s]=err(r.error);return J({error:m},s)};return J({rows:r.data||[]})}
 return J({error:'Not found.'},404)}
export async function POST(req,{params}){
 const a=params.action,org=req.headers.get('origin');if(org&&new URL(org).host!==req.headers.get('host'))return J({error:'Bad origin.'},403)
 const b=await req.json().catch(()=>({}))
 if(a=='login'){
  if(!adminEmail())return J({error:'Kiting is not configured on the server (KITING_ADMIN_EMAIL missing).'},503)
  const ip=(req.headers.get('x-forwarded-for')||'local').split(',')[0].trim();let h=hits.get(ip);if(!h||Date.now()-h.t>600000)h={n:0,t:Date.now()};if(h.n>=5)return J({error:'Too many tries. Wait a few minutes.'},429)
  if(typeof b.password!='string'||!b.password||b.password.length>200)return J({error:'Enter the password.'},400)
  await new Promise(r=>setTimeout(r,400))
  // Gate mode: the master password lives only in server env; Supabase itself is signed into with a separate long random secret.
  const gate=process.env.KITING_ADMIN_PASSWORD,sp=process.env.KITING_SUPABASE_PASSWORD
  if(gate&&!sp)return J({error:'Kiting is half-configured: KITING_SUPABASE_PASSWORD is missing (run npm run kiting:setup).'},503)
  const sha=x=>createHash('sha256').update(String(x)).digest()
  if(gate&&!timingSafeEqual(sha(b.password),sha(gate))){h.n++;hits.set(ip,h);return J({error:'That is not the password.'},401)}
  const {data,error}=await anon().auth.signInWithPassword({email:adminEmail(),password:gate?sp:b.password})
  if(error||!data?.session){h.n++;hits.set(ip,h);if(gate)console.error('[kiting] Supabase sign-in failed:',error?.code||error?.status||'no session')
    return J({error:gate?`Supabase sign-in failed (${error?.code||error?.status||'no session'}) — run "npm run kiting:check" to see which setting is wrong.`:'That is not the password.'},gate?502:401)}
  hits.delete(ip);setSession(data.session);return J({ok:true})}
 if(a=='logout'){const at=cookies().get('kiting_at')?.value;if(at)await fetch(`${SB_URL}/auth/v1/logout`,{method:'POST',headers:{apikey:SB_KEY,Authorization:`Bearer ${at}`}}).catch(()=>{});clearSession();return J({ok:true})}
 const au=await getAuth(true);if(!au)return J({error:'Not signed in.'},401)
 if(a=='session')return J({ok:true})
 const sb=asUser(au.token)
 if(a=='save'||a=='delete'){
  const t=b.table;if(!T[t]||(b.id!=null&&!/^[0-9a-f-]{8,40}$/i.test(String(b.id))))return J({error:'Bad request.'},400)
  if(a=='delete'){const r=await sb.from(t).delete().eq('id',b.id).select('id');if(r.error){const[m,s]=err(r.error);return J({error:m},s)};return r.data?.length?J({ok:true}):J({error:'Nothing was deleted (not permitted, or already gone).'},404)}
  const v=T[t](b.row||{});if(typeof v=='string')return J({error:v},400)
  let id=b.id;if(t=='about'&&!id){const e=await sb.from('about').select('id').limit(1);id=e.data?.[0]?.id}
  const r=id?await sb.from(t).update(v.row).eq('id',id).select().maybeSingle():await sb.from(t).insert(v.row).select().single()
  if(r.error){const[m,s]=err(r.error);return J({error:m},s)};if(!r.data)return J({error:'Nothing was saved (not permitted, or the item is gone).'},404);return J({row:r.data})}
 if(a=='delete_comment'){const r=await sb.from('comments').delete().eq('id',b.id).select('id');if(r.error){const[m,s]=err(r.error);return J({error:m},s)};return r.data?.length?J({ok:true}):J({error:'Nothing was deleted.'},404)}
 return J({error:'Not found.'},404)}
