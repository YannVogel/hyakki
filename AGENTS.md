# AGENTS.md — règles de travail

Ce document s'adresse à tout agent de code (Claude Code, Codex…) qui travaille sur Hyakki. Il complète [`CLAUDE.md`](CLAUDE.md) et fait autorité en cas de doute.

## 1. Principes

- **DRY, KISS, YAGNI, SOLID** : la solution la plus simple qui répond à l'issue. Pas d'abstraction « pour plus tard ».
- **Dépendances unidirectionnelles** : `app → features → (ui, render, state, services) → engine`. Jamais l'inverse. Le détail et l'outil qui le vérifie sont dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- **Pas de code spaghetti** : un module = une responsabilité. Si un fichier dépasse ~300 lignes, découpe-le.
- **Pas de surprise** : ne modifie que ce que l'issue demande. Un problème repéré hors périmètre devient une nouvelle issue, pas un changement silencieux.

## 2. Langue

- Prose en **français** : docs, commentaires, issues, descriptions de PR, messages de commit, textes affichés au joueur.
- Code, noms de fichiers, identifiants, logs, messages d'erreur techniques : **anglais**.

## 3. Workflow (mode autonome)

Le projet avance **milestone par milestone**, de « 0 · Fondations » à « 5 · Publication ». L'agent travaille seul : il décide, documente et continue sans attendre de validation.

### 3.1 Une milestone = une branche = une PR

1. Crée une branche `milestone/<n>-<slug>` depuis `main` à jour (ex. `milestone/0-fondations`).
2. Traite les issues de la milestone dans l'ordre de [`docs/ROADMAP.md`](docs/ROADMAP.md), en respectant les « Dépend de » de chaque issue. Une issue d'une autre milestone n'est commencée qu'à la fin de la milestone en cours, sauf si elle bloque.

### 3.2 Une issue = un commit

1. Lis l'issue, son epic et les docs qu'elle référence avant d'écrire du code.
2. Écris les tests **en même temps** que le code (ou avant). Une logique sans tests est incomplète.
3. `npm run lint`, `npm run typecheck` et `npm test` passent avant le commit.
4. Mets à jour les docs concernées et [`docs/PROGRESS.md`](docs/PROGRESS.md).
5. **Un seul commit par issue** (squash local des commits intermédiaires), au format Conventional Commits en français, avec `Closes #N` dans le corps : `feat(engine): ajoute le calcul des gains hors ligne`. Types : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`.
6. Coche dans l'issue les cases réellement réalisées et vérifiées, puis commente en 3 à 6 lignes : ce qui est fait, les choix, les limites.

### 3.3 Fin de milestone

1. Pousse la branche et ouvre une PR « Milestone <n> · <titre> » (modèle `.github/pull_request_template.md`) qui liste les issues fermées, celles restées ouvertes et pourquoi.
2. Attends que la CI soit verte.
3. Relis le diff complet comme un reviewer exigeant (pureté du moteur, règles de dépendances, tests réels, pas de valeurs en dur) et corrige.
4. Merge avec un **merge commit** (jamais squash : on garde un commit par issue), puis supprime la branche.
5. Ferme la milestone si toutes ses issues sont fermées ; [`docs/ROADMAP.md`](docs/ROADMAP.md) et [`docs/PROGRESS.md`](docs/PROGRESS.md) sont à jour.

### 3.4 Quand une action de Yann est nécessaire

Comptes stores ou EAS, paiement, testeurs humains, génération d'image dans ChatGPT, validation subjective finale :

- fais tout ce qui est faisable sans lui ;
- si une partie reste bloquée, crée une issue de suivi labellisée `besoin-yann`, rattachée à la même epic et milestone, qui décrit **exactement** quoi faire (étapes, liens, fichiers prêts) ; ferme l'issue d'origine avec la partie réalisée ;
- si rien n'est faisable, label `besoin-yann` et commentaire précis sur l'issue, qui reste ouverte ;
- une issue `besoin-yann` ne bloque jamais le merge d'une milestone.

Une décision non tranchée par les docs : choisis l'option la plus simple compatible, consigne-la dans [`docs/DECISIONS.md`](docs/DECISIONS.md), continue.

### 3.5 Interdits

- Pousser directement sur `main` (hors mise en place de ce workflow), `git push --force` sur `main`, `--no-verify`.
- Désactiver, affaiblir ou supprimer un test ou une règle de lint pour faire passer la CI.
- Cocher un critère d'acceptation non vérifié (simulateur, émulateur ou Maestro indisponible : case non cochée et issue `besoin-yann` de vérification).
- Inventer des valeurs de référence : celles du générateur s'obtiennent en exécutant le script du prototype dans Node.

### 3.6 Reprise

[`docs/PROGRESS.md`](docs/PROGRESS.md) est le journal de reprise : milestone en cours, dernière issue terminée, prochaine issue, points en suspens, issues `besoin-yann`. Après une interruption, reprends à partir de ce fichier, de `git log` et des issues ouvertes, sans refaire ce qui est fait.

## 4. Définition de « terminé »

Une issue est terminée quand **tout** ceci est vrai :

- [ ] Les critères d'acceptation de l'issue sont remplis.
- [ ] `npm run lint`, `npm run typecheck` et `npm test` passent, en local et en CI.
- [ ] La logique nouvelle est couverte par des tests (unitaires ; propriétés pour le hasard et l'économie ; composants pour l'UI).
- [ ] Les docs touchées sont à jour (règle des `.md` structurants, voir § 7).
- [ ] Pour un changement visible : captures d'écran ou courte vidéo dans la PR.
- [ ] Aucun texte affiché au joueur n'est écrit en dur hors du fichier de textes (`src/i18n/`).

## 5. Règles spécifiques au jeu

- **Moteur pur** : `src/engine/` ne dépend de rien d'autre que lui-même. Il est testable en Node sans simulateur.
- **Temps injecté** : le moteur ne lit jamais l'horloge lui-même (`Date.now()` interdit dans `src/engine/`). Le temps écoulé est passé en paramètre, ce qui rend la progression hors ligne testable.
- **Hasard à graine uniquement** : `Math.random()` interdit dans `src/engine/`. Tout tirage passe par le RNG à graine (`src/engine/rng`).
- **Grands nombres** : toute quantité qui croît exponentiellement (PV, dégâts, âmes, coûts) utilise le type `BigNum` du moteur, jamais `number` brut.
- **Déterminisme du générateur** : les graines de référence ont des tests d'instantané (snapshot de la spec, pas de l'image). Si un snapshot change, c'est une rupture : explique pourquoi dans la PR et incrémente `GENERATOR_VERSION`.
- **Tokens uniquement** : aucune couleur, police, taille ou ombre en dur dans `features/` ou `ui/`. Tout passe par `src/ui/tokens`.
- **Accessibilité** : cibles tactiles ≥ 44 pt, contrastes conformes, libellés d'accessibilité sur les boutons-icônes, respect du réglage « réduire les animations ».
- **Zéro réseau** : aucune dépendance qui appelle Internet (analytics, crash reporting distant, pub). En cas de doute, demande.

## 6. Tests

| Couche | Outil | Attendu |
|---|---|---|
| `src/engine/` | Jest + fast-check | Tests unitaires et de propriétés. Exemples : une graine produit toujours la même spec ; acheter ×10 coûte exactement la somme de 10 achats ×1 ; les gains hors ligne ne dépassent jamais le plafond. |
| `src/render/` | Jest | Tests de la spec de rendu (géométrie calculée), pas de captures pixel. |
| `src/ui/`, `src/features/` | Jest + Testing Library | Rendu, interactions, accessibilité de base. |
| Parcours | Maestro | Lancement, combat, achat au Sanctuaire, Festival, retour hors ligne. |

Conventions :

- Les tests sont à côté du code : `combat.ts` → `combat.test.ts`.
- Jest a deux projets (`jest.config.js`) : `node` pour `src/engine/` et `scripts/` (environnement Node pur), `app` pour le reste (preset `jest-expo`).
- `npm run test:coverage` applique un seuil de 90 % des lignes sur `src/engine/` ; la CI l'exécute.
- Les parcours Maestro sont dans [`e2e/`](e2e/README.md) et ciblent les éléments par `testID`.

## 7. Documentation

- Tout dossier de premier niveau et tout module structurant (`src/engine/`, `src/render/`, `src/ui/`, `design/`, `scripts/`) a un `README.md` qui dit ce qu'il contient et ses règles.
- Une décision qui engage le projet (bibliothèque, format de sauvegarde, règle de jeu) s'ajoute à [`docs/DECISIONS.md`](docs/DECISIONS.md).
- [`docs/ROADMAP.md`](docs/ROADMAP.md) reflète les milestones et epics GitHub ; mets-le à jour quand une epic change.

## 8. Issues

- Les issues sont rattachées à une **milestone** et à une **epic** (issue labellisée `epic`, référencée en tête de l'issue).
- Une issue décrit : le contexte, ce qu'il faut faire, les critères d'acceptation, les docs de référence.
- Si une issue est trop grosse pour une PR raisonnable (~400 lignes hors tests), découpe-la avant de commencer et mets à jour l'epic.
