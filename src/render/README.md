# `src/render` — le dessin Skia

Dessine ce que le moteur décrit : yōkai (depuis une spec), scène de combat, effets.

## Règles

- Importe `engine` (types et fonctions pures), jamais `features` ni `state`.
- Toute la géométrie (chemins, ancres) vit ici ; la spec d'un yōkai n'en contient pas.
- Les chemins d'un yōkai sont construits une fois par spec, puis mémoïsés.
- Les animations respectent « réduire les animations ».
