import { z } from 'zod';
export const posterColors=['forest','ocean','clay','plum','ink','sand'] as const;
export const posterPatterns=['solid','dots','grid','waves'] as const;
export const posterSchema=z.object({color:z.enum(posterColors),pattern:z.enum(posterPatterns)}).strict();
export type PosterStyle=z.infer<typeof posterSchema>;
export const defaultPoster:PosterStyle={color:'forest',pattern:'solid'};
