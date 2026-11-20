/* Génère les traces GPX PROVISOIRES des parcours (public/uploads/parcours/*.gpx).
   Repères : lac de Cazaux-Sanguinet, départ camping de Navarrosse (Biscarrosse).
   À remplacer par les vraies traces dès qu'elles sont relevées — même nom de fichier,
   rien d'autre à toucher : les pages lisent les distances directement dans le GPX. */
import { writeFileSync, mkdirSync } from 'node:fs';

const LAT_M = 111130;                                     // mètres par degré de latitude
const LON_M = 111320 * Math.cos((44.44 * Math.PI) / 180); // idem en longitude, à cette latitude

const dist = (a, b) => Math.hypot((b[0] - a[0]) * LAT_M, (b[1] - a[1]) * LON_M);
const longueur = (pts) => pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0);

/* RNG déterministe : mêmes fichiers à chaque exécution, donc diffs git lisibles. */
let graine = 20260921;
const rnd = () => ((graine = (graine * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

/* Catmull-Rom : transforme une poignée de points de passage en courbe continue. */
function lisser(pts, boucle, pas) {
  const p = boucle ? [...pts, pts[0]] : pts;
  const at = (i) => p[boucle ? (i + p.length - 1) % (p.length - 1) : Math.max(0, Math.min(p.length - 1, i))];
  const out = [];
  for (let i = 0; i < p.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const n = Math.max(2, Math.round(dist(p1, p2) / pas));
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) =>
        0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
          (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(boucle ? out[0] : p[p.length - 1]);
  return out;
}

/* Dilate la trace autour de SON DÉPART pour tomber sur la distance officielle.
   Autour du départ et non du centre : l'aire de transition et l'entrée dans l'eau
   sont des points réels, la boucle grandit vers l'intérieur des terres plutôt que
   d'emmener le départ dans le lac. */
function caler(pts, cibleKm) {
  const k = (cibleKm * 1000) / longueur(pts);
  const [la, lo] = pts[0];
  return pts.map(([a, b]) => [la + (a - la) * k, lo + (b - lo) * k]);
}

/** Un segment = une discipline = un <trk> dans le GPX. */
function segment({ nom, discipline, points, km, boucle = false }) {
  /* ~500 points par trace : assez pour un tracé net, assez peu pour un fichier léger. */
  const pas = Math.max(20, (km ?? longueur(points) / 1000) * 2);
  const brut = discipline === 'natation' ? points : lisser(points, boucle, pas);
  const pts = km ? caler(brut, km) : brut;
  /* Quelques mètres de bruit : une trace parfaitement lisse ne ressemble à rien. */
  return { nom, discipline, points: pts.map(([la, lo]) => [la + (rnd() * 3) / LAT_M, lo + (rnd() * 3) / LON_M]) };
}

function gpx(nom, description, segments) {
  const trks = segments.map((s) => {
    const pts = s.points
      .map(([la, lo], i) => {
        /* Landes : relief plat, de 8 à 40 m. Ondulation douce pour un profil crédible. */
        const alt = s.discipline === 'natation' ? 8 : 14 + 16 * Math.sin((i / s.points.length) * Math.PI * 3) + rnd();
        return `        <trkpt lat="${la.toFixed(6)}" lon="${lo.toFixed(6)}"><ele>${alt.toFixed(1)}</ele></trkpt>`;
      })
      .join('\n');
    return `    <trk>\n      <name>${s.nom}</name>\n      <type>${s.discipline}</type>\n      <trkseg>\n${pts}\n      </trkseg>\n    </trk>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Biscarrosse Olympique Triathlon" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${nom}</name>
    <desc>${description}</desc>
  </metadata>
${trks.join('\n')}
</gpx>
`;
}

/* Repères relevés sur OpenStreetMap (lac de Cazaux-Sanguinet) :
   T = aire de transition, à terre près du port de Navarrosse ;
   E = entrée dans l'eau, à quelques mètres de là. */
const T = [44.4318, -1.1668];
const E = [44.433, -1.1672];

/* ------------------------------------------------------- TRIATHLON ----- */
/* Un tour de l'aller-retour en bord de lac ; le 10 km en fait deux. */
const TOUR_COURSE = [T, [44.428, -1.163], [44.422, -1.161], [44.416, -1.158], [44.4105, -1.155],
                     [44.416, -1.158], [44.422, -1.161], [44.428, -1.163], T];

const triathlonM = [
  segment({ nom: 'Natation — 1,5 km', discipline: 'natation', km: 1.5,
    points: [E, [44.436, -1.172], [44.4345, -1.176], E] }),
  /* Grande boucle Navarrosse — Biscarrosse — Parentis — Sanguinet, par l'est du lac. */
  segment({ nom: 'Vélo — 40 km', discipline: 'velo', km: 40,
    points: [T, [44.4285, -1.159], [44.41, -1.1555], [44.3907, -1.1609], [44.37, -1.15],
             [44.354, -1.076], [44.39, -1.035], [44.44, -1.04], [44.485, -1.076], [44.46, -1.112],
             [44.445, -1.138], [44.4378, -1.1538], [44.4345, -1.1592], [44.4328, -1.1632], T] }),
  segment({ nom: 'Course à pied — 10 km', discipline: 'course', km: 10,
    points: [...TOUR_COURSE, ...TOUR_COURSE.slice(1)] }),
];

const triathlonXS = [
  segment({ nom: 'Natation — 400 m', discipline: 'natation', km: 0.4,
    points: [E, [44.434, -1.1685], [44.4334, -1.1697], E] }),
  /* La boucle reste à l'est de la route du lac : sans ce garde-fou, le lissage
     fait mordre la courbe de fermeture sur l'eau. */
  segment({ nom: 'Vélo — 10 km', discipline: 'velo', km: 10,
    points: [T, [44.4285, -1.159], [44.4215, -1.1505], [44.418, -1.1335], [44.4315, -1.1305],
             [44.4385, -1.1445], [44.4378, -1.1538], [44.4345, -1.1592], [44.4328, -1.1632], T] }),
  segment({ nom: 'Course à pied — 2,5 km', discipline: 'course', km: 2.5,
    points: [T, [44.428, -1.163], [44.4235, -1.1613], [44.42, -1.1595], [44.4235, -1.1613],
             [44.428, -1.163], T] }),
];

mkdirSync('public/uploads/parcours', { recursive: true });
const fichiers = {};
for (const [prefixe, format, segments] of [
  ['triathlon-m', 'Format M', triathlonM],
  ['triathlon-xs', 'Format XS', triathlonXS],
]) {
  for (const s of segments) {
    fichiers[`${prefixe}-${s.discipline}.gpx`] = gpx(`Triathlon de Biscarrosse — ${format} — ${s.nom}`, 'Tracé PROVISOIRE.', [s]);
  }
}
for (const [nom, contenu] of Object.entries(fichiers)) {
  writeFileSync(`public/uploads/parcours/${nom}`, contenu);
  console.log(nom.padEnd(26), (contenu.match(/<trkpt/g) || []).length, 'points,', (contenu.length / 1024).toFixed(0), 'Ko');
}
