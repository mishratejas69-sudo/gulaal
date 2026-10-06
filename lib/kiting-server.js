import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
// Server-only. Nothing here is NEXT_PUBLIC; the owner's password is never stored by us (Supabase Auth keeps only its hash).
export const SB_URL=process.env.NEXT_PUBLIC_SUPABASE_URL||'http://localhost',SB_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'x'
export const adminEmail=()=>(process.env.KITING_ADMIN_EMAIL||'').trim().toLowerCase()
const o={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}
export const anon=()=>createClient(SB_URL,SB_KEY,o)
// client acting AS the signed-in owner -> Postgres RLS (is_admin()) decides every write
export const asUser=t=>createClient(SB_URL,SB_KEY,{...o,global:{headers:{Authorization:`Bearer ${t}`}}})
const ck={httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/'}
export function setSession(s){const c=cookies();c.set('kiting_at',s.access_token,{...ck,maxAge:28800});c.set('kiting_rt',s.refresh_token,{...ck,maxAge:28800})}
export function clearSession(){const c=cookies();c.delete('kiting_at');c.delete('kiting_rt')}
export async function getAuth(canRefresh=false){
 const c=cookies(),at=c.get('kiting_at')?.value,rt=c.get('kiting_rt')?.value,me=adminEmail();if(!me)return null
 if(at){const {data,error}=await anon().auth.getUser(at);if(!error&&data?.user?.email?.toLowerCase()===me)return{token:at}}
 if(rt&&canRefresh){const {data,error}=await anon().auth.refreshSession({refresh_token:rt});if(!error&&data?.session&&data.session.user?.email?.toLowerCase()===me){setSession(data.session);return{token:data.session.access_token}}}
 return null}
