import { z } from 'zod';
export const posterColors=['forest','ocean','clay','plum','ink','sand','coral','mango','mint','sky','lilac','rose'] as const;
export const posterPatterns=['solid','dots','grid','waves','leaves','sunrise','coast','arches'] as const;
export const posterLabels={forest:'Forest',ocean:'Ocean',clay:'Clay',plum:'Plum',ink:'Ink',sand:'Sand',coral:'Coral',mango:'Mango',mint:'Mint',sky:'Sky',lilac:'Lilac',rose:'Rose',solid:'Solid',dots:'Dots',grid:'Grid',waves:'Waves',leaves:'Leaves',sunrise:'Sunrise',coast:'Coast',arches:'Arches'};
export const posterSchema=z.object({color:z.enum(posterColors),pattern:z.enum(posterPatterns)}).strict();
export type PosterStyle=z.infer<typeof posterSchema>;
export const defaultPoster:PosterStyle={color:'forest',pattern:'solid'};
