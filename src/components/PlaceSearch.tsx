import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { api } from '../api';
import { pointSchema, type Point } from '../../shared/model';
import { SearchField } from './arc/search-field/search-field';
import { Button } from './arc/button/button';
import { ErrorNotice } from './common';
import './place-search.css';

export interface Place { id:string; name:string; label:string; point:Point }
interface Suggestion extends Omit<Place,'point'> { point?:Point }
interface PlaceResults { places:Suggestion[]; attribution?:{label:string;url:string} }

export function PlaceSearch({onSelect}:{onSelect:(place:Place)=>void}) {
 const [query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [result,setResult]=useState<PlaceResults|null>(null);
 const [attribution,setAttribution]=useState<PlaceResults['attribution']>();
 const controller=useRef<AbortController|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const session=useRef(crypto.randomUUID());
 const selectedQuery=useRef<string|null>(null);
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{controller.current?.abort();clearTimeout(timer.current);},[]);
 useEffect(()=>{
  if(query.trim().length<3||selectedQuery.current===query)return;
  timer.current=setTimeout(()=>void search(),500);
  return()=>clearTimeout(timer.current);
 },[query]);
 function change(value:string){
  controller.current?.abort();clearTimeout(timer.current);
  if(selectedQuery.current!==null||!value.trim())session.current=crypto.randomUUID();
  selectedQuery.current=null;setBusy(false);setQuery(value);setResult(null);setError('');setAttribution(undefined);
 }
 async function search(fullSearch=false){
  clearTimeout(timer.current);
  if(query.trim().length<2)return;
  controller.current?.abort();const request=new AbortController();controller.current=request;
  setBusy(true);setError('');setResult(null);
  try{
   const params=new URLSearchParams({q:query.trim(),session:session.current});
   const data=await api<PlaceResults>((fullSearch?'/maps/search?':'/maps/suggest?')+params,{signal:request.signal});
   if(!request.signal.aborted){setResult(data);setAttribution(data.attribution);}
  }catch(error){if(!request.signal.aborted)setError(error instanceof Error?error.message:'Search is unavailable. Choose a point on the map.');}
  finally{if(!request.signal.aborted)setBusy(false);}
 }
 async function select(suggestion:Suggestion){
  clearTimeout(timer.current);controller.current?.abort();
  const request=new AbortController();controller.current=request;setBusy(true);setError('');
  try{
   const place=suggestion.point?suggestion as Place:await api<Place>(`/maps/place/${encodeURIComponent(suggestion.id)}?session=${session.current}`,{signal:request.signal});
   if(request.signal.aborted)return;
   const point=pointSchema.safeParse(place.point);
   if(!point.success)throw new Error('Choose a place within Goa, or set its location on the map.');
   selectedQuery.current=place.name;session.current=crypto.randomUUID();
   setQuery(place.name);setResult(null);onSelect({...place,point:point.data});input.current?.focus({preventScroll:true});
  }catch(error){if(!request.signal.aborted)setError(error instanceof Error?error.message:'That place could not be selected. Try again.');}
  finally{if(!request.signal.aborted)setBusy(false);}
 }
 return <div className="place-search">
  <div className="place-search-row"><SearchField ref={input} label="Search places in Goa" placeholder="Beach, café, or local business" maxLength={100} value={query} onValueChange={change} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();void search(true);}}}/><Button type="button" variant="secondary" aria-label="Search places" disabled={query.trim().length<2||busy} loading={busy} onClick={()=>void search(true)}><Search size={18}/></Button></div>
  <ErrorNotice message={error}/>{busy&&<p className="place-search-status" role="status">Finding places…</p>}
  {result&&<><p className="place-search-status" role="status">{result.places.length?`${result.places.length} ${result.places.length===1?'place':'places'} found`:'No places found. Try a nearby landmark or choose on the map.'}</p><ul className="place-search-results">{result.places.map(place=><li key={place.id}><Button type="button" variant="ghost" disabled={busy} onClick={()=>void select(place)}><MapPin size={17}/><span className="place-search-copy"><span>{place.name}</span><small>{place.label}</small></span></Button></li>)}</ul></>}
  {attribution&&<p className="place-search-attribution">Search by <a href={attribution.url} translate="no" target="_blank" rel="noreferrer">{attribution.label}</a></p>}
 </div>;
}
