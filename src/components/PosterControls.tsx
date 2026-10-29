import { Check, ChevronDown, Palette } from 'lucide-react';
import { posterColors, posterPatterns, type PosterStyle } from '../../shared/meetup-poster';
import { Button } from './arc/button/button';
import './poster-controls.css';
const labels={forest:'Forest',ocean:'Ocean',clay:'Clay',plum:'Plum',ink:'Ink',sand:'Sand',solid:'Solid',dots:'Dots',grid:'Grid',waves:'Waves'};
export function PosterControls({value,onChange,disabled=false}:{value:PosterStyle;onChange:(value:PosterStyle)=>void;disabled?:boolean}){
 return <div className="poster-controls">
  <fieldset disabled={disabled}><legend>Color</legend><div className="poster-color-options">{posterColors.map(color=><Button key={color} type="button" variant="ghost" aria-pressed={value.color===color} onClick={()=>onChange({...value,color})}><span className="poster-color-swatch" data-poster-color={color} aria-hidden="true"><Check size={18} style={{visibility:value.color===color?"visible":"hidden"}}/></span><span>{labels[color]}</span></Button>)}</div></fieldset>
  <fieldset disabled={disabled}><legend>Background</legend><div className="poster-background-options">{posterPatterns.map(pattern=><Button key={pattern} type="button" variant="secondary" aria-pressed={value.pattern===pattern} onClick={()=>onChange({...value,pattern})}><span className="poster-pattern-swatch" data-poster-color={value.color} data-poster-pattern={pattern} aria-hidden="true"/><span>{labels[pattern]}</span><Check size={14} aria-hidden="true" style={{visibility:value.pattern===pattern?"visible":"hidden"}}/></Button>)}</div></fieldset>
 </div>;
}
export function PosterCustomizer({value,onChange}:{value:PosterStyle;onChange:(value:PosterStyle)=>void}){
 return <details className="poster-customizer"><summary><Palette size={17}/>Customize graphic<ChevronDown className="poster-customizer-chevron" size={16}/></summary><PosterControls value={value} onChange={onChange}/></details>;
}
