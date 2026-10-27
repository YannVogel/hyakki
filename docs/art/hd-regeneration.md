# Régénération des illustrations en haute définition

Procédure pas à pas pour l'issue de suivi de #39 : chaque figure du héros et des Gardiens est redessinée seule, en grand, dans la conversation ChatGPT de référence, puis découpée, défrangée et vérifiée. Règles de style : [`ART_PIPELINE.md`](../ART_PIPELINE.md) § 1.

## Avant de commencer

1. Ouvrir la conversation ChatGPT de référence (celle des planches) et y joindre la planche concernée : `design/sources/planche-heros.png` pour le héros, `design/sources/planche-boss.png` pour les Gardiens (et `design/sources/nurarihyon-v3.png` pour Nurarihyon).
2. Installer les outils une fois : `python3 -m pip install pillow numpy scipy`.

## Pour chaque figure

1. Copier le prompt de la figure (ci-dessous) dans la conversation, la planche jointe.
2. Télécharger l'image obtenue dans `design/sources/hd/<nom>.png` (créer le dossier ; ces sources restent dans le repo).
3. Découper : `python3 scripts/cut_sheet.py design/sources/hd/<nom>.png /tmp/hd --names <nom> --dilate 1`.
4. Défranger : `python3 scripts/defringe.py /tmp/hd/<nom>.png`.
5. Vérifier : `python3 scripts/check_figures.py /tmp/hd --min-height 900` doit afficher `OK`.
6. Remplacer le fichier de `assets/images/hero/` ou `assets/images/bosses/` (même nom).

Quand les 20 figures sont remplacées : `python3 scripts/check_figures.py assets/images/hero assets/images/bosses --min-height 900` (la ligne des pieds des poses du héros doit être `OK`), puis lancer l'app (`npm run ios`) et regarder le combat, le cut-in d'un Gardien et la galerie.

## Prompt commun

```text
Using the attached model sheet as the exact style reference, redraw ONLY figure [NUMBER] ([NAME]) as a single large standalone illustration.
Keep exactly the same design, proportions, colors, outline thickness and flat cel shading as on the sheet.
Square format, figure centered with empty space around it, transparent background (or plain flat #FFF4DC if transparency is not possible).
No text, no shadow on the ground, no scenery.
```

Pour le héros, ajouter : `Same scale as the other poses: the character's feet rest on the same line, 4% above the bottom edge.`

## Figures

| Figure | `[NUMBER]` / `[NAME]` | Fichier |
|---|---|---|
| Héros, pose 01 (attente) | `01` / `onmyoji, attente` | `assets/images/hero/hero-01-idle.png` |
| Héros, pose 02 (attaque) | `02` / `onmyoji, attaque` | `assets/images/hero/hero-02-attaque.png` |
| Héros, pose 03 (sort de feu) | `03` / `onmyoji, sort de feu` | `assets/images/hero/hero-03-feu.png` |
| Héros, pose 04 (sort de foudre) | `04` / `onmyoji, sort de foudre` | `assets/images/hero/hero-04-foudre.png` |
| Héros, pose 05 (barrière) | `05` / `onmyoji, barrière` | `assets/images/hero/hero-05-barriere.png` |
| Héros, pose 06 (touché) | `06` / `onmyoji, touché` | `assets/images/hero/hero-06-touche.png` |
| Héros, pose 07 (K.-O.) | `07` / `onmyoji, K.-O.` | `assets/images/hero/hero-07-ko.png` |
| Héros, pose 08 (victoire) | `08` / `onmyoji, victoire` | `assets/images/hero/hero-08-victoire.png` |
| Héros, pose 09 (sommeil) | `09` / `onmyoji, sommeil` | `assets/images/hero/hero-09-sommeil.png` |
| Héros, pose 10 (surpris) | `10` / `onmyoji, surpris` | `assets/images/hero/hero-10-surpris.png` |
| Gardien 01 | `01` / `Bake-danuki` | `assets/images/bosses/boss-01-bake-danuki.png` |
| Gardien 02 | `02` / `Kappa` | `assets/images/bosses/boss-02-kappa.png` |
| Gardien 03 | `03` / `Karasu-tengu` | `assets/images/bosses/boss-03-karasu-tengu.png` |
| Gardien 04 | `04` / `Tsuchigumo` | `assets/images/bosses/boss-04-tsuchigumo.png` |
| Gardien 05 | `05` / `Yuki-onna` | `assets/images/bosses/boss-05-yuki-onna.png` |
| Gardien 06 | `06` / `Gashadokuro` | `assets/images/bosses/boss-06-gashadokuro.png` |
| Gardien 07 | `07` / `Nue` | `assets/images/bosses/boss-07-nue.png` |
| Gardien 08 | `08` / `Ibaraki-dōji` | `assets/images/bosses/boss-08-ibaraki-doji.png` |
| Gardien 09 | `09` / `Kyūbi no kitsune` | `assets/images/bosses/boss-09-kyubi.png` |
| Gardien 10 | `10` / `Nurarihyon (version 3, chapeau de cour)` | `assets/images/bosses/boss-10-nurarihyon.png` |
