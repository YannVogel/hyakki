# Pipeline art

Le jeu est **hybride** :

| Quoi | Comment | Où |
|---|---|---|
| Héros (l'onmyōji), 10 poses | Illustrations ChatGPT, détourées | `assets/images/hero/` |
| Gardiens (boss), 10 en V1 | Illustrations ChatGPT, détourées | `assets/images/bosses/` |
| Yōkai ordinaires | Générés en code (Skia) | `src/engine/yokai/`, `src/render/yokai/` |
| Décors, interface, effets | Dessinés en code (Skia, composants) | `src/render/`, `src/ui/` |

## 1. Règles de cohérence

- Toutes les générations se font **dans la même conversation ChatGPT**, avec la planche de référence (`design/sources/planche-bestiaire.png`) en contexte.
- Style imposé à chaque prompt : chibi cartoon-animé, ~2,5 têtes, contour épais uniforme `#2B1D3F`, cel-shading à une seule ombre, lumière en haut à gauche, palette saturée.
- Fond uni crème `#FFF4DC` (ou transparent), aucun texte, aucune ombre au sol, figures séparées dans une grille.
- Orientation : le héros regarde **à droite**, les Gardiens regardent **à gauche** (ils se font face en combat). Un retournement horizontal en code reste possible.
- Contenu tout public : pas de sang, pas de tabac, pas d'alcool.

## 2. Planches existantes

| Fichier | Contenu |
|---|---|
| `design/sources/planche-bestiaire.png` | Planche de référence de style (héros en 3 poses + yōkai d'essai + premier Nurarihyon) |
| `design/sources/planche-heros.png` | 10 poses du héros |
| `design/sources/planche-boss.png` | 10 Gardiens (le n° 10 y est remplacé par la version 3 ci-dessous) |
| `design/sources/nurarihyon-v3.png` | Nurarihyon, version 3, générée seule |

Ordre des poses du héros : 01 attente, 02 attaque, 03 sort de feu, 04 sort de foudre, 05 barrière, 06 touché, 07 K.-O., 08 victoire, 09 sommeil, 10 surpris.

Chaque pose garde sa propre taille (de 221 × 446 à 384 × 332 px), toutes à la même échelle et les pieds à 6–7 px du bord bas. Le code connaît ces tailles (`HERO_POSES` dans `src/features/shared/images.ts`, vérifiées par un test contre les en-têtes PNG) et dessine chaque pose à l'échelle de la pose d'attente, ancrée par le bas : les pieds ne bougent pas d'une pose à l'autre. Une figure régénérée doit garder cette marge sous les pieds (`scripts/check_figures.py` le vérifie) et mettre à jour sa taille dans `HERO_POSES`.

Ordre des Gardiens : 01 Bake-danuki, 02 Kappa, 03 Karasu-tengu, 04 Tsuchigumo, 05 Yuki-onna, 06 Gashadokuro, 07 Nue, 08 Ibaraki-dōji, 09 Kyūbi no kitsune, 10 Nurarihyon.

### Nurarihyon : version 3

Les deux premières versions avaient une tête en long obus lisse et beige, qui pouvait prêter à une lecture involontaire. La version 3 le coiffe d'un haut chapeau de cour noir laqué, orné d'or et de rubans violets, qui cache entièrement le crâne tout en gardant sa silhouette haute. C'est la seule version à utiliser : `assets/images/bosses/boss-10-nurarihyon.png`.

## 3. Découper une planche

```bash
python3 scripts/cut_sheet.py design/sources/planche-heros.png assets/images/hero \
  --names hero-01-idle,hero-02-attaque,hero-03-feu,hero-04-foudre,hero-05-barriere,hero-06-touche,hero-07-ko,hero-08-victoire,hero-09-sommeil,hero-10-surpris \
  --dilate 3
```

Le script détecte les figures, rattache les petits éléments (flammes, gouttes, bulles, flocons) à la figure la plus proche, rend le fond transparent et adoucit les bords. Détails dans [`scripts/README.md`](../scripts/README.md).

Le découpage laisse un liseré crème anticrénelé autour du trait encré, visible sur fond coloré : le retirer avec `scripts/defringe.py`, puis vérifier avec `scripts/check_figures.py` (hauteur, frange, ligne des pieds des poses du héros).

```bash
python3 scripts/defringe.py assets/images/hero/*.png assets/images/bosses/*.png
python3 scripts/check_figures.py assets/images/hero assets/images/bosses --min-height 900
```

Toujours vérifier le résultat sur un fond coloré avant de committer.

## 4. Nommage

- Minuscules, ASCII, tirets : `hero-07-ko.png`, `boss-08-ibaraki-doji.png`.
- Le numéro donne l'ordre d'apparition (poses) ou de rencontre (Gardiens).
- Une nouvelle version d'une figure **remplace** le fichier (même nom) ; l'ancienne reste dans l'historique Git.

## 5. Haute définition

Les figures découpées depuis les planches font ~300 × 450 px : suffisant pour les maquettes, un peu juste sur tablette. Avant publication, régénérer chaque figure seule en grand (prompt ci-dessous, planche jointe), puis découper, défranger, vérifier et remplacer. Procédure pas à pas et liste des 20 figures : [`art/hd-regeneration.md`](art/hd-regeneration.md).

```text
Using the attached model sheet as the exact style reference, redraw ONLY figure [NUMBER] ([NAME]) as a single large standalone illustration.
Keep exactly the same design, proportions, colors, outline thickness and flat cel shading as on the sheet.
Square format, figure centered with empty space around it, transparent background (or plain flat #FFF4DC if transparency is not possible).
No text, no shadow on the ground, no scenery.
```

## 6. Icône et écran de lancement

L'icône est dessinée en code, comme les yōkai ordinaires : la mascotte est **Hitotsume-Chōchin-obake** (graine 116 300 du générateur), une lanterne en papier cyclope qui tire la langue, sur le ciel du festival avec soleil et collines. Les compositions vectorielles vivent dans `src/render/icon/appIcon.ts` (cadre 200 × 200, couleurs des tokens) ; `scripts/render-icons.ts` les rend en PNG avec CanvasKit (le moteur de Skia, en Node) :

| Fichier (`assets/images/app/`) | Contenu |
|---|---|
| `icon.png` | Icône iOS et stores, 1024 × 1024, opaque (Expo retire le canal alpha à la génération iOS) |
| `android-icon-background.png` | Fond de l'icône adaptative : ciel, soleil, collines |
| `android-icon-foreground.png` | Mascotte seule, dans la zone sûre de 66 dp sur 108 dp |
| `android-icon-monochrome.png` | Silhouette blanche pour les icônes à thème (Android 13+) : les contours encrés deviennent des jours |
| `splash-icon.png` | Mascotte seule sur transparence ; l'écran de lancement est crème (`imageWidth` 160 dans `app.config.ts`) |

```bash
npx tsx scripts/render-icons.ts /chemin/apercus   # le dossier d'aperçus (48, 96 et 180 px) est facultatif
```

L'icône dépend du générateur : la graine 116 300 doit continuer à donner la même lanterne (contrat de version, voir [`PROCEDURAL_YOKAI.md`](PROCEDURAL_YOKAI.md)). Un test le vérifie.
