# Architecture

## 1. Stack

| Besoin | Choix | Pourquoi |
|---|---|---|
| App | **Expo SDK 58** (React Native 0.88, React 19.3), **TypeScript 6 strict**, **expo-router** | Stack maîtrisée, builds iOS + Android depuis un seul code |
| Rendu de la scène, des yōkai et des effets | **@shopify/react-native-skia** | Dessin vectoriel performant, chemins SVG, shaders |
| Animations, gestes | **react-native-reanimated**, **react-native-gesture-handler** | Animations et tap sur le thread UI |
| État de l'UI | **zustand** | Store minimal qui orchestre moteur ↔ écrans |
| Sauvegarde | **react-native-mmkv** | Lecture/écriture synchrone et rapide d'un état sérialisé |
| Grands nombres | **break_infinity.js** derrière un adaptateur `BigNum` | Les grandeurs dépassent `1e308` ; l'adaptateur permet de changer de lib |
| Notifications | **expo-notifications** (locales uniquement) | Plafond hors ligne atteint |
| Haptique | **expo-haptics** | Frappes, critiques, Gardien vaincu |
| Tests | **Jest** (`jest-expo`), **@testing-library/react-native**, **fast-check**, **Maestro** | Unitaires, propriétés, composants, parcours |
| Qualité | **ESLint**, **Prettier**, règles d'imports (voir § 3) | |
| CI | **GitHub Actions** | Lint, typecheck, tests sur chaque PR |

MMKV et Skia demandent un **development build** (pas Expo Go).

Les versions exactes sont dans `package.json`. Ajoute toujours une dépendance native avec `npx expo install <paquet>` pour obtenir la version compatible avec le SDK.

## 2. Structure des dossiers

```
app/                      expo-router : routes et layouts, aucune logique de jeu
src/
  engine/                 TypeScript pur — la vérité du jeu (aucune dépendance externe hors break_infinity.js)
    rng/                  mulberry32, dérivation de graines
    numbers/              BigNum (adaptateur) + formatage FR (k, M, Md, aa, ab…)
    yokai/                générateur procédural : spec, stats, nom (sans rendu)
    combat/               tick, dégâts, vagues, Gardiens, talismans
    economy/              coûts, gains, Sanctuaire, captures
    prestige/             Festival
    offline/              gains hors ligne
    save/                 schéma de sauvegarde versionné + migrations
    index.ts              API publique du moteur
  render/                 Skia : dessine une spec de yōkai, la scène, les effets
  ui/                     design system : tokens, composants de base
  features/               écrans et flux (combat, sanctuaire, shikigami, gardiens, festival, retour)
  state/                  store zustand : boucle de jeu, sélecteurs, actions
  services/               persistance MMKV, notifications, haptique, horloge
  i18n/                   textes du jeu (FR en V1)
assets/
  images/app/             icône et écran de lancement
  images/hero/            10 poses du héros (PNG détourés)
  images/bosses/          10 Gardiens (PNG détourés)
  fonts/                  Mochiy Pop One, M PLUS Rounded 1c (+ licences OFL)
design/                   maquettes, tokens, planches sources, prototype du générateur
docs/                     documentation du projet
scripts/                  outils (découpe des planches, simulation d'équilibrage)
app.config.ts             configuration Expo (lit les couleurs dans design/tokens.json)
```

L'alias `@/` pointe vers `src/`.

## 3. Règles de dépendances

```
app ─► features ─► ui
            │  ├─► render ─► engine
            │  ├─► state ──► engine
            │  └─► services
            └─► i18n
```

- `engine` n'importe **rien** hors de lui-même (sauf `break_infinity.js` via `engine/numbers`).
- `render` et `state` importent `engine` (types et fonctions pures), jamais `features`.
- `ui` n'importe ni `features`, ni `state`, ni `engine`.
- `services` n'importe pas `features`.

Ces règles sont vérifiées par ESLint ([`eslint.config.js`](../eslint.config.js)) : une violation fait échouer `npm run lint` et la CI.

| Règle | Outil |
|---|---|
| Frontières entre couches | `import/no-restricted-paths` (alias `@/` résolus par le resolver TypeScript) |
| `engine` n'importe que lui-même et `break_infinity.js` | `no-restricted-imports` (hors fichiers de test) |
| Pas d'horloge dans `engine` (`Date`, `performance`) | `no-restricted-globals` |
| Pas de `Math.random` ni de `crypto` dans `engine` | `no-restricted-properties`, `no-restricted-globals` |

[`src/architecture.test.ts`](../src/architecture.test.ts) prouve chaque règle en lintant des extraits placés dans chaque couche.

## 4. Moteur

### 4.1 Principe

Le moteur est une **fonction de transition** : `step(state, dtMs, inputs) → { state, events }`.

- `state` : l'état complet du jeu, sérialisable.
- `dtMs` : le temps écoulé, **injecté** (le moteur ne lit jamais l'horloge).
- `inputs` : les actions du joueur depuis le dernier tick (frappes, talismans, achats).
- `events` : ce que l'UI doit animer (dégâts, critique, yōkai vaincu, capture, Gardien…).

L'UI appelle `step` à intervalle régulier (≈ 10 fois par seconde) et anime les `events`. Les animations ne modifient jamais l'état.

### 4.2 Hors ligne

Au retour, `simulateOffline(state, elapsedMs)` calcule le résultat **analytiquement par segments** (une vague entière à la fois), pas en rejouant des milliers de ticks. Il respecte le plafond et s'arrête au Gardien suivant.

### 4.3 Hasard

Tout tirage passe par `engine/rng`. La graine d'un yōkai dérive du défilé et de la vague : `seed = hash(seedDuDéfilé, vague)`. Une même partie rejoue donc les mêmes yōkai, ce qui rend les tests et les rapports de bug reproductibles.

## 5. Sauvegarde

- Un objet JSON unique, avec `schemaVersion` et `generatorVersion`.
- Écrit dans MMKV toutes les 5 s et à chaque passage en arrière-plan.
- Les shikigami sont stockés par **graine** (quelques octets chacun), jamais par apparence.
- Chaque changement de schéma ajoute une migration testée (`save/migrations`).
- Horodatage de la dernière sauvegarde : sert au calcul hors ligne. Une heure système qui recule ne donne jamais de gains négatifs ni de gains bonus.

## 6. Performance

- Cible : 60 i/s sur un Android d'entrée de gamme récent.
- Les specs de yōkai sont calculées une fois puis mémoïsées par graine.
- Les chemins Skia d'un yōkai sont construits une fois par spec.
- Les PNG du héros et des Gardiens sont chargés à la demande.
