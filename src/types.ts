/**
 * Types des deux « singletons » éditoriaux (src/data/*.json).
 * Les collections Markdown sont typées par Zod dans src/content.config.ts.
 */

export interface Lien {
  libelle: string;
  lien: string;
}

/** Disciplines représentées par une icône (cf. DisciplineIcon). */
export type Discipline = 'natation' | 'velo' | 'course';

export interface EpreuveFormat {
  nom: string;
  /** Distances par discipline ; absent ou vide = « à venir » (Pages CMS omet les listes vides). */
  distances?: { discipline: Discipline; valeur: string }[];
  detail?: string | null;
  prix?: string | null;
}

/**
 * Une épreuve organisée par le club (triathlon, swimrun…), éditable
 * depuis src/data/<slug>.json. Les champs `null` s'affichent « À venir ».
 */
export interface Epreuve {
  slug: string;
  discipline: 'triathlon' | 'swimrun';
  nom: string;
  edition?: string | null;
  accroche: string;
  /** Date ISO (AAAA-MM-JJ) ou null si pas encore connue. */
  date?: string | null;
  heure?: string | null;
  lieu?: string | null;
  /** Absent quand aucun format n'est saisi (Pages CMS omet les listes vides). */
  formats?: EpreuveFormat[];
  parcours?: string | null;
  /** Matériel obligatoire (surtout pour le swimrun). */
  materiel?: string | null;
  tarifs?: string | null;
  lien_inscription?: string | null;
  /** Lien vers le règlement (PDF). */
  reglement?: string | null;
  retrait_dossards?: string | null;
  ravitaillements?: string | null;
  conditions?: string | null;
  contact?: string | null;
  seo: { titre: string; description: string; image?: string };
}

export interface Site {
  nom: string;
  nom_court: string;
  baseline: string;
  ville: string;
  affiliation: string;
  email: string;
  telephone: string;
  adresse: {
    lignes: string[];
    lien_maps: string;
  };
  reseaux: { nom: string; url: string }[];
  nav: Lien[];
  annonce: {
    actif: boolean;
    texte: string;
    libelle_lien: string;
    lien: string;
  };
}

export interface Home {
  seo: {
    titre: string;
    description: string;
    image: string;
  };
  hero: {
    surtitre: string;
    titre: string;
    accroche: string;
    cta_principal: Lien;
    cta_secondaire: Lien;
    compte_a_rebours: {
      actif: boolean;
      libelle: string;
      date: string;
      lien: string;
    };
  };
  chiffres: { valeur: string; libelle: string; detail: string }[];
  apropos: {
    eyebrow: string;
    titre: string;
    paragraphes: string[];
    points?: { titre: string; texte: string }[];
    image: string;
    image_alt: string;
    citation?: { texte: string; auteur: string };
  };
}
