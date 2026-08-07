# Biscarrosse Olympique Triathlon — site vitrine

Site statique **Astro 5 + Tailwind 4**, contenu piloté par un **CMS git** (Pages CMS ou Decap).
Aucune base de données, aucun back-office à maintenir : chaque modification faite par le bureau
du club est un commit, qui redéclenche un déploiement automatique.

Tout le toolchain Node tourne **dans Docker** — rien n'est installé sur la machine.

---

## 1. Démarrer

```bash
docker compose up dev            # http://localhost:4321 (rechargement à chaud)
docker compose up -d dev cms     # + l'espace rédaction sur /admin (cf. § 4.0)
```

Autres commandes :

```bash
docker compose run --rm build     # génère ./dist
docker compose run --rm check     # typecheck Astro + TypeScript
docker compose run --rm --service-ports preview   # sert ./dist
docker compose run --rm shell     # shell dans le conteneur (npm add …)
```

`node_modules` vit dans un volume Docker nommé (`bo-triathlon_node_modules`).
Le dossier `node_modules/` visible à la racine est un point de montage vide.

Pour repartir de zéro : `docker compose down -v`.

---

## 2. Architecture

```
src/
├── data/                    ← contenus « uniques », éditables au CMS
│   ├── home.json            ·  tous les textes de la page d'accueil
│   └── site.json            ·  coordonnées, réseaux, menu, bandeau d'annonce
├── content/                 ← collections Markdown, éditables au CMS
│   ├── actualites/          ·  articles (page de détail générée)
│   ├── agenda/              ·  compétitions, stages, rendez-vous club
│   ├── groupes/             ·  disciplines + créneaux hebdomadaires
│   └── partenaires/         ·  sponsors, classés par niveau
├── components/              ← une section = un composant
│   └── ui/                  ·  Logo, Button, SectionHeader, PinesBand, icônes
├── layouts/BaseLayout.astro ← <head>, SEO, JSON-LD, header/footer, animations
├── pages/
│   ├── index.astro          ·  la page vitrine (assemblage des sections)
│   ├── actualites/[...slug] ·  page d'un article
│   ├── mentions-legales     ·  obligatoire (LCEN) — à compléter
│   └── 404.astro
├── content.config.ts        ← schémas Zod : un champ CMS invalide = build rouge
└── styles/global.css        ← design tokens (couleurs, typo) + utilitaires
```

**Ordre des sections de l'accueil** (repris de triathlonlacanau.fr, adapté à un club) :
héros + compte à rebours → chiffres clés → le club → créneaux d'entraînement → actualités →
agenda → adhésion & tarifs → appel aux bénévoles → galerie → partenaires → contact.

---

## 3. Charte graphique

Palette relevée sur la trifonction du club (`src/styles/global.css`, bloc `@theme`) :

| Token | Hex | Usage |
| --- | --- | --- |
| `navy-800` | `#16294B` | marine du corps de la trifonction — couleur signature |
| `navy-950` | `#0A1428` | pied de page, sections profondes |
| `ocean-400` | `#5BA4D8` | bandeau bleu ciel — boutons, accents |
| `ocean-600` | `#2F6D9F` | surtitres, liens |
| `foam-100` | `#E7F1F9` | fonds de section clairs |
| `sand-300` | `#E2D0A8` | accent sable des dunes, à doser |

Typographies **auto-hébergées** (aucune requête vers Google Fonts, donc pas de bandeau cookies
à ajouter pour ça) : *Barlow Condensed* pour les titres, *Inter* pour le texte.

Le motif de pins maritimes (`components/ui/PinesBand.astro`) est du SVG paramétrable — il reprend
la silhouette imprimée sur le flanc de la trifonction.

---

## 4. Brancher le CMS

Les deux options lisent et écrivent **exactement les mêmes fichiers**. Choisissez-en une,
et supprimez la configuration de l'autre.

### 4.0 — Essayer l'édition en local, sans GitHub

Les deux CMS s'authentifient via GitHub en production. Pour tester l'interface tout de suite,
Decap sait écrire directement dans les fichiers du disque :

```bash
docker compose up -d dev cms
```

puis <http://localhost:4321/admin/> → **« Login »** (aucun mot de passe, un badge
*Working with Local Repo* s'affiche en haut).

Chaque « Publier » écrit dans `src/data/*.json` ou `src/content/**` ; le serveur de dev
recharge la page instantanément. C'est le moyen le plus rapide de vérifier qu'un champ
tombe au bon endroit avant de mettre le site en ligne.

> Activé par `local_backend: true` dans `public/admin/config.yml`, ignoré dès que le site
> n'est plus servi depuis `localhost` — inutile de le retirer avant de déployer.

### Option A — Pages CMS (recommandé)

Interface hébergée, connexion par compte GitHub, **zéro infrastructure**.

1. Poussez le dépôt sur GitHub.
2. Allez sur <https://app.pagescms.org>, connectez-vous avec GitHub, autorisez le dépôt.
3. C'est tout : le fichier [`.pages.yml`](.pages.yml) décrit déjà tous les écrans d'édition.
4. Invitez les membres du bureau en tant que collaborateurs du dépôt GitHub.

Chaque enregistrement crée un commit → le déploiement se relance tout seul.
👉 supprimez alors `public/admin/` et `src/pages/admin/`.

### Option B — Decap CMS (auto-hébergé, `/admin`)

Livré prêt : la page [`src/pages/admin/index.astro`](src/pages/admin/index.astro) et sa
configuration [`public/admin/config.yml`](public/admin/config.yml). Il lui faut un fournisseur
OAuth **pour l'usage en production** :

1. Dans `public/admin/config.yml`, remplacez `ORGANISATION/DEPOT`.
2. Créez une **GitHub OAuth App** (callback : `https://<votre-proxy>/callback`).
3. Déployez un petit proxy OAuth (Cloudflare Worker ou fonction Netlify — plusieurs
   implémentations d'une trentaine de lignes existent), puis renseignez `base_url` dans la config.
4. Optionnel : décommentez `publish_mode: editorial_workflow` pour que chaque modification
   passe par une Pull Request à valider (incompatible avec l'édition locale du § 4.0).

👉 supprimez alors le fichier `.pages.yml`.

### Ce que le bureau peut modifier sans toucher au code

Textes de toutes les sections, chiffres clés, tarifs, étapes d'adhésion, bandeau d'annonce,
compte à rebours, photos, actualités, agenda, créneaux d'entraînement, partenaires, menu,
coordonnées et réseaux sociaux.

---

## 5. Déployer

Le site est 100 % statique — n'importe quel hébergeur convient.

**Cloudflare Pages / Netlify / Vercel** (recommandé, gratuit, build automatique) :

| Réglage | Valeur |
| --- | --- |
| Commande de build | `npm run build` |
| Dossier de sortie | `dist` |
| Version de Node | `22` |

**Auto-hébergement** — une image nginx est fournie :

```bash
docker build -t bo-triathlon .
docker run --rm -p 8080:80 bo-triathlon
```

---

## 6. À personnaliser avant la mise en ligne

Le contenu livré est **crédible mais fictif** : il sert à montrer le rendu.

- [ ] `astro.config.mjs` → `site:` avec le vrai domaine (sitemap + URLs de partage)
- [ ] `public/robots.txt` → même domaine dans `Sitemap:`
- [ ] `src/data/site.json` → coordonnées, adresse réelle, liens Facebook / Instagram / Strava
- [ ] `src/data/home.json` → chiffres du club, tarifs réels, textes
- [ ] `src/content/**` → vraies actualités, vrai calendrier, vrais créneaux, vrais partenaires
- [ ] `public/uploads/*.svg` → **photos réelles** (les placeholders affichent « PHOTO À REMPLACER »).
      Format conseillé : JPG/WebP, 1600 px de large, < 300 Ko
- [ ] `public/uploads/og-biscarrosse-triathlon.svg` → à remplacer par un **PNG ou JPG 1200×630**
      (les réseaux sociaux n'affichent pas les aperçus SVG) et mettre à jour `seo.image`
- [ ] Logos des partenaires : déposer les fichiers officiels. Tant que le champ *Logo* est vide,
      le nom s'affiche dans la typo du club — c'est volontaire, jamais de faux logo
- [ ] `src/pages/mentions-legales.astro` → champs `[à compléter]` (n° RNA/SIRET, hébergeur,
      représentant légal, crédits photo)

---

## 7. Choix techniques, en bref

- **Astro** : zéro JavaScript envoyé par défaut. Les seuls scripts sont le menu mobile,
  le compte à rebours et l'apparition au scroll — une quinzaine de lignes chacun.
- **Schémas Zod** (`content.config.ts`) : une saisie CMS invalide échoue au build, pas en prod.
  Les champs à choix utilisent `.catch()` : une valeur inattendue retombe sur un défaut plutôt
  que de casser le site du club un dimanche soir.
- **Accessibilité** : lien d'évitement, `aria-*` sur le menu, focus visibles, textes alternatifs
  éditables au CMS, respect de `prefers-reduced-motion`.
- **Vie privée** : aucune police, aucun script, aucune image servis depuis un domaine tiers.
- **Pages d'articles** : générées automatiquement pour chaque actualité, afin qu'un texte long
  rédigé dans le CMS ait bien une page où être lu.
