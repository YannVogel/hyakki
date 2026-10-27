# Journal de progression

Journal de reprise du travail autonome (voir [`AGENTS.md`](../AGENTS.md) § 3). Mis à jour à chaque commit.

## État

| | |
|---|---|
| Milestone en cours | 0 · Fondations (`milestone/0-fondations`) |
| Dernière issue terminée | #13 Development builds iOS et Android |
| Prochaine issue | Clôture de la milestone 0 (PR, CI, revue, merge), puis #14 RNG à graine |

## Milestones

| Milestone | État | PR |
|---|---|---|
| 0 · Fondations | En cours | — |
| 1 · Moteur de jeu | À faire | — |
| 2 · Fabrique à yōkai | À faire | — |
| 3 · Boucle jouable | À faire | — |
| 4 · Feel & finitions | À faire | — |
| 5 · Publication | À faire | — |

## Points en suspens

- Ordre de la milestone 0 : #9, #11, #10, #12, #13 (#10 et #11 sont parallèles après #9 ; les tests des règles de lint de #10 s'appuient sur Jest installé par #11).
- iOS : modules Expo précompilés désactivés (voir `docs/DECISIONS.md`).
- Écrans temporaires à retirer quand les vrais écrans existeront (milestone 3) : accueil (`src/features/home`) et vérification native (`src/features/dev`, route `app/dev/native-check.tsx`). Ils lisent encore `design/tokens.json` directement en attendant #29.
- Vérification locale : simulateur iOS « iPhone 17 » et AVD `Pixel_3a_API_33_arm64-v8a` ; Maestro dans `~/.maestro/bin`.

## Issues `besoin-yann`

- Aucune.
