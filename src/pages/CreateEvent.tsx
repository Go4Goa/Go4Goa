import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, MapPin, Plus, Repeat2 } from 'lucide-react';
import { useApp } from '../context';
import { api, useAction, useData } from '../api';
import { activityIds, activityLabel, eventSchema, type Activity, type Incident, type Point } from '../../shared/model';
import { eventOccurrences, type Recurrence } from '../../shared/event-schedule';
import { Button } from '../components/arc/button/button';
import { Input } from '../components/arc/input/input';
import { InlineEdit } from '../components/arc/inline-edit/inline-edit';
import { DatePicker } from '../components/arc/date-picker/date-picker';
import { TimePicker } from '../components/arc/time-picker/time-picker';
import { NumberField } from '../components/arc/number-field/number-field';
import { Select } from '../components/arc/select/select';
import { Switch } from '../components/arc/switch/switch';
import { ErrorNotice, Loading } from '../components/common';
import { EventPlaceSearch } from '../components/EventPlaceSearch';
import { LocationField } from '../components/LocationField';
import { MeetupPoster } from '../components/MeetupPoster';
import { PosterCustomizer } from '../components/PosterControls';
import { defaultPoster,type PosterStyle } from '../../shared/meetup-poster';
import SignIn from './SignIn';
import { draftKey,readMeetupDraft,saveMeetupDraft } from '../services/meetup-draft';
import '@fontsource-variable/inter';
import '@fontsource-variable/geist';
import './event-create.css';

const bringOptions = ['Water', 'Gloves', 'Closed shoes', 'Sun hat', 'Reusable bag', 'Tools'];
const durations=[30,60,90,120,180,240,360,480,600,720].map(minutes=>({value:String(minutes),label:minutes<60?`${minutes} minutes`:minutes%60?`${Math.floor(minutes/60)} hr ${minutes%60} min`:`${minutes/60} ${minutes===60?'hour':'hours'}`}));
const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const instant = (date: Date, time: string) => new Date(`${dayKey(date)}T${time}:00+05:30`).toISOString();
const dateLabel = (date: Date) => new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
const timeLabel = (time: string) => new Intl.DateTimeFormat('en-IN', {hour:'numeric', minute:'2-digit', timeZone:'Asia/Kolkata'}).format(new Date(`2000-01-01T${time}:00+05:30`));

export default function CreateEvent() {
 const {account,ready}=useApp();
 const [routeParams]=useSearchParams();
 if(!ready)return <div className="page narrow"><Loading/></div>;
 if(!account)return <div className="page narrow"><SignIn/></div>;
 return <MeetupComposer key={account.id+':'+(routeParams.get('report')||'new')} accountId={account.id}/>;
}
function MeetupComposer({accountId}:{accountId:string}){
 const navigate=useNavigate();
 const [params]=useSearchParams();
 const linked=params.get('report');
 const {data:report}=useData<{incident:Incident}>(linked?'/incidents/'+linked:null);
 const key=draftKey(accountId,linked);
 const [draft]=useState(()=>{try{return readMeetupDraft(sessionStorage,key);}catch{return null;}});
 const [title,setTitle]=useState(draft?.title||'');
 const [poster,setPoster]=useState<PosterStyle>(draft?.poster||defaultPoster);
 const [titleDraft,setTitleDraft]=useState(draft?.title||'');
 const [description,setDescription]=useState(draft?.description||'');
 const [descriptionDraft,setDescriptionDraft]=useState(draft?.description||'');
 const requestedActivity=params.get('activity');
 const [activity,setActivity]=useState<Activity>(draft?.activity||(activityIds.includes(requestedActivity as Activity)?requestedActivity as Activity:'beach_cleanup'));
 const [startDate,setStartDate]=useState<Date|undefined>(draft?.startDate?new Date(draft.startDate+'T12:00:00'):undefined);
 const [startTime,setStartTime]=useState(draft?.startTime||'09:00');
 const [duration,setDuration]=useState(draft?.duration||120);
 const [recurring,setRecurring]=useState(draft?.recurring||false);
 const [frequency,setFrequency]=useState<Recurrence['frequency']>(draft?.frequency||'weekly');
 const [interval,setInterval]=useState(draft?.interval||1);
 const [occurrences,setOccurrences]=useState(draft?.occurrences||4);
 const [point,setPoint]=useState<Point|null>(draft?.point||null);
 const [location,setLocation]=useState(draft?.location||'');
 const [meetup,setMeetup]=useState(draft?.meetup||'');
 const [meetupDraft,setMeetupDraft]=useState(draft?.meetup||'');
 const [showMap,setShowMap]=useState(draft?.showMap||false);
 const [capacity,setCapacity]=useState(draft?.capacity||20);
 const [materials,setMaterials]=useState<string[]>(draft?.materials||[]);
 const [extraMaterial,setExtraMaterial]=useState(draft?.extraMaterial||'');
 const [showExtra,setShowExtra]=useState(draft?.showExtra||false);
 const {busy,error,run,setError}=useAction();
 useEffect(()=>{try{saveMeetupDraft(sessionStorage,key,{title:titleDraft,description:descriptionDraft,meetup:meetupDraft,activity,poster,startDate:startDate?dayKey(startDate):null,startTime,duration,recurring,frequency,interval,occurrences,point,location,showMap,capacity,materials,extraMaterial,showExtra});}catch{/* Storage unavailable. */}},[key,titleDraft,descriptionDraft,meetupDraft,activity,poster,startDate,startTime,duration,recurring,frequency,interval,occurrences,point,location,showMap,capacity,materials,extraMaterial,showExtra]);
 function invalid(message:string,selector:string):never{requestAnimationFrame(()=>{const field=document.querySelector<HTMLElement>(selector);field?.scrollIntoView({block:'center'});field?.focus({preventScroll:true});});throw new Error(message);}


 function toggleMaterial(value:string){setMaterials(current=>current.includes(value)?current.filter(item=>item!==value):[...current,value]);}
 const recurrence=recurring?{frequency,interval,occurrences}:null;
 const startsAt=startDate?instant(startDate,startTime):null;
 const endsAt=startsAt?new Date(Date.parse(startsAt)+duration*60000).toISOString():null;
 let schedule:{startsAt:string;endsAt:string}[]=[];
 try{if(startsAt&&endsAt)schedule=eventOccurrences(startsAt,endsAt,recurrence);}catch{/* Validation is shown on submit. */}
 async function submit(){
  if(busy)return;
  await run(async()=>{
   const currentTitle=titleDraft.trim(),currentDescription=descriptionDraft.trim(),currentMeetup=meetupDraft.trim();
   if(currentTitle.length>100)invalid('Keep the name under 100 characters.','.event-name-editor textarea');
   if(currentDescription.length>2500)invalid('Keep the description under 2,500 characters.','.event-description-editor textarea');
   if(currentMeetup.length>500)invalid('Keep meeting instructions under 500 characters.','.event-meetup-editor textarea');
   if(currentTitle.length<4)invalid('Give your meetup a name of at least 4 characters.','.event-name-editor button');
   if(!startsAt||!endsAt)invalid('Choose the date for your meetup.','.event-date-row button');
   eventOccurrences(startsAt,endsAt,recurrence);
   if(Date.parse(startsAt)<Date.now()+60000)invalid('Choose a future start time.','.event-date-row button');
   if(!point){setShowMap(true);invalid('Choose a place from search or place a pin on the map.','.event-location-details summary');}
   if(location.trim().length<2){setShowMap(true);invalid('Add the name of the meetup place.','.event-location-details input[maxlength="120"]');}
   if(currentMeetup.length<5)invalid('Add a few words about where people should meet.','.event-meetup-editor button');
   if(currentDescription.length<10)invalid('Add a short description so people know what to expect.','.event-description-editor button');
   const payload=eventSchema.parse({title:currentTitle,description:currentDescription,activity,point,locationLabel:location,meetup:currentMeetup,startsAt,endsAt,capacity,linkedIncident:linked,materials:[...materials,extraMaterial.trim()].filter(Boolean).join(', '),recurrence,poster});
   const result=await api<{id:string}>('/events',{method:'POST',body:JSON.stringify(payload)});
   try{sessionStorage.removeItem(key);}catch{/* Storage unavailable. */}
   navigate('/events/'+result.id+'?created=1');
  });
 }

 return <div className="event-create">
  <div className="event-create-top"><Link className="back-link" to="/events"><ArrowLeft size={17}/>Meetups</Link><span>Create a meetup</span></div>
  <div className="event-composer-layout">
   <form id="event-creation-form" className="event-composer" noValidate onChange={()=>setError('')} onClickCapture={()=>setError('')} onSubmit={event=>{event.preventDefault();void submit();}}>
    <div className="event-name-editor"><InlineEdit as="h1" variant="title" multiline label="Meetup name" value={title} onSave={value=>{setTitle(value);setTitleDraft(value);}} onDraftChange={setTitleDraft} placeholder="Untitled meetup" validate={value=>value.length>100?'Keep the name under 100 characters.':null}/></div>
    {report&&<p className="event-link-note"><MapPin size={16}/>Linked to {report.incident.title}. Choose a public meetup point separately.</p>}
    <fieldset className="event-fieldset"><legend>What kind of gathering?</legend><div className="event-activity-options">{activityIds.map(value=><Button key={value} type="button" variant={activity===value?'primary':'secondary'} aria-pressed={activity===value} onClick={()=>setActivity(value)}>{activityLabel[value]}</Button>)}</div></fieldset>
    <section className="event-section" aria-labelledby="event-when"><div className="event-section-heading"><h2 id="event-when">When</h2><span>India Standard Time</span></div>
     <div className="event-date-row"><DatePicker label="Date" placeholder="Choose a date" value={startDate} onChange={setStartDate} locale="en-IN" showToday/><TimePicker label="Start time" value={startTime} onChange={setStartTime}/></div>
     <Select label="How long?" value={String(duration)} onValueChange={value=>setDuration(Number(value))} options={durations}/>
     <div className="event-repeat-toggle"><span><Repeat2 size={17}/>Make it recurring</span><Switch aria-label="Make it recurring" checked={recurring} onCheckedChange={setRecurring}/></div>
     {recurring&&<div className="event-recurrence"><div className="event-frequency-options" role="group" aria-label="Repeat frequency">{(['daily','weekly','monthly'] as const).map(value=><Button key={value} type="button" variant={frequency===value?'primary':'secondary'} aria-pressed={frequency===value} onClick={()=>setFrequency(value)}>{value[0].toUpperCase()+value.slice(1)}</Button>)}</div><div className="event-repeat-fields"><NumberField label="Repeat every" value={interval} onValueChange={setInterval} min={1} max={12} suffix={` ${{daily:'day',weekly:'week',monthly:'month'}[frequency]}${interval===1?'':'s'}`}/><NumberField label="Number of meetups" value={occurrences} onValueChange={setOccurrences} min={2} max={12}/></div><p className="place-search-status">Includes the first meetup. Up to 12 meetups per series.{frequency==='monthly'?' In shorter months, use the last day of the month.':''}</p></div>}
    </section>
    <section className="event-section" aria-labelledby="event-where"><div className="event-section-heading"><h2 id="event-where">Where</h2><span>A public meetup spot</span></div>
     <EventPlaceSearch onSelect={place=>{setPoint(place.point);setLocation(place.name.slice(0,120));setShowMap(true);}}/>
     {location&&<div className="event-selected-place"><MapPin size={18}/><span>{location}</span><Check size={17}/></div>}
     <div className="event-map-toggle"><Button type="button" variant="ghost" aria-expanded={showMap} aria-controls="event-location-details" onClick={()=>setShowMap(!showMap)}><MapPin size={16}/>{showMap?'Hide map':'Choose on map'}<ChevronDown size={15}/></Button></div>
     {showMap&&<div className="event-location-details" id="event-location-details"><LocationField point={point} onChange={setPoint}/><Input label="Place name" value={location} onChange={event=>setLocation(event.target.value)} maxLength={120} placeholder="e.g. Miramar beach"/></div>}
     <div className="event-meetup-editor"><InlineEdit variant="body" multiline label="Meeting instructions" value={meetup} onSave={value=>{setMeetup(value);setMeetupDraft(value);}} onDraftChange={setMeetupDraft} placeholder="Where exactly should people meet?" validate={value=>value.length>500?'Keep meeting instructions under 500 characters.':null}/></div>
    </section>
    <section className="event-section" aria-labelledby="event-details"><div className="event-section-heading"><h2 id="event-details">A few more details</h2></div>
     <NumberField label="Maximum people" value={capacity} onValueChange={setCapacity} min={1} max={500} suffix=" people"/>
     <fieldset className="event-fieldset event-bring"><legend>Bring along <span>Optional</span></legend><div className="event-bring-options">{bringOptions.map(value=><Button key={value} type="button" variant={materials.includes(value)?'primary':'secondary'} aria-pressed={materials.includes(value)} onClick={()=>toggleMaterial(value)}>{materials.includes(value)&&<Check size={14}/>}<span>{value}</span></Button>)}<Button type="button" variant="ghost" aria-expanded={showExtra} onClick={()=>setShowExtra(!showExtra)}><Plus size={15}/>Other</Button></div>{showExtra&&<Input label="Anything else to bring?" value={extraMaterial} onChange={event=>setExtraMaterial(event.target.value)} maxLength={350} placeholder="Add another item"/>}</fieldset>
    </section>
    <section className="event-section event-description-editor" aria-labelledby="event-about"><h2 id="event-about">About this meetup</h2><InlineEdit variant="body" multiline label="Meetup description" value={description} onSave={value=>{setDescription(value);setDescriptionDraft(value);}} onDraftChange={setDescriptionDraft} placeholder="Tell people what you have planned…" validate={value=>value.length>2500?'Keep the description under 2,500 characters.':null}/></section>
   </form>
   <aside className="event-live-preview" aria-label="Meetup preview"><div className="event-preview-heading"><span>Your meetup</span><span>Preview</span></div><PosterCustomizer value={poster} onChange={setPoster}/><MeetupPoster poster={poster} activity={activity} title={titleDraft||'Your meetup name'} description={descriptionDraft||'What you’re bringing people together to do.'} dateLabel={startDate?dateLabel(startDate):'Choose a date'} timeLabel={`${timeLabel(startTime)} · ${durations.find(option=>option.value===String(duration))?.label}${endsAt?` · Ends ${new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date(endsAt))}`:''} IST`} location={location||'Choose a meetup place'} meetup={meetupDraft} capacity={capacity} recurrence={recurrence} materials={[...materials,extraMaterial.trim()].filter(Boolean).join(' · ')}/>{recurrence&&schedule.length>0&&<details className="event-preview-dates"><summary>See all {schedule.length} dates</summary><ol>{schedule.map(date=><li key={date.startsAt}>{new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(date.startsAt))}</li>)}</ol></details>}{report&&<Link className="text-link small" to={'/reports/'+report.incident.id}>Linked report: {report.incident.title}<ArrowRight size={14}/></Link>}</aside>
  </div>
  <footer className="event-create-footer"><ErrorNotice message={error}/><p>Your meetup will be public immediately. You’ll get a link to share.</p><Button type="submit" form="event-creation-form" size="lg" loading={busy}>{recurring?`Create ${occurrences} meetups`:'Create meetup'}<ArrowRight size={17}/></Button></footer>
 </div>;
}
