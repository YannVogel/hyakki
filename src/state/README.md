# `src/state` — l'orchestration

Store zustand qui fait le lien entre le moteur et les écrans : boucle `step` (≈ 10 Hz), sélecteurs, actions du joueur.

## Règles

- Importe `engine` ; jamais `features`.
- Ne contient pas de règle de jeu : il appelle le moteur et expose son état.

## Contenu

| Élément | Rôle |
|---|---|
| `createGameStore(deps)` | Store zustand : état du jeu, file des entrées du joueur (`tap`, `castTalisman`, décisions Gardien), `tick(dtMs)` qui appelle `step` (pas d'au plus 1 s), achats et actions (Sanctuaire, équipe, niveaux, Festival), sauvegarde. Dépendances injectées (stockage, horloge, graine) : testable avec `testing/fakeStore.ts`. |
| `createAppStore()` | Le store de l'app, branché sur MMKV et l'horloge (`src/services`). Une sauvegarde illisible est mise de côté, jamais écrasée. |
| `useGameLoop(store)` | Boucle ≈ 10 Hz au premier plan ; sauvegarde toutes les 5 s et au passage en arrière-plan ; au lancement et au retour, `resume()` calcule l'absence (`simulateOffline`) et prépare le rapport (aucun sous une minute). |
| `GameStoreProvider`, `useGame(selector)` | Accès au store depuis les écrans. |
| `selectors.ts` | Vues pures pour les écrans : ennemi (PV restants, chrono du Gardien), défilé (vague dans la centaine), puissance, talismans. |
