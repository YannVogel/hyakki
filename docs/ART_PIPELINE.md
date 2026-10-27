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
| `design/sources/planche-boss.png` | 10 Gardiens |

Ordre des poses du héros : 01 attente, 02 attaque, 03 sort de feu, 04 sort de foudre, 05 barrière, 06 touché, 07 K.-O., 08 victoire, 09 sommeil, 10 surpris.

Ordre des Gardiens : 01 Bake-danuki, 02 Kappa, 03 Karasu-tengu, 04 Tsuchigumo, 05 Yuki-onna, 06 Gashadokuro, 07 Nue, 08 Ibaraki-dōji, 09 Kyūbi no kitsune, 10 Nurarihyon.

### Point ouvert : Nurarihyon

Malgré deux prompts, sa tête reste un long obus lisse et beige, qui peut prêter à une lecture involontaire. À corriger avant publication (issue dédiée). Pistes : tête en gourde nettement bilobée avec rides marquées et mèches, ou version coiffée d'un haut chapeau de cour.

## 3. Découper une planche

```bash
python3 scripts/cut_sheet.py design/sources/planche-heros.png assets/images/hero \
  --names hero-01-idle,hero-02-attaque,hero-03-feu,hero-04-foudre,hero-05-barriere,hero-06-touche,hero-07-ko,hero-08-victoire,hero-09-sommeil,hero-10-surpris \
  --dilate 3
```

Le script détecte les figures, rattache les petits éléments (flammes, gouttes, bulles, flocons) à la figure la plus proche, rend le fond transparent et adoucit les bords. Détails dans [`scripts/README.md`](../scripts/README.md).

Toujours vérifier le résultat sur un fond coloré avant de committer.

## 4. Nommage

- Minuscules, ASCII, tirets : `hero-07-ko.png`, `boss-08-ibaraki-doji.png`.
- Le numéro donne l'ordre d'apparition (poses) ou de rencontre (Gardiens).
- Une nouvelle version d'une figure **remplace** le fichier (même nom) ; l'ancienne reste dans l'historique Git.

## 5. Haute définition

Les figures découpées depuis les planches font ~300 × 450 px : suffisant pour les maquettes, un peu juste sur tablette. Avant publication, régénérer chaque figure seule en grand (prompt ci-dessous, planche jointe), puis découper et remplacer.

```text
Using the attached model sheet as the exact style reference, redraw ONLY figure [NUMBER] ([NAME]) as a single large standalone illustration.
Keep exactly the same design, proportions, colors, outline thickness and flat cel shading as on the sheet.
Square format, figure centered with empty space around it, transparent background (or plain flat #FFF4DC if transparency is not possible).
No text, no shadow on the ground, no scenery.
```
