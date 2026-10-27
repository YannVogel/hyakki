# `src/services` — les effets de bord

Accès à la plateforme : persistance (MMKV), notifications locales, haptique, horloge.

## Règles

- N'importe pas `features`.
- Chaque service reste optionnel à l'exécution : une erreur de plateforme ne bloque jamais le jeu.
- Aucun appel réseau.
