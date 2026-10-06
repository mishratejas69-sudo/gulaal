export default function Nav({tab,setTab,onHome}){
 return <nav><button className="logo hand" onClick={onHome} title="Back to the entrance">Gulaal 🥀</button>
  {['poetry','stories','playlists','about'].map(t=><button key={t} className={tab==t?'act':''} onClick={()=>setTab(t)}>{t.toUpperCase()}</button>)}</nav>}
