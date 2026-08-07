import homeJson from '../data/home.json';
import siteJson from '../data/site.json';
import triathlonJson from '../data/triathlon.json';
import swimrunJson from '../data/swimrun.json';
import type { Epreuve, Home, Site } from '../types';

/** Contenus « singleton » éditables depuis le CMS. */
export const site = siteJson as Site;
export const home = homeJson as Home;

/* Les JSON d'épreuves contiennent des unions littérales (discipline…) et des
   `null` : le passage par `unknown` évite un faux positif de `astro check`. */
export const triathlon = triathlonJson as unknown as Epreuve;
export const swimrun = swimrunJson as unknown as Epreuve;

/** Ordre d'affichage des épreuves sur la page d'accueil. */
export const epreuves: Epreuve[] = [triathlon, swimrun];

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
