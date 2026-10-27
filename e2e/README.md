# `e2e` — parcours Maestro

Parcours de bout en bout joués sur un simulateur iOS ou un émulateur Android par [Maestro](https://maestro.mobile.dev).

| Parcours | Vérifie |
|---|---|
| `app-starts.yaml` | L'app démarre sur l'écran Combat |
| `combat.yaml` | Le combat avance, une frappe touche, un talisman se lance et se recharge |
| `guardian.yaml` | Le cut-in du Gardien s'affiche ; « Affronter ! » lance le combat et son chrono |
| `offline-return.yaml` | Retour hors ligne avec horloge simulée (2 h) : la modale de récolte s'affiche puis se ferme, et l'app demande alors la permission de notifier (refusée) |
| `settings.yaml` | « Réduire les animations » s'active depuis le Sanctuaire et reste actif après un redémarrage |
| `sanctuary.yaml` | Après quelques frappes, une amélioration s'achète et son niveau monte aussitôt |
| `native-check.yaml` | Skia et MMKV tournent dans le development build ; le compteur survit à un redémarrage |
| `yokai-lab.yaml` | La Fabrique à yōkai (écran de développement) dessine les yōkai en Skia ; une tuile se sélectionne |

## Lancer

1. Installer Maestro : `curl -fsSL "https://get.maestro.mobile.dev" | bash` (ajoute `~/.maestro/bin` au `PATH`).
2. Lancer un development build sur un simulateur (`npm run ios` ou `npm run android`), Metro démarré.
3. `npm run test:e2e`.

## Règles

- Les éléments sont ciblés par `testID` (`id:` dans Maestro), pas par leur texte : les textes changent, les identifiants restent.
- Un parcours = un fichier, nommé d'après ce qu'il vérifie.
- Les écrans de développement s'ouvrent par un appui long sur l'en-tête du défilé (`longPressOn: id: dev-hub`), en development build uniquement.
- La scène de combat bouge en permanence (yōkai, héros, effets) : les frappes sur `battle-scene` passent `waitToSettleTimeoutMs`, sinon Maestro attend une stabilité qui ne vient jamais.
- Une invite système (notifications) persiste d'un parcours à l'autre : le parcours qui la déclenche y répond lui-même.
- Les parcours ne tournent pas en CI (ils demandent un simulateur) : on les lance en local avant de merger une milestone qui touche l'écran concerné.
