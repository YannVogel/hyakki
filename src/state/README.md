# `src/state` — l'orchestration

Store zustand qui fait le lien entre le moteur et les écrans : boucle `step` (≈ 10 Hz), sélecteurs, actions du joueur.

## Règles

- Importe `engine` ; jamais `features`.
- Ne contient pas de règle de jeu : il appelle le moteur et expose son état.
