# Journal de progression

Journal de reprise du travail autonome (voir [`AGENTS.md`](../AGENTS.md) § 3). Mis à jour à chaque commit.

## État

| | |
|---|---|
| Milestone en cours | 3 · Boucle jouable (`milestone/3-boucle`) |
| Dernière issue terminée | #32 Écran Sanctuaire |
| Prochaine issue | #33 Écran Shikigami |

## Milestones

| Milestone | État | PR |
|---|---|---|
| 0 · Fondations | Terminée | #52 |
| 1 · Moteur de jeu | Terminée (#53 attend Yann) | #54 |
| 2 · Fabrique à yōkai | Terminée (#55 attend une mesure sur appareil) | #56 |
| 3 · Boucle jouable | En cours | — |
| 4 · Feel & finitions | À faire | — |
| 5 · Publication | À faire | — |

## Points en suspens

- Milestone 3 : ordre #29, #30, puis #31 → #37. Écrans de développement sous `app/dev/` (appui long sur l'en-tête du défilé). Onglets Shikigami, Sanctuaire et Festival provisoires jusqu'à #32, #33, #36. Le cut-in (#35) remplacera `GuardianPanel`.
- Metro pour Maestro : `npx expo start --port 8081 < /dev/null` (le mode CI ne recharge pas le code).
- Équilibrage : relancer `npx tsx scripts/simulate.ts` après toute modification de `src/engine/balance.ts`.

- Les branches de milestone ne sont jamais réécrites une fois poussées (pas de push forcé) : un correctif de revue devient un commit `fix` qui référence l'issue.

- Ordre de la milestone 0 : #9, #11, #10, #12, #13 (#10 et #11 sont parallèles après #9 ; les tests des règles de lint de #10 s'appuient sur Jest installé par #11).
- iOS : modules Expo précompilés désactivés (voir `docs/DECISIONS.md`).
- Écrans temporaires à retirer quand les vrais écrans existeront (milestone 3) : accueil (`src/features/home`) et vérification native (`src/features/dev`, route `app/dev/native-check.tsx`). Ils utilisent les tokens depuis #29.
- Vérification locale : simulateur iOS « iPhone 17 » et AVD `Pixel_3a_API_33_arm64-v8a` ; Maestro dans `~/.maestro/bin`.

## Issues `besoin-yann`

- #53 Valider l'équilibrage (cibles et ressenti en jeu, après la milestone 3).
- #55 Vérifier les performances sur un Android d'entrée de gamme (Fabrique, puis Combat et Shikigami).
