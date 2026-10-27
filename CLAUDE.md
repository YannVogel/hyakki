# CLAUDE.md — Hyakki

Ce fichier est lu automatiquement par Claude Code. Les règles complètes de travail sont dans [`AGENTS.md`](AGENTS.md) : lis-le avant toute tâche, il fait autorité.

## Le projet en une phrase

Idle RPG mobile (Expo / React Native) de fantasy japonaise, style cartoon/animé, 100 % gratuit et hors ligne, où les yōkai ordinaires sont générés procéduralement à partir d'une graine. Détails : [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md).

## Règles non négociables

1. **Langue** : toute la prose (docs, commentaires, issues, PR, messages de commit, textes de l'UI) est en **français**. Le code, les identifiants, les logs et les messages techniques restent en anglais.
2. **Tests** : une fonctionnalité sans tests n'est pas terminée. Le moteur (`src/engine/`) vise une couverture quasi totale, avec des tests de propriétés (fast-check) pour le hasard à graine et l'économie.
3. **Pureté du moteur** : `src/engine/` est du TypeScript pur. Il n'importe jamais React, React Native, Expo, Skia ni rien hors de `src/engine/`. Voir les règles de dépendances dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
4. **Déterminisme** : même graine = même yōkai, sur toutes les plateformes et toutes les versions. Toute modification du générateur qui change le résultat d'une graine existante est une rupture : elle exige un numéro de version de générateur et une migration de sauvegarde.
5. **Zéro réseau, zéro collecte** : pas de pub, pas d'achat intégré, pas d'analytics, pas de compte, pas d'appel réseau. Si une tâche semble en demander, arrête-toi et demande.
6. **Design system** : couleurs, typographies, rayons et ombres viennent uniquement des tokens (`src/ui/tokens`, généré depuis [`design/tokens.json`](design/tokens.json)). Jamais de couleur en dur dans un écran.
7. **Noms** : le jeu s'appelle **Hyakki**. Ne renomme pas le projet, les écrans, les monnaies ni les assets sans décision explicite consignée dans [`docs/DECISIONS.md`](docs/DECISIONS.md).
8. **Docs à jour** : si tu touches une partie structurante (dossier de premier niveau, moteur, générateur, design system), mets à jour le `.md` correspondant dans la même PR.

## Commandes

Elles seront créées par l'issue d'initialisation du projet (milestone 0). Une fois en place :

```bash
npm run lint        # ESLint + règles de dépendances
npm run typecheck   # tsc --noEmit
npm test            # Jest (moteur + composants)
npm run test:e2e    # Maestro (parcours principaux)
```

## Où trouver quoi

- Règles de travail, workflow milestone → branche → PR (un commit par issue) : [`AGENTS.md`](AGENTS.md)
- Journal de reprise du travail autonome : [`docs/PROGRESS.md`](docs/PROGRESS.md)
- Architecture et structure des dossiers : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Générateur de yōkai : [`docs/PROCEDURAL_YOKAI.md`](docs/PROCEDURAL_YOKAI.md) et le prototype [`design/prototypes/fabrique-a-yokai.html`](design/prototypes/fabrique-a-yokai.html)
- Direction artistique et tokens : [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- Illustrations (héros, Gardiens) : [`docs/ART_PIPELINE.md`](docs/ART_PIPELINE.md), fichiers dans `assets/images/`
