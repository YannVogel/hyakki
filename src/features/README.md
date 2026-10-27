# `src/features` — écrans et flux

Un dossier par écran ou flux (combat, sanctuaire, shikigami, gardiens, festival, retour). Les routes de `app/` ne font que les exposer.

## Règles

- Compose `ui`, `render`, `state`, `services` et `i18n`.
- Aucune logique de jeu : elle vit dans `engine` et s'orchestre dans `state`.
- Aucun texte joueur en dur : tout vient de `src/i18n/`.
- Aucune valeur de style en dur : tout vient des tokens de `src/ui`.

| Dossier | Contenu |
|---|---|
| `shell/` | Écran principal à onglets |
| `combat/` | Écran Combat : en-tête, scène (frappe détectée sur le thread UI), HUD de l'ennemi, puissance et équipe, talismans, décisions face au Gardien |
| `sanctuary/` | Écran Sanctuaire : solde et gain par seconde, ×1 / ×10 / Max, améliorations (effets tirés de `BALANCE`) |
| `shikigami/` | Écran Shikigami : équipe active (bonus principal), collection en grille virtualisée (miniatures Skia statiques mémoïsées), fiche (stats, traits, montée de niveau, équipe) |
| `festival/` | Écran Festival : scène de fête, étincelles à gagner, bonus avant → après, confirmation obligatoire avant de relancer le défilé |
| `offline/` | Modale de retour hors ligne : durée, yōkai, âmes, vagues, montées de niveau, plafond |
| `guardians/` | Galerie des Gardiens (route `/guardians`) : vague, état, silhouette tant qu'un Gardien n'a pas été croisé |
| `shared/` | Icônes des maquettes, illustrations (héros, Gardiens) |
| `dev/`, `home/` | Écrans de développement (hub, vérification native, Fabrique, catalogue) |
| `testing/` | `renderScreen` : rendu d'un écran avec les fournisseurs de l'app et un store en mémoire |
