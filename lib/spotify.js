// Shared by the public site and the Kiting API. Pure functions, no secrets.
const K='playlist|album|track|artist|show|episode'
const WEB=new RegExp(`^https?://open\\.spotify\\.com/(?:(?:embed|intl-[a-z-]+)/)*(${K})/([A-Za-z0-9]+)`,'i'),URI=new RegExp(`^spotify:(${K}):([A-Za-z0-9]+)`,'i')
export function parseSpotify(u){const s=String(u||'').trim(),m=WEB.exec(s)||URI.exec(s);return m?{kind:m[1].toLowerCase(),id:m[2]}:null}
export function spotifyInfo(u){const p=parseSpotify(u);if(!p)return null
 return{...p,open:`https://open.spotify.com/${p.kind}/${p.id}`,embed:`https://open.spotify.com/embed/${p.kind}/${p.id}?utm_source=generator&theme=0`,height:p.kind=='track'||p.kind=='episode'?152:352}}
export const safeUrl=u=>{try{const x=new URL(String(u||'').trim());return /^https?:$/.test(x.protocol)?x.href:null}catch{return null}}
export const spotifyHost=u=>{const x=safeUrl(u);if(!x)return false;const h=new URL(x).hostname.toLowerCase();return h=='spotify.link'||h=='spotify.com'||h.endsWith('.spotify.com')}
