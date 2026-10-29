# `src/ui` — le design system

Tokens (`tokens.ts`, lus depuis [`design/tokens.json`](../../design/tokens.json)), aides de style (`styles.ts`), polices (`fonts.ts`), texte cerné (`OutlinedText`) et composants de base (`Button`, `Card`, `Pill`, `Slider`…). Les retours haptiques et sonores passent par des contextes (`useHaptics`, `useSound`) que la racine de l'app remplit.

## Règles

- N'importe ni `features`, ni `state`, ni `engine`.
- Aucune couleur, taille, rayon ou ombre en dur : tout vient des tokens (les couleurs littérales sont refusées par le lint).
- Chaque composant est accessible (rôle, libellé, cible ≥ 44 pt) et testé.

Référence : [`docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md).
