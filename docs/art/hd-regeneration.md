# Régénération des illustrations en haute définition

Procédure pas à pas de l'issue #58 (suite de #39) : chaque figure du héros et des Gardiens est redessinée seule, en grand, dans la conversation ChatGPT de référence, puis découpée, défrangée, remise à l'échelle (poses du héros) et vérifiée. Règles de style : [`ART_PIPELINE.md`](../ART_PIPELINE.md) § 1.

Fait le 29/10/2026 pour les 19 figures du tableau (sources dans `design/sources/hd/`) ; Nurarihyon l'était déjà (1039 × 1186 px, découpé depuis `design/sources/nurarihyon-v3.png`). La procédure reste valable pour redessiner une figure.

## Générer (Yann)

1. Ouvrir la conversation ChatGPT de référence (celle des planches) et y joindre la planche concernée : `design/sources/planche-heros.png` pour le héros, `design/sources/planche-boss.png` pour les Gardiens.
2. Pour chaque figure du tableau ci-dessous : copier le prompt commun en remplaçant `[NUMBER]`, `[NAME]` et `[FORMAT]`, puis télécharger l'image dans `design/sources/hd/<fichier>.png` (même nom que l'asset, par exemple `design/sources/hd/hero-01-idle.png`). Ces sources restent dans le repo.

## Prompt commun

```text
Using the attached model sheet as the exact style reference, redraw ONLY figure [NUMBER] ([NAME]) as a single large standalone illustration.
Keep exactly the same design, proportions, colors, outline thickness and flat cel shading as on the sheet.
[FORMAT] format. The figure fills the frame, with only a thin empty margin around it.
Plain flat background in #FFF4DC, exactly like the sheet: no transparency, no gradient, no texture.
No text, no shadow on the ground, no scenery.
```

Pourquoi ces consignes :

- **Fond crème, pas transparent** : `cut_sheet.py` détecte la figure par différence avec un fond uni. Sur une image transparente, il lit un fond noir et rend des bords crénelés semés de pixels parasites, que `check_figures.py` ne détecte pas.
- **Figure qui remplit le cadre, format adapté à sa silhouette** : chaque figure doit faire au moins 900 px de haut. La pose K.-O., couchée, est la plus basse : en paysage, elle garde assez de pixels une fois remise à l'échelle des autres poses.

## Figures

| Figure | `[NUMBER]` / `[NAME]` | `[FORMAT]` | Fichier |
|---|---|---|---|
| Héros, pose 01 (attente) | `01` / `onmyoji, attente` | `Portrait 2:3` | `hero-01-idle.png` |
| Héros, pose 02 (attaque) | `02` / `onmyoji, attaque` | `Portrait 2:3` | `hero-02-attaque.png` |
| Héros, pose 03 (sort de feu) | `03` / `onmyoji, sort de feu` | `Portrait 2:3` | `hero-03-feu.png` |
| Héros, pose 04 (sort de foudre) | `04` / `onmyoji, sort de foudre` | `Portrait 2:3` | `hero-04-foudre.png` |
| Héros, pose 05 (barrière) | `05` / `onmyoji, barrière` | `Portrait 2:3` | `hero-05-barriere.png` |
| Héros, pose 06 (touché) | `06` / `onmyoji, touché` | `Portrait 2:3` | `hero-06-touche.png` |
| Héros, pose 07 (K.-O.) | `07` / `onmyoji, K.-O.` | `Landscape 3:2` | `hero-07-ko.png` |
| Héros, pose 08 (victoire) | `08` / `onmyoji, victoire` | `Portrait 2:3` | `hero-08-victoire.png` |
| Héros, pose 09 (sommeil) | `09` / `onmyoji, sommeil` | `Portrait 2:3` | `hero-09-sommeil.png` |
| Héros, pose 10 (surpris) | `10` / `onmyoji, surpris` | `Portrait 2:3` | `hero-10-surpris.png` |
| Gardien 01 | `01` / `Bake-danuki` | `Square` | `boss-01-bake-danuki.png` |
| Gardien 02 | `02` / `Kappa` | `Square` | `boss-02-kappa.png` |
| Gardien 03 | `03` / `Karasu-tengu` | `Square` | `boss-03-karasu-tengu.png` |
| Gardien 04 | `04` / `Tsuchigumo` | `Square` | `boss-04-tsuchigumo.png` |
| Gardien 05 | `05` / `Yuki-onna` | `Square` | `boss-05-yuki-onna.png` |
| Gardien 06 | `06` / `Gashadokuro` | `Square` | `boss-06-gashadokuro.png` |
| Gardien 07 | `07` / `Nue` | `Square` | `boss-07-nue.png` |
| Gardien 08 | `08` / `Ibaraki-dōji` | `Square` | `boss-08-ibaraki-doji.png` |
| Gardien 09 | `09` / `Kyūbi no kitsune` | `Square` | `boss-09-kyubi.png` |

## Traiter

Outils, une fois : `python3 -m pip install pillow numpy scipy`.

```bash
# Découper chaque image (une figure par image) puis retirer le liseré crème
for f in design/sources/hd/*.png; do
  name=$(basename "$f" .png)
  python3 scripts/cut_sheet.py "$f" "/tmp/hd/${name%%-*}" --names "$name" --dilate 30
done
python3 scripts/defringe.py /tmp/hd/hero/*.png /tmp/hd/boss/*.png

# Remettre les poses du héros à une échelle commune (la plus grande sans agrandir aucune pose)
python3 scripts/scale_poses.py /tmp/hd/hero assets/images/hero

python3 scripts/check_figures.py /tmp/hd/hero /tmp/hd/boss --min-height 900
```

Une image ne contient qu'une figure : la forte dilatation soude ses effets détachés (spirale du K.-O., gouttes, flocons) au corps, alors qu'avec `--dilate 1` ceux à plus de 70 px de la figure, distance fréquente en haute définition, sont perdus. `parts=1` attendu ; contrôler quand même le résultat sur un fond coloré.

Puis :

1. Copier `/tmp/hd/hero/*.png` dans `assets/images/hero/` et `/tmp/hd/boss/*.png` dans `assets/images/bosses/`.
2. Reporter les tailles affichées par `scale_poses.py` dans `HERO_POSES` (`src/features/shared/images.ts`) et dans `images.test.ts`.
3. `python3 scripts/check_figures.py assets/images/hero assets/images/bosses --min-height 900` doit tout afficher `OK`, ligne des pieds comprise.
4. Lancer l'app (`npm run ios`) et regarder le combat, le cut-in d'un Gardien et la galerie.

Une pose régénérée plus tard, seule : la remettre à l'échelle des poses en place avec `--idle-height` égal à la hauteur actuelle de `hero-01-idle.png`.
