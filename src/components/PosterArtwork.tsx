import type { PosterStyle } from '../../shared/meetup-poster';

/** Local vector artwork shared by the chooser thumbnails and the published poster. */
export function PosterArtwork({pattern}:{pattern:PosterStyle['pattern']}) {
 if(!['leaves','sunrise','coast','arches'].includes(pattern))return null;
 return <svg className="poster-artwork" viewBox="0 0 320 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" fill="none">
  {pattern==='leaves'&&<g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
   <path d="M323 425C210 333 288 222 210 58"/>
   <path d="M243 332C175 343 132 310 123 260C184 258 227 281 243 332Z M243 277C294 268 325 227 326 184C274 189 245 223 243 277Z M238 226C186 220 152 183 153 137C205 150 229 179 238 226Z M224 164C266 155 289 118 280 77C244 94 226 121 224 164Z M210 81C175 75 160 48 165 16C196 26 210 49 210 81Z" fill="currentColor"/>
   <path d="M271 404C220 381 180 385 152 413"/>
  </g>}
  {pattern==='sunrise'&&<g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
   <circle cx="243" cy="144" r="76" fill="currentColor" stroke="none"/>
   <path d="M-25 255Q65 214 155 255T335 255 M-25 285Q65 244 155 285T335 285 M-25 315Q65 274 155 315T335 315 M-25 345Q65 304 155 345T335 345 M-25 375Q65 334 155 375T335 375"/>
  </g>}
  {pattern==='coast'&&<g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
   <path d="M356-20C177 75 346 143 217 223S61 333 91 433 M326-20C147 75 316 143 187 223S31 333 61 433 M296-20C117 75 286 143 157 223S1 333 31 433 M266-20C87 75 256 143 127 223S-29 333 1 433 M236-20C57 75 226 143 97 223S-59 333-29 433"/>
  </g>}
  {pattern==='arches'&&<g stroke="currentColor" strokeWidth="12">
   <path d="M69 430V202a144 144 0 0 1 288 0v228 M101 430V202a112 112 0 0 1 224 0v228 M133 430V202a80 80 0 0 1 160 0v228 M165 430V202a48 48 0 0 1 96 0v228 M197 430V202a16 16 0 0 1 32 0v228"/>
  </g>}
 </svg>;
}
