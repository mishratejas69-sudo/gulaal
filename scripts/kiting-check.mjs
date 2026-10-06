// npm run kiting:check — diagnoses Kiting's server config WITHOUT printing any secret value.
import fs from 'node:fs'
const load=f=>{const o={};if(fs.existsSync(f))for(const l of fs.readFileSync(f,'utf8').split(/\r?\n/)){const m=l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);if(m)o[m[1]]=m[2].replace(/^(['"])(.*)\1$/,'$2')}return o}
const env={...load('.env'),...load('.env.local'),...process.env};let bad=0
const say=(ok,t)=>{console.log((ok?'  ✓ ':'  ✗ ')+t);if(!ok)bad++}
const url=(env.NEXT_PUBLIC_SUPABASE_URL||'').replace(/\/$/,''),anon=env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'',em=env.KITING_ADMIN_EMAIL||'',gate=env.KITING_ADMIN_PASSWORD||'',sp=env.KITING_SUPABASE_PASSWORD||''
console.log('Kiting config check (values are never shown)\n')
say(/^https?:\/\//.test(url),'NEXT_PUBLIC_SUPABASE_URL is set'+(url?'':' — MISSING'))
say(anon.length>20,'NEXT_PUBLIC_SUPABASE_ANON_KEY is set'+(anon?'':' — MISSING'))
say(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em),'KITING_ADMIN_EMAIL is set and looks like an email'+(em&&em!==em.trim()?' (has stray spaces)':''))
say(!!gate,'KITING_ADMIN_PASSWORD is set (the password you type on /kiting)')
say(sp.length>=30&&!/[\s<>]/.test(sp),`KITING_SUPABASE_PASSWORD looks like the generated secret (length ${sp.length}; the generated one is ~44, no spaces or <placeholders>)`)
say(!(sp&&sp===gate),'KITING_SUPABASE_PASSWORD is different from KITING_ADMIN_PASSWORD (they must NOT be the same)')
if(url&&anon&&em&&sp){
 const r=await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({email:em.trim().toLowerCase(),password:sp})}).catch(e=>({ok:false,_e:e.message}))
 if(r._e)say(false,'could not reach Supabase: '+r._e)
 else{const j=await r.json().catch(()=>({}));const code=j.error_code||j.error||r.status
  say(r.ok,r.ok?'Supabase accepted the owner account + KITING_SUPABASE_PASSWORD  → /kiting login will work':`Supabase refused the sign-in (${code}): ${j.msg||j.error_description||''}`)
  if(!r.ok){console.log('\n  Fix: run   npm run kiting:fix   (it asks for your service-role key once, hidden, and repairs .env.local), then restart the server.'+(code=='email_not_confirmed'?'\n  (This account is unconfirmed — the setup command confirms it.)':'')+(/invalid_api_key|No API key/i.test(String(code)+(j.msg||''))?'\n  The anon key does not belong to this Supabase project.':''))}}}
console.log(bad?'\nResult: problems found (see ✗ above).':'\nResult: all good.');process.exit(bad?1:0)
