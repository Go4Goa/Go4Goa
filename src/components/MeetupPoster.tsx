import { CalendarDays, MapPin, Repeat2, Users } from 'lucide-react';
import { defaultPoster,type PosterStyle } from '../../shared/meetup-poster';
import { activityLabel, type Activity } from '../../shared/model';
import { recurrenceLabel, type Recurrence } from '../../shared/event-schedule';
import '@fontsource-variable/inter';
import '@fontsource-variable/geist';
import './meetup-poster.css';

interface Props {
 activity:Activity; title:string; description:string; dateLabel:string; timeLabel:string;
 location:string; meetup?:string; capacity:number; materials?:string; recurrence?:Recurrence|null;
 heading?:'h1'|'h2'; poster?:PosterStyle;
}
export function MeetupPoster({activity,title,description,dateLabel,timeLabel,location,meetup,capacity,materials,recurrence,heading:Heading='h2',poster=defaultPoster}:Props){
 return <div className="event-preview-poster" data-poster-color={poster.color} data-poster-pattern={poster.pattern}><span>{activityLabel[activity]}</span><Heading>{title}</Heading><p className="event-preview-purpose">{description}</p><div className="event-preview-details">
  <p><CalendarDays size={18}/><span>{dateLabel}<small>{timeLabel}</small></span></p>
  <p><MapPin size={18}/><span>{location}{meetup&&<small>{meetup}</small>}</span></p>
  <p><Users size={18}/><span>Room for {capacity} people</span></p>
  {recurrence&&<p><Repeat2 size={18}/><span>{recurrenceLabel(recurrence)}</span></p>}
  {materials&&<p className="event-preview-materials"><span>Bring along<small>{materials}</small></span></p>}
 </div></div>;
}
