# Journal de progression

Journal de reprise du travail autonome (voir [`AGENTS.md`](../AGENTS.md) § 3). Mis à jour à chaque commit.

## État

| | |
|---|---|
| Milestone en cours | 1 · Moteur de jeu (`milestone/1-moteur`) |
| Dernière issue terminée | #15 Grands nombres (BigNum) et formatage français |
| Prochaine issue | #24 Porter le générateur de yōkai en TypeScript pur |

## Milestones

| Milestone | État | PR |
|---|---|---|
| 0 · Fondations | Terminée | #52 |
| 1 · Moteur de jeu | En cours | — |
| 2 · Fabrique à yōkai | À faire | — |
| 3 · Boucle jouable | À faire | — |
| 4 · Feel & finitions | À faire | — |
| 5 · Publication | À faire | — |

## Points en suspens

- Milestone 1, ordre retenu : #14, #15, #24, #25, #16, #17, #27, #18, #19, #20, #21, #22, #23. #24, #25 et #27 (milestone 2) sont avancées car elles bloquent : les PV d'un yōkai dépendent de sa spec (#17) et le hors ligne tire des captures (#21). Notes de conception : voir `docs/GAME_DESIGN.md` au fil des issues.

- Les branches de milestone ne sont jamais réécrites une fois poussées (pas de push forcé) : un correctif de revue devient un commit `fix` qui référence l'issue.

- Ordre de la milestone 0 : #9, #11, #10, #12, #13 (#10 et #11 sont parallèles après #9 ; les tests des règles de lint de #10 s'appuient sur Jest installé par #11).
- iOS : modules Expo précompilés désactivés (voir `docs/DECISIONS.md`).
- Écrans temporaires à retirer quand les vrais écrans existeront (milestone 3) : accueil (`src/features/home`) et vérification native (`src/features/dev`, route `app/dev/native-check.tsx`). Ils lisent encore `design/tokens.json` directement en attendant #29.
- Vérification locale : simulateur iOS « iPhone 17 » et AVD `Pixel_3a_API_33_arm64-v8a` ; Maestro dans `~/.maestro/bin`.

## Issues `besoin-yann`

- Aucune.
