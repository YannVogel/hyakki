# `src/services` — les effets de bord

Accès à la plateforme : persistance (MMKV), notifications locales, haptique, son (`audio.ts` : bruitages préchargés, anti-rafale, deux musiques en boucle), horloge.

## Règles

- N'importe pas `features`.
- Chaque service reste optionnel à l'exécution : une erreur de plateforme ne bloque jamais le jeu.
- Aucun appel réseau.
