# Architecture

## 1. Stack

| Besoin | Choix | Pourquoi |
|---|---|---|
| App | **Expo SDK 58** (React Native 0.88, React 19.3), **TypeScript 6 strict**, **expo-router** | Stack maîtrisée, builds iOS + Android depuis un seul code |
| Rendu de la scène, des yōkai et des effets | **@shopify/react-native-skia** | Dessin vectoriel performant, chemins SVG, shaders |
| Animations, gestes | **react-native-reanimated**, **react-native-gesture-handler** | Animations et tap sur le thread UI |
| État de l'UI | **zustand** | Store minimal qui orchestre moteur ↔ écrans |
| Sauvegarde | **react-native-mmkv** 4 (sur Nitro Modules) | Lecture/écriture synchrone et rapide d'un état sérialisé |
| Grands nombres | **break_infinity.js** derrière un adaptateur `BigNum` | Les grandeurs dépassent `1e308` ; l'adaptateur permet de changer de lib |
| Notifications | **expo-notifications** (locales uniquement) | Plafond hors ligne atteint |
| Haptique | **expo-haptics** | Frappes, critiques, Gardien vaincu |
| Fond de l'app | **expo-system-ui** | Couleur crème de la vue racine et thème clair forcé sur Android (pas de flash blanc après l'écran de lancement) |
| Icône | **canvaskit-wasm** (dev, même version que celle embarquée par Skia) | `scripts/render-icons.ts` rend l'icône vectorielle en PNG, en Node |
| Tests | **Jest** (`jest-expo`), **@testing-library/react-native**, **fast-check**, **Maestro** | Unitaires, propriétés, composants, parcours. Sous Jest : Reanimated en implémentation JS (`jest.resolver.js`), Skia et Nitro simulés (`jest.setup.js`), MMKV en mémoire |
| Qualité | **ESLint**, **Prettier**, règles d'imports (voir § 3) | |
| CI | **GitHub Actions** ([`ci.yml`](../.github/workflows/ci.yml)) | Lint, typecheck, tests avec seuil de couverture, sur chaque PR et chaque push sur `main` |

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
    economy/              coûts et achats du Sanctuaire
    shikigami/            captures, collection, équipe, montée de niveau
    prestige/             Festival
    offline/              gains hors ligne
    save/                 sérialisation versionnée, validation, migrations
    testing/              générateurs fast-check partagés par les tests (hors couverture)
    gameState.ts          état complet du jeu (GameState) et nouvelle partie
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
scripts/                  outils (découpe des planches, simulation d'équilibrage, rendu de l'icône)
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
- `render` et `state` importent `engine` (types et fonctions pures), jamais `features`. `render` lit aussi les tokens de couleur (`src/ui/tokens`) pour le décor ; `state` utilise `services` (stockage, horloge).
- `ui` n'importe ni `features`, ni `state`, ni `engine`.
- `services` n'importe pas `features`.

Ces règles sont vérifiées par ESLint ([`eslint.config.js`](../eslint.config.js)) : une violation fait échouer `npm run lint` et la CI.

| Règle | Outil |
|---|---|
| Frontières entre couches | `import/no-restricted-paths` (alias `@/` résolus par le resolver TypeScript) |
| `engine` n'importe que lui-même ; `break_infinity.js` seulement dans `numbers/bigNum.ts` | `no-restricted-imports` (hors fichiers de test) |
| Pas d'horloge dans `engine` (`Date`, `performance`) | `no-restricted-globals` |
| Pas de `Math.random` ni de `crypto` dans `engine` | `no-restricted-properties`, `no-restricted-globals` |

[`src/architecture.test.ts`](../src/architecture.test.ts) prouve chaque règle en lintant des extraits placés dans chaque couche.

### Navigation

- `app/index.tsx` affiche l'écran principal (`src/features/shell/MainScreen`) : les quatre onglets (Combat, Shikigami, Sanctuaire, Festival) sont gérés par un état local et notre `TabBar` (expo-router 58 ne propose que des onglets natifs, non personnalisables).
- Les autres écrans sont des routes empilées (`app/…`). Les écrans de développement sont sous `app/dev/` ; en development build, un appui long sur l'en-tête du défilé ouvre leur hub.
- La racine (`app/_layout.tsx`) charge les polices, crée le store, lance la boucle de jeu et fournit gestes, zones sûres, store et haptique.

## 4. Moteur

### 4.1 Principe

Le moteur est une **fonction de transition** : `step(state, dtMs, inputs) → { state, events }`.

- `state` : l'état complet du jeu, sérialisable.
- `dtMs` : le temps écoulé, **injecté** (le moteur ne lit jamais l'horloge).
- `inputs` : les actions du joueur depuis le dernier tick (frappes, talismans, achats).
- `events` : ce que l'UI doit animer (dégâts, critique, yōkai vaincu, capture, Gardien…).

L'UI appelle `step` à intervalle régulier (≈ 10 fois par seconde) et anime les `events`. Les animations ne modifient jamais l'état.

Chaque pas couvre l'intervalle [début, fin[ et les attaques suivent des minuteurs fixes : découper une durée en plusieurs pas donne le même résultat (voir `docs/GAME_DESIGN.md` § 5.1).

### 4.2 Hors ligne

Au retour, `simulateOffline(state, elapsedMs)` calcule le résultat **analytiquement par segments** (une vague entière à la fois), pas en rejouant des milliers de ticks. Il respecte le plafond et s'arrête au Gardien suivant.

### 4.3 Hasard

Tout tirage passe par `engine/rng`. La graine d'un yōkai dérive du défilé et de la vague : `seed = hash(seedDuDéfilé, vague)`. Une même partie rejoue donc les mêmes yōkai, ce qui rend les tests et les rapports de bug reproductibles.

## 5. Sauvegarde

- Un objet JSON unique : `{ savedAt, state }`. `state` est le `GameState` (avec `schemaVersion` et `generatorVersion`), les `BigNum` y sont écrits sous forme texte sans perte (`4.8249e4`).
- Le moteur ne stocke que l'essentiel : l'ennemi courant est une graine et des dégâts subis, ses PV max se recalculent.
- Écrit dans MMKV toutes les 5 s et à chaque passage en arrière-plan.
- Les shikigami sont stockés par **graine** (quelques octets chacun) avec la version du générateur de leur capture, jamais par apparence.
- `deserialize(texte)` ne lève jamais d'exception : il renvoie `{ ok: true, state, savedAt }` ou `{ ok: false, error }` avec une raison typée (`invalid-json`, `unsupported-version`, `invalid-shape`). La validation vérifie chaque champ et la cohérence (équipe possédée, graines uniques…).
- Chaque changement de schéma ajoute une migration testée (`save/migrations/vN-to-vN+1.ts`), appliquée avant la validation.
- `savedAt` (horloge murale, fournie par `services`) sert au calcul hors ligne. Une heure système qui recule ne donne jamais de gains négatifs ni de gains bonus.

## 6. Build

L'app utilise des modules natifs (Skia, MMKV via Nitro, Reanimated) : elle tourne dans un **development build**, jamais dans Expo Go. Les dossiers `ios/` et `android/` sont générés (Continuous Native Generation) et ignorés par Git : toute configuration native passe par [`app.config.ts`](../app.config.ts) et ses plugins.

### En local (recommandé, gratuit)

Prérequis : Node 24, Xcode et CocoaPods (iOS), Android Studio avec un SDK et un émulateur (Android, `ANDROID_HOME` défini).

```bash
npm install
npm run ios        # prebuild + pod install + build Xcode, installe et lance sur le simulateur
npm run android    # prebuild + build Gradle, installe et lance sur l'émulateur démarré
npm start          # Metro seul, quand l'app est déjà installée
```

Le premier build iOS est long (~10 min) : les modules Expo sont compilés depuis les sources (voir [`DECISIONS.md`](DECISIONS.md)). Les suivants réutilisent le cache de Xcode.

En développement, l'écran d'accueil propose un lien « Vérification native » (Skia animé par Reanimated, compteur MMKV) ; le parcours `e2e/native-check.yaml` le vérifie.

### Dans le cloud (EAS Build)

L'offre gratuite d'EAS Build demande un compte Expo et, pour iOS sur appareil, un compte Apple Developer. Elle servira aux builds de production (milestone 5).

## 7. Performance

- Cible : 60 i/s sur un Android d'entrée de gamme récent.
- Les specs de yōkai sont calculées une fois puis mémoïsées par graine.
- Les chemins Skia d'un yōkai sont construits une fois par spec.
- Les PNG du héros et des Gardiens sont chargés à la demande.
