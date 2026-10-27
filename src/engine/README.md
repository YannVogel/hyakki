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
| `testing/` | générateurs fast-check et états de test partagés (`stateAtWave`) |

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
| `generate(seed, version)` | Spec d'un yōkai avec les pièces d'une version du générateur (identifiants seulement, aucune géométrie). Pure ; la version 1 est identique au prototype. |
| `GENERATOR_VERSION` | Version des nouveaux défilés (2). Le défilé en cours garde la sienne (`state.generatorVersion`), chaque shikigami celle de sa capture. Toute modification qui changerait une graine existante crée une nouvelle version. |
| `PARTS[version]` (objets, accessoires), `EYES`, `MOUTHS`, `LIMBS`, `PALETTES`, `RARITIES`, `SUFFIXES` | Listes de pièces : leur ordre est un contrat. La V2 ajoute ses pièces à la suite de celles de la V1. |
| `countCombinations(version)` | Nombre de yōkai distincts (285 696 en V1, 1 245 696 en V2). |
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
| `GUARDIANS`, `isGuardianWave`, `guardianAt`, `guardianMaxHp`, `guardianOfuda`, `tierMultiplier` | Gardiens : ordre, faiblesse, cycle éveillé, PV, ofuda, bonus de palier. |
| Entrées `engageGuardian`, `fleeGuardian`, `challengeGuardian` | Affronter après le cut-in, fuir, retenter depuis le farm. |
| Entrée `castTalisman`, `talismanCooldownMs` | Talismans (événements `talismanCast` / `talismanNotReady`) et recharge réduite par l'amélioration Kekkai. |

`balance.ts` regroupe toutes les constantes réglables.

### `shikigami/` — collection et équipe

| Élément | Rôle |
|---|---|
| `captureChance(seed, version)` | Chance de capture selon la rareté (2 %, 1 %, 0,4 %, 0,1 %). Le tirage a lieu dans `step` à chaque yōkai vaincu (événement `shikigamiCaptured`). |
| `addCapture(collection, seed, version)` | Nouveau shikigami au niveau 1, ou +1 niveau pour une graine déjà possédée. |
| `setTeam(state, seeds)` | Équipe active (3 au plus, distincts, possédés) ; résultat typé. |
| `levelUpCost(level, count)`, `levelUpShikigami(state, seed, count)` | Montée d'un ou plusieurs niveaux contre des âmes ; résultat typé. |
| `teamMembers(state)`, `teamBonus(members)`, `shikigamiHitRatio`, `shikigamiIntervalMs`, `shikigamiStats` | Bonus d'équipe et puissance d'un shikigami (voir `docs/GAME_DESIGN.md` § 4.4). |

### `economy/` — Sanctuaire

| Élément | Rôle |
|---|---|
| `upgradeCost(upgrade, level, count)` | Coût de `count` niveaux en forme close. |
| `maxAffordable(upgrade, level, souls)` | Niveaux achetables au plus (logarithme, puis vérification exacte), plafonnés au niveau maximal. |
| `buyUpgrade(state, upgrade, mode)` | Achat ×1, ×10 ou Max ; résultat typé (`not-enough-souls`, `max-level`). Le solde n'est jamais négatif. |
| `buyUpgradeLevels(state, upgrade, count)` | Achat d'un nombre exact de niveaux (utilisé par `buyUpgrade` et le harnais d'équilibrage). |

### `offline/` — progression hors ligne

| Élément | Rôle |
|---|---|
| `simulateOffline(state, elapsedMs)` | Ce que l'équipe a accompli en l'absence du joueur : `{ state, report }`. Analytique, plafonné, s'arrête devant le Gardien suivant ; `elapsedMs ≤ 0` ne donne rien. |
| `offlineCapMs(state)` | Plafond : 8 h + 1 h par niveau de Lanternes, 24 h au plus. |
| `expectedDps(power)` | Dégâts espérés par seconde (critiques moyennés). |

### `prestige/` — Festival

| Élément | Rôle |
|---|---|
| `festivalPreview(state)` | Débloqué ou non, étincelles à gagner, bonus avant et après (pour l'écran Festival). |
| `startFestival(state)` | Relance le défilé : remise à zéro des vagues, âmes, Sanctuaire ; conservation des shikigami, de l'équipe, des ofuda et de la galerie ; résultat typé (`locked`). |
| `festivalSparks(record)`, `festivalBonus(sparks)` | Formules de `docs/GAME_DESIGN.md` § 4.5. |
