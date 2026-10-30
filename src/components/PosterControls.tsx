import { Check, ChevronDown, Palette, RotateCcw } from 'lucide-react';
import { defaultPoster, posterColors, posterPatterns, posterLabels, type PosterStyle } from '../../shared/meetup-poster';
import { Button } from './arc/button/button';
import { PosterArtwork } from './PosterArtwork';
import './meetup-poster.css';
import './poster-controls.css';

export function PosterControls({value,onChange,disabled=false}:{value:PosterStyle;onChange:(value:PosterStyle)=>void;disabled?:boolean}){
 const isDefault=value.color===defaultPoster.color&&value.pattern===defaultPoster.pattern;
 return <div className="poster-controls">
  <fieldset disabled={disabled}><legend>Background color</legend><div className="poster-color-options">{posterColors.map(color=><Button key={color} type="button" variant="ghost" aria-pressed={value.color===color} onClick={()=>onChange({...value,color})}><span className="poster-color-swatch" data-poster-color={color} aria-hidden="true"><Check size={18} style={{visibility:value.color===color?'visible':'hidden'}}/></span><span>{posterLabels[color]}</span></Button>)}</div></fieldset>
  <fieldset disabled={disabled}><legend>Graphic</legend><div className="poster-background-options">{posterPatterns.map(pattern=><Button key={pattern} type="button" variant="ghost" aria-pressed={value.pattern===pattern} onClick={()=>onChange({...value,pattern})}><span className="poster-pattern-swatch" data-poster-color={value.color} data-poster-pattern={pattern} aria-hidden="true"><PosterArtwork pattern={pattern}/></span><span className="poster-pattern-label">{posterLabels[pattern]}<Check size={12} aria-hidden="true" style={{visibility:value.pattern===pattern?'visible':'hidden'}}/></span></Button>)}</div></fieldset>
  <Button className="poster-reset" type="button" size="sm" variant="ghost" disabled={disabled||isDefault} onClick={()=>onChange({...defaultPoster})}><RotateCcw size={14} aria-hidden="true"/>Reset graphic</Button>
 </div>;
}
export function PosterCustomizer({value,onChange}:{value:PosterStyle;onChange:(value:PosterStyle)=>void}){
 return <details className="poster-customizer"><summary><Palette size={17} aria-hidden="true"/>Customize graphic<span className="poster-customizer-current" data-poster-color={value.color} aria-hidden="true"/><ChevronDown className="poster-customizer-chevron" size={16} aria-hidden="true"/></summary><PosterControls value={value} onChange={onChange}/></details>;
}
