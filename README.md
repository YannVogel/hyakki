# Hyakki

> 百鬼夜行 — le défilé des cent démons.

**Hyakki** est un idle RPG mobile (iOS + Android) dans un univers de fantasy japonaise, au style cartoon/animé très coloré. Un jeune onmyōji affronte le Hyakki Yagyō, un défilé sans fin de yōkai : il les purifie vague après vague, et chaque yōkai purifié peut rejoindre son équipe comme shikigami.

Le jeu est **100 % gratuit** : ni publicité, ni achat intégré, ni compte, ni serveur, ni collecte de données. C'est un projet vitrine (CV et portfolio) du studio **Parallax Works**.

## Ce qui rend le projet intéressant

- **Génération procédurale à graine** : les yōkai ordinaires sont des *tsukumogami* (objets qui prennent vie après cent ans) assemblés en code à partir de pièces vectorielles. Une graine donne toujours la même créature, et son apparence fixe ses stats. Près de 286 000 combinaisons dès la V1.
- **Moteur de jeu en TypeScript pur** : boucle à ticks delta, grands nombres, progression hors ligne, prestige. Isolé de React, entièrement testé.
- **Rendu Skia** : créatures, effets d'impact et animations dessinés en temps réel, sans planche de sprites.
- **Art hybride** : le héros et les dix Gardiens (boss) sont illustrés ; tout le reste est généré.

## Boucle de jeu en bref

| Élément | Rôle |
|---|---|
| Vague | Un yōkai généré à purifier. Le héros et ses shikigami attaquent seuls, le joueur peut frapper en touchant l'écran. |
| Gardien | Un boss illustré toutes les 100 vagues, à vaincre en 30 secondes. |
| Âmes | Monnaie principale, dépensée au Sanctuaire pour renforcer l'onmyōji. |
| Shikigami | Yōkai capturés : collection, équipe active de trois, bonus tirés de leur apparence. |
| Festival | Le prestige : on relance le défilé plus fort en échange d'Étincelles (bonus permanent). |
| Hors ligne | Les shikigami continuent le combat pendant l'absence du joueur, dans la limite d'un plafond. |

## Documentation

| Document | Contenu |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Instructions pour Claude Code |
| [`AGENTS.md`](AGENTS.md) | Règles de travail des agents de code (workflow, conventions, définition de « terminé ») |
| [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) | Concept, boucle, progression, économie, formules de départ |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, structure des dossiers, règles de dépendances, sauvegarde |
| [`docs/PROCEDURAL_YOKAI.md`](docs/PROCEDURAL_YOKAI.md) | Spécification du générateur de yōkai |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Direction artistique, tokens, composants, accessibilité |
| [`docs/ART_PIPELINE.md`](docs/ART_PIPELINE.md) | Production des illustrations (prompts, découpe, nommage) |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Journal des décisions |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Milestones et epics |
| [`design/`](design/README.md) | Maquettes, tokens, planches sources, prototype du générateur |

## État

Pré-production : la direction artistique, les maquettes, le prototype du générateur et les illustrations du héros et des Gardiens sont prêts. Le code de l'application démarre avec la milestone **0 · Fondations** (voir les issues).
