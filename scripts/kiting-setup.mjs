// One-time setup (safe to re-run; re-running rotates the generated secret).
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node scripts/kiting-setup.mjs you@example.com
// Creates/updates the single owner account in Supabase Auth with a LONG RANDOM password that only your server knows.
// Your typed master password lives in KITING_ADMIN_PASSWORD (server env). The service-role key is used only in this run.
import {randomBytes} from 'node:crypto'
import fs from 'node:fs'
const loadEnv=f=>{const o={};if(fs.existsSync(f))for(const l of fs.readFileSync(f,'utf8').split(/\r?\n/)){const m=l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);if(m)o[m[1]]=m[2].replace(/^(['"])(.*)\1$/,'$2')}return o}
const file={...loadEnv('.env'),...loadEnv('.env.local')},write=process.argv.includes('--write-env'),args=process.argv.slice(2).filter(a=>!a.startsWith('--'))
const url=(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||file.NEXT_PUBLIC_SUPABASE_URL||'').replace(/\/$/,''),key=process.env.SUPABASE_SERVICE_ROLE_KEY
const email=(args[0]||process.env.KITING_ADMIN_EMAIL||file.KITING_ADMIN_EMAIL||'').trim().toLowerCase()
if(!url||!key||!email.includes('@')){console.error('Usage: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/kiting-setup.mjs you@example.com');process.exit(1)}
const pw=randomBytes(33).toString('base64url'),H={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'}
const list=await (await fetch(`${url}/auth/v1/admin/users?per_page=1000`,{headers:H})).json()
const ex=(list.users||[]).find(u=>u.email?.toLowerCase()===email)
const r=ex?await fetch(`${url}/auth/v1/admin/users/${ex.id}`,{method:'PUT',headers:H,body:JSON.stringify({password:pw})}):await fetch(`${url}/auth/v1/admin/users`,{method:'POST',headers:H,body:JSON.stringify({email,password:pw,email_confirm:true})})
if(!r.ok){console.error('Supabase refused:',await r.text());process.exit(1)}
const sql=`   create or replace function is_admin() returns boolean language sql stable as $$ select lower(coalesce(auth.jwt()->>'email',''))='${email}' $$;`
if(write){ // update .env.local in place; the secret is never printed
 const set=(t,k,v)=>new RegExp(`^${k}=.*$`,'m').test(t)?t.replace(new RegExp(`^${k}=.*$`,'m'),()=>`${k}=${v}`):t.replace(/\n?$/,'\n')+`${k}=${v}\n`
 let t=fs.existsSync('.env.local')?fs.readFileSync('.env.local','utf8'):'';t=set(set(t,'KITING_ADMIN_EMAIL',email),'KITING_SUPABASE_PASSWORD',pw);fs.writeFileSync('.env.local',t,{mode:0o600});try{fs.chmodSync('.env.local',0o600)}catch{}
 console.log(`\n✓ Kiting account ${ex?'reset':'created'} for ${email}.\n✓ .env.local updated (KITING_ADMIN_EMAIL, KITING_SUPABASE_PASSWORD — value not shown). Restart the server.\n  KITING_ADMIN_PASSWORD (what you type on /kiting) is untouched.\n\nSQL editor, once (or if the email changed):\n${sql}\n`)
}else console.log(`\n✓ Kiting account ${ex?'updated':'created'} for ${email}.\n\n1) Put these in .env.local (and Vercel) — server-only, never NEXT_PUBLIC_:\n   KITING_ADMIN_EMAIL=${email}\n   KITING_ADMIN_PASSWORD=<the password you will type on /kiting>\n   KITING_SUPABASE_PASSWORD=${pw}\n\n2) Supabase SQL editor (once, or if the email changes):\n${sql}\n`)
process.exit(0)
