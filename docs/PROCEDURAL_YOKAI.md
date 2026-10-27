# Générateur de yōkai (Fabrique à yōkai)

Les yōkai ordinaires sont des **tsukumogami** : des objets du quotidien qui prennent vie après cent ans. Chacun est assemblé en code à partir de pièces vectorielles, à partir d'une **graine** (un entier). Même graine, même yōkai, toujours.

Le prototype de référence est [`design/prototypes/fabrique-a-yokai.html`](../design/prototypes/fabrique-a-yokai.html) : ouvre-le dans un navigateur pour voir le générateur fonctionner. Le portage dans le jeu reprend sa logique en TypeScript pur (`src/engine/yokai/`) et son dessin en Skia (`src/render/yokai/`).

## 1. Principe

```
graine ──► RNG (mulberry32) ──► spec (objet, regard, bouche, membres, accessoires, palette)
                                   │
                                   ├──► stats, nom, description   (engine, pur, testé)
                                   └──► dessin Skia + animations  (render)
```

- `generate(seed): YokaiSpec` est **pur et déterministe**.
- La spec ne contient que des identifiants et quelques paramètres (direction du regard, décalage d'animation), jamais de géométrie.
- La géométrie (chemins, ancres) vit dans `render`, et se calcule depuis la spec.

## 2. L'ordre des tirages est un contrat

Les tirages se font **dans cet ordre exact** : objet, regard, bouche, membres, nombre d'accessoires, accessoires, rareté, palette, regard X, regard Y, décalage d'animation, suffixe du nom.

Changer cet ordre, ajouter un tirage au milieu, ou modifier une liste de pièces change le yōkai de **toutes** les graines. C'est une rupture : incrémente `GENERATOR_VERSION` et prévois une migration (les shikigami déjà capturés doivent garder leur apparence).

Pour ajouter des pièces sans rupture : versionner les listes (`PARTS_V1`, `PARTS_V2`) et choisir la liste selon la version du générateur.

## 3. Pièces (V1)

### Objets (6)

| Objet | Nom japonais | Genre FR | PV | ATQ | DÉF | VIT | Particularités |
|---|---|---|---|---|---|---|---|
| Lanterne | Chōchin | f | 100 | 90 | 80 | 110 | |
| Ombrelle | Kasa | f | 80 | 100 | 70 | 130 | Pas de hachimaki |
| Théière | Dobin | f | 140 | 80 | 110 | 60 | |
| Tambour | Taiko | m | 130 | 100 | 100 | 70 | |
| Geta | Geta | f | 90 | 120 | 90 | 100 | Pas de jambes, pas de hachimaki |
| Rouleau | Makimono | m | 85 | 90 | 75 | 120 | |

Chaque objet définit ses **ancres** : zone du visage (centre, largeur), point des cornes, point des jambes, points des bras.

### Regards (8)

Œil unique, Deux yeux, Clin d'œil, Trois yeux, Regard sournois, Yeux en points, Œil fendu, Grands yeux.

### Bouches (6)

Sourire, Crocs, Langue pendante, Bouche en O, Bouche tremblante, Grandes dents.

### Membres (4)

Aucun, Jambe unique (avec geta), Deux jambes, Deux bras.

### Accessoires (8, de 0 à 2 par yōkai)

Cornes, Corne unique (exclusive avec Cornes), Onibi, Ofuda, Fissures, Hachimaki, Clochette, Pansement.

Tirage du nombre : 0 (35 %), 1 (45 %), 2 (20 %).

### Palettes (8) et rareté

| Rareté | Probabilité | Palettes | Multiplicateur de stats |
|---|---|---|---|
| Commun | 60 % | Papier, Bois, Laque rouge, Céladon | ×1 |
| Rare | 25 % | Indigo, Sakura | ×1,25 |
| Épique | 11 % | Spectral (translucide) | ×1,6 |
| Légendaire | 4 % | Or (scintillements) | ×2,2 |

Total V1 : **285 696** combinaisons.

## 4. L'apparence fixe les stats

| Trait visible | Effet |
|---|---|
| Œil unique | +8 % critique |
| Œil fendu | +10 % critique |
| Trois yeux | +15 % critique |
| Regard sournois | +8 % attaque |
| Grands yeux | +10 % PV |
| Crocs | +15 % attaque |
| Grandes dents | +10 % attaque et défense |
| Langue pendante | +10 % vitesse |
| Jambe unique | +15 % vitesse |
| Deux jambes | +25 % vitesse |
| Deux bras | +15 % attaque |
| Cornes | +20 % attaque |
| Corne unique | +10 % attaque, +5 % critique |
| Onibi | brûlure 3 % des PV par seconde |
| Ofuda | +25 % défense |
| Fissures | +15 % attaque, −15 % défense |
| Hachimaki | +20 % vitesse |
| Clochette | +10 % d'âmes |
| Pansement | +20 % PV |

Stat finale = `stat de l'objet × (1 + somme des bonus de cette stat) × multiplicateur de rareté`. Critique de base : 5 %.

Ces bonus servent deux fois : comme ennemi (sa résistance) et comme shikigami (ses bonus d'équipe).

## 5. Nom et description

- **Nom** : `[préfixe-]Objet-suffixe`. Préfixe : `Hitotsume` (un œil), `Mitsume` (trois yeux), sinon le préfixe de la palette (`Aka`, `Ao`, `Kon`, `Sakura`, `Yūrei`, `Kin`). Suffixe : `oni` s'il a des cornes, sinon tiré parmi `obake`, `bō`, `kozō`, `nyūdō`. Exemple : *Mitsume-Taiko-obake*.
- **Description FR** : objet + adjectif de la bouche + adjectif du regard ou du premier accessoire, accordés en genre. Exemples : *Théière moqueuse à trois yeux*, *Lanterne cornue et rieuse*.

## 6. Dessin et animation

- Repère de 200 × 200, contour encre `#2B1D3F` de 3 à 3,5 unités, aplats de couleur, joues roses.
- Ordre des calques : ombre, cornes, membres, objet, détails (fissures, pansement, ofuda, hachimaki), visage, clochette, onibi, scintillements.
- Animations (désactivées si « réduire les animations ») : flottement (3,2 s), clignement des yeux (4,4 s), langue qui remue, flamme d'onibi qui vacille, scintillements des légendaires. Le décalage de départ vient de la graine, pour que deux yōkai ne bougent jamais en même temps.

## 7. Tests attendus

- Graines de référence (0, 1, 7, 42, 2026, 999 999) : snapshot de la spec, du nom, de la description et des stats.
- Propriété : `generate(s)` deux fois → résultats identiques, pour toute graine.
- Propriété : aucune spec ne combine des pièces exclues (Cornes + Corne unique, hachimaki sur ombrelle ou geta, jambes sur geta).
- Distribution des raretés sur 100 000 graines : à ±1 point des probabilités cibles.
