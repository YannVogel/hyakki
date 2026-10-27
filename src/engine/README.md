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
| `save/` | sérialisation versionnée, validation et migrations |
| `testing/` | générateurs fast-check partagés par les tests |

Chaque module apparaît avec l'issue qui l'implémente (milestones 1 et 2).

## API

### `rng/` — hasard à graine

| Fonction | Rôle |
|---|---|
| `createRng(seed)` | Générateur mulberry32 : `next()` tire un flottant dans [0, 1[, `getState()` renvoie l'état ; `createRng(état)` reprend la séquence exactement là où elle s'était arrêtée (état sérialisable dans la sauvegarde). |
| `mulberry32(seed)` | Raccourci : la fonction `next` seule. Port à l'identique du prototype : la séquence d'une graine est un contrat. |
| `pick(random, items)` | Tirage uniforme, `floor(random() × longueur)` comme le prototype. |
| `chance(random, p)` | Vrai avec la probabilité `p`. |
| `randomInt(random, min, max)` | Entier uniforme dans [min, max]. |
| `deriveSeed(seed, index)` | Hash 32 bits stable : graine du yōkai de la vague `index` d'un défilé de graine `seed`. Bijectif en `index` pour une graine donnée (aucune collision entre vagues). |

Architecture complète : [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

### `numbers/` — grands nombres

| Fonction | Rôle |
|---|---|
| `BigNum` | Type opaque (adaptateur sur `break_infinity.js`, seul fichier autorisé à l'importer). |
| `big(n)`, `ZERO`, `ONE` | Création. Les opérations acceptent aussi un `number` en entrée. |
| `add`, `sub`, `mul`, `div`, `pow`, `floor`, `min`, `max` | Arithmétique, sans limite de `1e308`. |
| `compare`, `eq`, `lt`, `lte`, `gt`, `gte` | Comparaisons. |
| `toNumber`, `log10`, `toMantissaExponent` | Conversions (`toNumber` vaut `Infinity` au-delà de `1e308`). |
| `stringifyBigNum`, `parseBigNum` | Forme texte sans perte pour la sauvegarde (`<mantisse>e<exposant>`) ; `BigNumParseError` si le texte est invalide. |
| `formatNumber(n)` | Affichage français tronqué : `1 284`, `48,2 k`, `1,28 M`, `3,4 Md`, `1 aa`… (espace fine insécable, 3 chiffres significatifs). |

### `yokai/` — générateur procédural

| Élément | Rôle |
|---|---|
| `generate(seed)` | Spec d'un yōkai (identifiants seulement, aucune géométrie). Pure, identique au prototype. |
| `GENERATOR_VERSION` | Version des listes de pièces (1). Toute modification qui change une graine existante l'incrémente. |
| `OBJECTS`, `EYES`, `MOUTHS`, `LIMBS`, `ACCESSORIES`, `PALETTES`, `RARITIES`, `SUFFIXES` | Listes de pièces V1 : leur ordre est un contrat. |
| `countCombinations()` | Nombre de yōkai distincts (285 696 en V1). |
| `statsOf(spec)` | PV, attaque, défense, vitesse (arrondis comme le prototype), chance de critique, brûlure, bonus d'âmes, traits. |
| `traitsOf(spec)` | Traits visibles et leurs effets (fractions : `0.08` = +8 %), dans l'ordre des pièces. |
| `nameOf(spec)` | Nom japonais (`Mitsume-Taiko-obake`), identique dans toutes les langues. La description française est dans `src/i18n/yokai.ts`. |

### État et sauvegarde

| Élément | Rôle |
|---|---|
| `GameState` | État complet et sérialisable : défilé, ennemi (graine + dégâts subis), âmes, ofuda, étincelles, Sanctuaire, shikigami, équipe, recharges, minuteurs d'attaque, état du RNG, galerie. |
| `createNewGame(seed)` | Premier défilé, vague 1. |
| `enemySeed(paradeSeed, wave, repeat)` | Graine du yōkai d'une vague ; les répétitions (farm devant un Gardien) ont leur propre graine. |
| `serialize(state, savedAt)` / `deserialize(text)` | Fichier de sauvegarde ; `deserialize` renvoie un résultat typé, jamais d'exception. |

### `combat/` — boucle de combat

| Élément | Rôle |
|---|---|
| `step(state, dtMs, inputs)` | Fonction de transition pure : renvoie `{ state, events }`. Temps injecté ; découpage en pas sans effet sur le résultat. |
| `CombatInput` | Actions du joueur depuis le pas précédent (`tap`…), appliquées au début du pas. |
| `CombatEvent` | Ce que l'UI anime : `hit` (source, dégâts, critique), `yokaiDefeated` (âmes), `waveStarted`… avec `atMs`, le décalage dans le pas. |
| `combatPower(state)` | Dégâts, chance de critique, brûlure et multiplicateur d'âmes dérivés de l'état. |
| `waveHp`, `waveSouls`, `yokaiMaxHp`, `yokaiProfile` | Formules de `docs/GAME_DESIGN.md` § 5. |

`balance.ts` regroupe toutes les constantes réglables.

### `shikigami/` — collection et équipe

| Élément | Rôle |
|---|---|
| `captureChance(seed)` | Chance de capture selon la rareté (2 %, 1 %, 0,4 %, 0,1 %). Le tirage a lieu dans `step` à chaque yōkai vaincu (événement `shikigamiCaptured`). |
| `addCapture(collection, seed, version)` | Nouveau shikigami au niveau 1, ou +1 niveau pour une graine déjà possédée. |
| `setTeam(state, seeds)` | Équipe active (3 au plus, distincts, possédés) ; résultat typé. |
| `levelUpCost(level)`, `levelUpShikigami(state, seed)` | Montée de niveau contre des âmes ; résultat typé. |
| `teamBonus(seeds)`, `shikigamiHitRatio`, `shikigamiIntervalMs`, `shikigamiStats` | Bonus d'équipe et puissance d'un shikigami (voir `docs/GAME_DESIGN.md` § 4.4). |
