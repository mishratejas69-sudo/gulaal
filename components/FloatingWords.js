const W=['poetry','memory','dream','moon','rain','letters','silence','stories','midnight','wander','words','echo','home','love','time']
export default function FloatingWords(){
 return <div className="words" aria-hidden>{W.map((w,i)=><span key={w} style={{left:(i*37%92)+'%',top:(i*53%88)+'%',fontSize:14+(i*7%38),opacity:.05+(i%5)*.03,filter:`blur(${i%3}px)`,'--d':18+i*2+'s','--x':(i%2?40:-40)+'px','--y':(i%3-1)*50+'px','--r':(i%2?6:-6)+'deg'}}>{w}</span>)}</div>}
