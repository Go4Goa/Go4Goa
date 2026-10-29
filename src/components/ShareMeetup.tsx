import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from './arc/button/button';
import { Input } from './arc/input/input';

export function ShareMeetup({id,title}:{id:string;title:string}){
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[manual,setManual]=useState(false);
 const url=new URL('/events/'+id,window.location.origin).href;
 async function share(){
  setBusy(true);setNotice('');setManual(false);
  try{
   if(navigator.share){await navigator.share({title,url});setNotice('Meetup shared.');}
   else{await navigator.clipboard.writeText(url);setNotice('Link copied. Ready to share.');}
  }catch(error){
   if(!(error instanceof DOMException&&error.name==='AbortError')){setManual(true);setNotice('Copy this link to share your meetup.');}
  }finally{setBusy(false);}
 }
 return <div className="meetup-share"><Button type="button" variant="secondary" onClick={()=>void share()} loading={busy}>{notice.startsWith('Link copied')?<Check size={18}/>:<Share2 size={18}/>}Share meetup</Button>{notice&&<p role="status" className="hint">{notice}</p>}{manual&&<Input label="Meetup link" readOnly value={url} onFocus={event=>event.target.select()}/>}</div>;
}
