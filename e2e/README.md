# `e2e` — parcours Maestro

Parcours de bout en bout joués sur un simulateur iOS ou un émulateur Android par [Maestro](https://maestro.mobile.dev).

| Parcours | Vérifie |
|---|---|
| `app-starts.yaml` | L'app démarre et affiche son premier écran |

## Lancer

1. Installer Maestro : `curl -fsSL "https://get.maestro.mobile.dev" | bash` (ajoute `~/.maestro/bin` au `PATH`).
2. Lancer un development build sur un simulateur (`npm run ios` ou `npm run android`), Metro démarré.
3. `npm run test:e2e`.

## Règles

- Les éléments sont ciblés par `testID` (`id:` dans Maestro), pas par leur texte : les textes changent, les identifiants restent.
- Un parcours = un fichier, nommé d'après ce qu'il vérifie.
- Les parcours ne tournent pas en CI (ils demandent un simulateur) : on les lance en local avant de merger une milestone qui touche l'écran concerné.
