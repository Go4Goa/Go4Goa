import { pointSchema, type Point } from '../shared/model.ts';
import { config, placesApiKey } from './config.ts';
import { fail } from './security.ts';

interface Place { id:string; name:string; label:string; point:Point }
interface SearchResult { places:Place[]; attribution:{label:string;url:string} }
interface Suggestion { id:string; name:string; label:string; point?:Point }
const googleAttribution={label:'Google Maps',url:'https://maps.google.com/'};
const goaRectangle={low:{latitude:14.8,longitude:73.6},high:{latitude:15.85,longitude:74.4}};
const cache=new Map<string,{expires:number;result:SearchResult}>();

async function googleRequest(path:string,fields:string,body?:object):Promise<Response>{
 const key=placesApiKey();
 if(!key)fail(503,'Place search is not configured. Choose a location on the map.');
 try {
  const response=await fetch(`https://places.googleapis.com/v1/${path}`,{
   method:body?'POST':'GET',
   headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':fields},
   ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000),
  });
  if(!response.ok)return fail(502,'Place search is temporarily unavailable. Try again or choose on the map.');
  return response;
 } catch { return fail(502,'Place search could not connect. Try again or choose on the map.'); }
}

export async function suggestPlaces(query:string,sessionToken:string):Promise<{places:Suggestion[];attribution:SearchResult['attribution']}>{
 if(!placesApiKey())return searchPlaces(query);
 const response=await googleRequest('places:autocomplete','suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',{
  input:query,sessionToken,languageCode:'en',includedRegionCodes:['in'],locationRestriction:{rectangle:goaRectangle},
 });
 const data=await response.json() as {suggestions?:{placePrediction?:{placeId?:string;text?:{text?:string};structuredFormat?:{mainText?:{text?:string};secondaryText?:{text?:string}}}}[]};
 const places:Suggestion[]=[];
 for(const suggestion of data.suggestions||[]){
  const prediction=suggestion.placePrediction;
  if(!prediction?.placeId||!prediction.text?.text)continue;
  places.push({id:prediction.placeId,name:prediction.structuredFormat?.mainText?.text||prediction.text.text,label:prediction.structuredFormat?.secondaryText?.text||prediction.text.text});
 }
 return {places,attribution:googleAttribution};
}

export async function resolvePlace(id:string,sessionToken:string):Promise<Place>{
 const params=new URLSearchParams({sessionToken,languageCode:'en'});
 const response=await googleRequest(`places/${encodeURIComponent(id)}?${params}`,'id,displayName,formattedAddress,location');
 const place=await response.json() as {id?:string;displayName?:{text?:string};formattedAddress?:string;location?:{latitude:number;longitude:number}};
 const point=pointSchema.safeParse({lat:place.location?.latitude,lng:place.location?.longitude});
 if(!place.id||!place.displayName?.text||!point.success)return fail(422,'Choose a place within Goa, or set its location on the map.');
 return {id:place.id,name:place.displayName.text,label:place.formattedAddress||place.displayName.text,point:point.data};
}

// Adapted from Dizko backend/services/venue_suggest.py: a text query biased to
// the event's city, a minimal field mask, bounded results and validated points.
// Google search responses are returned directly, never added to the OSM cache.
async function searchGooglePlaces(query:string,apiKey:string):Promise<SearchResult>{
 let response:Response;
 try {
  response=await fetch('https://places.googleapis.com/v1/places:searchText',{
   method:'POST',
   headers:{'Content-Type':'application/json','X-Goog-Api-Key':apiKey,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.location'},
   body:JSON.stringify({textQuery:/\bgoa\b/i.test(query)?query:`${query}, Goa`,pageSize:6,languageCode:'en',locationRestriction:{rectangle:{low:{latitude:14.8,longitude:73.6},high:{latitude:15.85,longitude:74.4}}}}),
   signal:AbortSignal.timeout(10000),
  });
 } catch { return fail(502,'Place search could not connect. Try again or choose on the map.'); }
 if(!response.ok)fail(502,'Place search is temporarily unavailable. Try again or choose on the map.');
 const data=await response.json() as {places?:{id:string;displayName?:{text?:string};formattedAddress?:string;location?:{latitude:number;longitude:number}}[]};
 const places:Place[]=[];
 for(const place of data.places||[]){
  const point=pointSchema.safeParse({lat:place.location?.latitude,lng:place.location?.longitude});
  if(!place.id||!place.displayName?.text||!point.success)continue;
  places.push({id:place.id,name:place.displayName.text,label:place.formattedAddress||place.displayName.text,point:point.data});
 }
 return {places,attribution:{label:'Google Maps',url:'https://maps.google.com/'}};
}

// Photon remains the keyless local fallback, with narrower business coverage.
// Search is debounced in the client. Only non-Google responses are cached here.
export async function searchPlaces(query:string):Promise<SearchResult>{
 const apiKey=placesApiKey();
 if(apiKey)return searchGooglePlaces(query,apiKey);
 const key=query.toLocaleLowerCase('en-IN');
 const cached=cache.get(key);
 if(cached&&cached.expires>Date.now())return cached.result;
 let result:SearchResult;
 if(config.mapKey){
  const params=new URLSearchParams({key:config.mapKey,bbox:'73.6,14.8,74.4,15.85',limit:'6'});
  const response=await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?${params}`,{signal:AbortSignal.timeout(10000)});
  if(!response.ok)fail(502,'Place search is unavailable. Try again or choose on the map.');
  const data=await response.json() as {features:{id:string;place_name:string;text?:string;center:number[]}[]};
  result={places:data.features.map(feature=>({id:feature.id,name:feature.text||feature.place_name.split(',')[0],label:feature.place_name,point:{lng:feature.center[0],lat:feature.center[1]}})).filter(place=>pointSchema.safeParse(place.point).success),attribution:{label:'MapTiler / OpenStreetMap',url:'https://www.maptiler.com/copyright/'}};
 }else{
  if(config.production||config.qa||!config.demo)fail(503,'Place search is not configured yet. Choose your meetup spot on the map.');
  const params=new URLSearchParams({q:query,limit:'6',lat:'15.49',lon:'73.81',bbox:'73.6,14.8,74.4,15.85',lang:'en'});
  const response=await fetch(`https://photon.komoot.io/api/?${params}`,{headers:{'User-Agent':'GO-GOA/0.1 (local event creation prototype)'},signal:AbortSignal.timeout(10000)});
  if(!response.ok)fail(502,'Place search is unavailable. Try again or choose on the map.');
  const data=await response.json() as {features:{geometry:{coordinates:number[]};properties:{osm_type:string;osm_id:number;name?:string;street?:string;city?:string;district?:string;county?:string;state?:string}}[]};
  const seen=new Set<string>();
  const places:Place[]=[];
  for(const feature of data.features){
   const properties=feature.properties;
   const point=pointSchema.safeParse({lng:feature.geometry.coordinates[0],lat:feature.geometry.coordinates[1]});
   const name=properties.name||properties.street||properties.city;
   const id=properties.osm_type+properties.osm_id;
   if(!name||!point.success||seen.has(id))continue;
   seen.add(id);
   const label=[...new Set([name,properties.street,properties.city,properties.district,properties.county,properties.state].filter(Boolean))].join(', ');
   places.push({id,name,label,point:point.data});
  }
  result={places,attribution:{label:'Photon · OpenStreetMap contributors',url:'https://www.openstreetmap.org/copyright'}};
 }
 if(cache.size>=100)cache.delete(cache.keys().next().value!);
 cache.set(key,{expires:Date.now()+86400000,result});
 return result;
}
