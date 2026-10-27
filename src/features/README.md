# `src/features` — écrans et flux

Un dossier par écran ou flux (combat, sanctuaire, shikigami, gardiens, festival, retour). Les routes de `app/` ne font que les exposer.

## Règles

- Compose `ui`, `render`, `state`, `services` et `i18n`.
- Aucune logique de jeu : elle vit dans `engine` et s'orchestre dans `state`.
- Aucun texte joueur en dur : tout vient de `src/i18n/`.
- Aucune valeur de style en dur : tout vient des tokens de `src/ui`.
