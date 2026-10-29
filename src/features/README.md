# `src/features` — écrans et flux

Un dossier par écran ou flux (combat, sanctuaire, shikigami, gardiens, festival, retour). Les routes de `app/` ne font que les exposer.

## Règles

- Compose `ui`, `render`, `state`, `services` et `i18n`.
- Aucune logique de jeu : elle vit dans `engine` et s'orchestre dans `state`.
- Aucun texte joueur en dur : tout vient de `src/i18n/`.
- Aucune valeur de style en dur : tout vient des tokens de `src/ui`.

| Dossier | Contenu |
|---|---|
| `options/` | Onglet Options : sélecteur « Réglages / Règles » ; les règles du jeu en une carte par thème, chiffres tirés de `BALANCE` (`rulesText.ts`) |
| `settings/` | Liste des réglages du joueur (sons et musique avec leur volume, vibrations, notifications, réduire les animations), affichée par l'onglet Options |
| `shell/` | Écran principal à cinq onglets : Combat, Shikigami, Sanctuaire, Festival, Options |
| `combat/` | Écran Combat : en-tête, scène (frappe détectée sur le thread UI), HUD de l'ennemi, puissance et équipe, talismans, décisions face au Gardien |
| `sanctuary/` | Onglet Sanctuaire, deux boutiques au choix (`Segmented`) : le Sanctuaire (âmes : solde et gain par seconde, ×1 / ×10 / Max, `SoulsShop`) et le Kamidana (ofuda : 12 bénédictions en trois cartes, valeur actuelle → suivante, « Tout récupérer » avec confirmation, `KamidanaShop`). Effets et valeurs tirés de `BALANCE` et de `kamidanaEffect` |
| `shikigami/` | Écran Shikigami : équipe active (bonus principal), collection en grille virtualisée (miniatures Skia statiques mémoïsées), fiche (stats, traits, montée de niveau, équipe) |
| `festival/` | Écran Festival : scène de fête, étincelles à gagner, bonus avant → après, confirmation obligatoire avant de relancer le défilé |
| `offline/` | Modale de retour hors ligne : durée, yōkai, âmes, vagues, montées de niveau, plafond |
| `guardians/` | Galerie des Gardiens (route `/guardians`) : vague, état, silhouette tant qu'un Gardien n'a pas été croisé |
| `shared/` | Icônes des maquettes, illustrations (héros, Gardiens, décors) et icône illustrée des ofuda (`OfudaIcon`) |
| `dev/`, `home/` | Écrans de développement (hub, vérification native, Fabrique, catalogue) |
| `testing/` | `renderScreen` : rendu d'un écran avec les fournisseurs de l'app et un store en mémoire |
