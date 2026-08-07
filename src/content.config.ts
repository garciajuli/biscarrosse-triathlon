import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Champs image communs — les médias sont déposés par le CMS dans /public/uploads. */
const image = z.string().optional();

const actualites = defineCollection({
  loader: glob({ base: './src/content/actualites', pattern: '**/*.md' }),
  schema: z.object({
    titre: z.string(),
    date: z.coerce.date(),
    resume: z.string(),
    categorie: z
      .enum(['Vie du club', 'Résultats', 'Compétition', 'Entraînement', 'Partenaires'])
      // `.catch` : une catégorie inattendue ne casse pas le build du site
      .catch('Vie du club'),
    image,
    image_alt: z.string().optional(),
    epingle: z.boolean().default(false),
    brouillon: z.boolean().default(false),
  }),
});

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

const groupes = defineCollection({
  loader: glob({ base: './src/content/groupes', pattern: '**/*.md' }),
  schema: z.object({
    titre: z.string(),
    discipline: z.enum(['natation', 'velo', 'course', 'renforcement', 'multi']).catch('multi'),
    ordre: z.number().default(99),
    resume: z.string(),
    encadrant: z.string().optional(),
    creneaux: z
      .array(
        z.object({
          jour: z.string(),
          horaire: z.string(),
          lieu: z.string(),
          groupe: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const partenaires = defineCollection({
  loader: glob({ base: './src/content/partenaires', pattern: '**/*.md' }),
  schema: z.object({
    nom: z.string(),
    url: z.string().optional(),
    logo: image,
    niveau: z.enum(['principal', 'officiel', 'soutien']).catch('soutien'),
    ordre: z.number().default(99),
  }),
});

export const collections = { actualites, agenda, groupes, partenaires };
