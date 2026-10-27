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

## 3. Workflow

1. **Une issue = une branche = une PR.** Branche nommée `<type>/<numéro>-<slug>`, par exemple `feat/9-boucle-de-combat`.
2. Lis l'issue, son epic et les docs qu'elle référence avant d'écrire du code.
3. Écris les tests **en même temps** que le code (ou avant). Une PR sans tests sur la logique ajoutée est incomplète.
4. Commits au format Conventional Commits, description en français : `feat(engine): ajoute le calcul des gains hors ligne`. Types : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`.
5. Ouvre la PR avec le modèle (`.github/pull_request_template.md`), lie l'issue (`Closes #9`).
6. Ne pousse jamais directement sur `main`.

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

## 7. Documentation

- Tout dossier de premier niveau et tout module structurant (`src/engine/`, `src/render/`, `src/ui/`, `design/`, `scripts/`) a un `README.md` qui dit ce qu'il contient et ses règles.
- Une décision qui engage le projet (bibliothèque, format de sauvegarde, règle de jeu) s'ajoute à [`docs/DECISIONS.md`](docs/DECISIONS.md).
- [`docs/ROADMAP.md`](docs/ROADMAP.md) reflète les milestones et epics GitHub ; mets-le à jour quand une epic change.

## 8. Issues

- Les issues sont rattachées à une **milestone** et à une **epic** (issue labellisée `epic`, référencée en tête de l'issue).
- Une issue décrit : le contexte, ce qu'il faut faire, les critères d'acceptation, les docs de référence.
- Si une issue est trop grosse pour une PR raisonnable (~400 lignes hors tests), découpe-la avant de commencer et mets à jour l'epic.
