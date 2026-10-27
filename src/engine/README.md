# `src/engine` — le moteur du jeu

TypeScript **pur** : la vérité du jeu. Testable en Node, sans simulateur.

## Règles

- N'importe **rien** hors de `src/engine/` (seule exception : `break_infinity.js`, via `numbers/`).
- Jamais `Date.now()` : le temps écoulé est **injecté** (`step(state, dtMs, inputs)`).
- Jamais `Math.random()` : tout tirage passe par le RNG à graine (`rng/`).
- Toute grandeur exponentielle (PV, dégâts, âmes, coûts) est un `BigNum`, jamais un `number`.
- L'API publique est exposée par `index.ts` ; les autres couches n'importent que depuis là.

Ces règles sont appliquées par `npm run lint` ([`eslint.config.js`](../../eslint.config.js)) et prouvées par [`src/architecture.test.ts`](../architecture.test.ts). Les fichiers de test (`*.test.ts`) peuvent importer leurs outils (`fast-check`…).

## Modules

| Dossier | Rôle |
|---|---|
| `rng/` | mulberry32, dérivation des graines |
| `numbers/` | `BigNum` (adaptateur) et formatage français |
| `yokai/` | générateur procédural : spec, stats, nom |
| `combat/` | tick, dégâts, vagues, Gardiens, talismans |
| `economy/` | coûts, gains, Sanctuaire, captures |
| `prestige/` | Festival |
| `offline/` | gains hors ligne |
| `save/` | schéma de sauvegarde versionné et migrations |

Chaque module apparaît avec l'issue qui l'implémente (milestones 1 et 2).

Architecture complète : [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).
