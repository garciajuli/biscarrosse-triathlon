import homeJson from '../data/home.json';
import siteJson from '../data/site.json';
import triathlonJson from '../data/triathlon.json';
import swimrunJson from '../data/swimrun.json';
import type { Epreuve, Home, Site } from '../types';

/** Contenus « singleton » éditables depuis le CMS. */
export const site = siteJson as Site;
export const home = homeJson as Home;

/* `slug` et `discipline` sont structurels (URL, icônes) : on les injecte ici
   plutôt que dans les JSON, pour qu'ils ne soient pas éditables — ni effaçables —
   depuis Pages CMS, qui ne réécrit que les champs déclarés dans .pages.yml.
   Le passage par `unknown` évite un faux positif de `astro check` (unions
   littérales + `null` dans le JSON). */
export const triathlon = { slug: 'triathlon', discipline: 'triathlon', ...triathlonJson } as unknown as Epreuve;
export const swimrun = { slug: 'swimrun', discipline: 'swimrun', ...swimrunJson } as unknown as Epreuve;

/** Ordre d'affichage des épreuves sur la page d'accueil. */
export const epreuves: Epreuve[] = [triathlon, swimrun];

/**
 * Préfixe un chemin interne par le `base` du site (utile quand le site est
 * hébergé dans un sous-dossier, ex. GitHub Pages projet). Les liens externes
 * (mailto:, http…, tel:) et les ancres pures sont laissés intacts.
 * Marche avec base '/' (renvoie le chemin tel quel) comme avec un sous-dossier.
 */
export function withBase(path: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + path;
}

/* --------------------------------------------------------------
   Dates — formatage FR, figé en UTC pour que le rendu ne dépende
   pas du fuseau de la machine de build.
--------------------------------------------------------------- */
const opts = { timeZone: 'UTC' } as const;

const fLongue = new Intl.DateTimeFormat('fr-FR', { ...opts, day: 'numeric', month: 'long', year: 'numeric' });
const fMoyenne = new Intl.DateTimeFormat('fr-FR', { ...opts, day: 'numeric', month: 'long' });
const fJour = new Intl.DateTimeFormat('fr-FR', { ...opts, day: '2-digit' });
const fMois = new Intl.DateTimeFormat('fr-FR', { ...opts, month: 'short' });

export const dateLongue = (d: Date) => fLongue.format(d);
export const jour = (d: Date) => fJour.format(d);
export const mois = (d: Date) => fMois.format(d).replace('.', '');
export const annee = (d: Date) => String(d.getUTCFullYear());
export const iso = (d: Date) => d.toISOString().slice(0, 10);

/** « 13 février » → « 13 - 15 février 2027 » quand l'événement dure. */
export function periode(debut: Date, fin?: Date): string {
  if (!fin) return fLongue.format(debut);
  const memeMois = debut.getUTCMonth() === fin.getUTCMonth() && debut.getUTCFullYear() === fin.getUTCFullYear();
  return memeMois
    ? `${fJour.format(debut)} - ${fLongue.format(fin)}`
    : `${fMoyenne.format(debut)} - ${fLongue.format(fin)}`;
}

/** Minuit UTC du jour courant : évite qu'un événement disparaisse en cours de journée. */
export function aujourdhui(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

/** Une date ISO (AAAA-MM-JJ) est-elle aujourd'hui ou dans le futur ? */
export function estAVenir(dateIso?: string | null): boolean {
  if (!dateIso) return false;
  const d = new Date(dateIso);
  return !Number.isNaN(d.getTime()) && d >= aujourdhui();
}
