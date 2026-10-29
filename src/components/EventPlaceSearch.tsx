import { PlaceSearch, type Place } from './PlaceSearch';

// Keep the meetup entry point stable while sharing lookup with report landmarks.
export type EventPlace = Place;
export function EventPlaceSearch({onSelect}:{onSelect:(place:Place)=>void}) {
 return <PlaceSearch onSelect={onSelect}/>;
}
