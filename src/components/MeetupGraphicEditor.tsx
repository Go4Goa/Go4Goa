import { useRef,useState } from 'react';
import { Palette } from 'lucide-react';
import type { CivicEvent } from '../../shared/model';
import { defaultPoster, type PosterStyle } from '../../shared/meetup-poster';
import { api, useAction } from '../api';
import { PosterControls } from './PosterControls';
import { Button } from './arc/button/button';
import { ErrorNotice } from './common';

export function MeetupGraphicEditor({event,onPreview,onSaved}:{event:CivicEvent;onPreview:(poster:PosterStyle|null)=>void;onSaved:()=>void}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState<PosterStyle>(event.poster||defaultPoster),[notice,setNotice]=useState('');
 const {busy,error,run,setError}=useAction();
 const trigger=useRef<HTMLButtonElement>(null);
 function change(poster:PosterStyle){setDraft(poster);onPreview(poster);setNotice('');setError('');}
 function close(){setOpen(false);onPreview(null);setError('');trigger.current?.focus({preventScroll:true});}
 async function save(){await run(async()=>{await api('/events/'+event.id+'/graphic',{method:'PATCH',body:JSON.stringify({version:event.version,poster:draft})});setOpen(false);setNotice('Graphic saved.');onSaved();requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));});}
 return <div className="meetup-graphic-editor">
  <Button ref={trigger} variant="secondary" type="button" disabled={busy} aria-expanded={open} onClick={()=>{if(open)close();else{setDraft(event.poster||defaultPoster);setOpen(true);setNotice('');}}}><Palette size={17}/>Edit graphic</Button>
  {open&&<><PosterControls value={draft} onChange={change} disabled={busy}/><div className="poster-graphic-actions"><Button type="button" loading={busy} onClick={()=>void save()}>Save graphic</Button><Button type="button" variant="ghost" disabled={busy} onClick={close}>Cancel</Button></div></>}
  <ErrorNotice message={error}/>{notice&&<p className="hint" role="status">{notice}</p>}
 </div>;
}
