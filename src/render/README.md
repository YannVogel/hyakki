# `src/render` — le dessin Skia

Dessine ce que le moteur décrit : yōkai (depuis une spec), scène de combat, effets.

## Règles

- Importe `engine` (types et fonctions pures), jamais `features` ni `state`.
- Toute la géométrie (chemins, ancres) vit ici ; la spec d'un yōkai n'en contient pas.
- Les chemins d'un yōkai sont construits une fois par spec, puis mémoïsés.
- Les animations respectent « réduire les animations ».

## Yōkai (`yokai/`)

| Élément | Rôle |
|---|---|
| `drawYokai(spec)` | Arbre de primitives pures (formes, peintures, groupes animés) dans le repère 200 × 200 du prototype. Testé par parité avec le SVG du prototype. |
| `YokaiCanvas` | Composant Skia de taille libre (`size`), avec libellé d'accessibilité ; animations du prototype sur le thread UI, désactivées si « réduire les animations ». |
| `motion.ts` | Animations (flottement, clignement, langue, flamme, scintillements) en fonctions pures du temps. |
| `colors.ts` | Couleurs d'art des palettes de yōkai (données du générateur, pas couleurs d'interface). |

## Réactions aux coups (`effects/hitReaction.ts`)

| Élément | Rôle |
|---|---|
| `reactionForEvents(events, motion)` | Coup le plus fort d'un pas sur l'ennemi encore debout (après le dernier `waveStarted`), avec son délai d'atterrissage (`landingDelayMs`, partagé avec les effets). |
| `planReaction(active, reaction, now)` | Ce qu'il faut jouer : une réaction plus faible ne coupe pas une plus forte en cours, l'éclair respecte `FLASH_MIN_GAP_MS`. |
| `REACTION_SHAPES`, `REDUCED_DIM` | Recul, écrasement, éclair et durée par force ; atténuation des animations réduites. |
| `flashMatrix(amount)` | Matrice de couleurs Skia qui blanchit le dessin d'un yōkai (prop `flash` de `YokaiCanvas`). |

