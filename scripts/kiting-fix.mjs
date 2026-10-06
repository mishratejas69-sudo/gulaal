// npm run kiting:fix — one command: check → (if broken) reset the internal Supabase secret into .env.local → check again.
// Prompts (hidden) for the service-role key; it is used once, never saved or printed. No secret values are ever printed.
import fs from 'node:fs'
import readline from 'node:readline'
import {spawnSync} from 'node:child_process'
const load=f=>{const o={};if(fs.existsSync(f))for(const l of fs.readFileSync(f,'utf8').split(/\r?\n/)){const m=l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);if(m)o[m[1]]=m[2].replace(/^(['"])(.*)\1$/,'$2')}return o}
const env={...load('.env'),...load('.env.local'),...process.env}
const run=(f,a=[],x={})=>spawnSync(process.execPath,[`scripts/${f}`,...a],{stdio:'inherit',env:{...process.env,...x}}).status
const rl=readline.createInterface({input:process.stdin,terminal:false}),it=rl[Symbol.asyncIterator]()
let muted=false;const ask=async(q,hide)=>{process.stdout.write(q);if(hide&&process.stdin.isTTY){process.stdout.write('(input hidden) ');}
 if(hide&&process.stdin.isTTY){const s=process.stdout,w=s.write.bind(s);muted=true;s.write=c=>muted?true:w(c)}
 const {value}=await it.next();if(muted){muted=false;process.stdout.write=process.stdout.constructor.prototype.write.bind(process.stdout)};if(hide)process.stdout.write('\n');return(value||'').trim()}
const setEnv=(k,v)=>{let t=fs.existsSync('.env.local')?fs.readFileSync('.env.local','utf8'):'';const re=new RegExp(`^${k}=.*$`,'m');t=re.test(t)?t.replace(re,()=>`${k}=${v}`):t.replace(/\n?$/,'\n')+`${k}=${v}\n`;fs.writeFileSync('.env.local',t,{mode:0o600});try{fs.chmodSync('.env.local',0o600)}catch{}}
console.log('Kiting fix\n')
if(run('kiting-check.mjs')===0)process.exit(0)
console.log('\nRepairing the internal Supabase secret…\n')
const email=(env.KITING_ADMIN_EMAIL||'').trim()||await ask('Owner email (the Kiting account): ')
const key=process.env.SUPABASE_SERVICE_ROLE_KEY||await ask('Supabase service-role key (Dashboard → Project Settings → API; used once, not saved): ',true)
if(!env.KITING_ADMIN_PASSWORD){setEnv('KITING_ADMIN_PASSWORD',await ask('The password you will type on /kiting: ',true));console.log('✓ KITING_ADMIN_PASSWORD saved to .env.local')}
if(run('kiting-setup.mjs',[email,'--write-env'],{SUPABASE_SERVICE_ROLE_KEY:key,SUPABASE_URL:env.NEXT_PUBLIC_SUPABASE_URL||env.SUPABASE_URL||''})!==0)process.exit(1)
console.log('\nRe-checking…\n');const ok=run('kiting-check.mjs')===0
console.log(ok?'\nDone. Restart your dev server (Ctrl+C, npm run dev) and log in at /kiting.':'\nStill failing — send me the ✗ lines above (they contain no secrets).');process.exit(ok?0:1)
