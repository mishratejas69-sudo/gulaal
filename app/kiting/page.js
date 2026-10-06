import {cookies} from 'next/headers'
import {getAuth,adminEmail} from '@/lib/kiting-server'
import Kiting from './Kiting'
export const dynamic='force-dynamic'
export const metadata={title:'Kiting | Gulaal 🥀',robots:{index:false,follow:false}}
export default async function Page(){
 const a=await getAuth(false),rt=!!cookies().get('kiting_rt')
 return <Kiting authed={!!a} tryRefresh={!a&&rt} configured={!!adminEmail()}/>}
