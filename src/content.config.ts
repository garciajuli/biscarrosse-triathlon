import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const agenda = defineCollection({
  loader: glob({ base: './src/content/agenda', pattern: '**/*.md' }),
  schema: z.object({
    titre: z.string(),
    date: z.coerce.date(),
    date_fin: z.coerce.date().optional(),
    lieu: z.string(),
    type: z.enum(['Compétition', 'Club', 'Stage', 'Bénévoles']).catch('Compétition'),
    disciplines: z.array(z.enum(['natation', 'velo', 'course'])).default([]),
    format: z.string().optional(),
    resume: z.string().optional(),
    lien_inscription: z.string().optional(),
    brouillon: z.boolean().default(false),
  }),
});

export const collections = { agenda };
