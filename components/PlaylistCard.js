import {spotifyInfo,safeUrl,spotifyHost} from '@/lib/spotify'
// One record sleeve: cover art + title, the real Spotify player (playlist / album / track …), and an "Open in Spotify" link.
export default function PlaylistCard({p,i}){
 const s=spotifyInfo(p.spotify_url),o=safeUrl(p.spotify_url),open=s?((!o||/\/embed\//.test(o))?s.open:o):(spotifyHost(o)?o:null) // original link; canonical if it was an embed/URI form; never a non-Spotify site
 return <div className="paper rec" style={{width:[420,380,400][i%3],'--r':[-1.5,2,-.5][i%3]+'deg',cursor:'default'}}>
  <div className="pl-top">
   {p.cover_image&&<figure className="pl-art"><img src={p.cover_image} alt="" loading="lazy" onError={e=>{e.currentTarget.parentElement.style.display='none'}}/></figure>}
   <div><h3>{p.title}</h3>{p.description&&<p className="pl-d">{p.description}</p>}</div></div>
  {s?<iframe className="pl-frame" title={`Spotify player: ${p.title}`} src={s.embed} width="100%" height={s.height} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"/>
   :<p className="pl-fb hand">This one can’t be played here{open?' — but you can open it on Spotify.':'.'}</p>}
  {open&&<a className="pl-open type" href={open} target="_blank" rel="noopener noreferrer">♪ Open in Spotify ↗</a>}</div>}
