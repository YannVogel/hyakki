# Roadmap

Miroir des [milestones](https://github.com/YannVogel/hyakki/milestones) et des epics GitHub. Chaque epic regroupe ses issues en sous-issues.

| Milestone | Epics | Résultat attendu | État |
|---|---|---|---|
| **0 · Fondations** | #1 Fondations du projet | App Expo saine, lint avec règles de dépendances, tests, CI, development builds | Terminée (PR #52) |
| **1 · Moteur de jeu** | #2 Moteur de jeu (TypeScript pur) | Partie complète simulable en Node, équilibrage mesuré | Terminée (PR #54) ; #53 attend la validation de Yann |
| **2 · Fabrique à yōkai** | #3 Fabrique à yōkai | Yōkai générés, dessinés et animés en Skia, capture des shikigami | Terminée (PR #24-#27 : milestones 1 et 2) ; #55 attend une mesure sur appareil |
| **3 · Boucle jouable** | #4 Design system et composants, #5 Écrans et boucle de jeu | Une partie se joue de la première vague au premier Festival | À faire |
| **4 · Feel & finitions** | #6 Art : héros et Gardiens, #7 Feel : effets, animations, haptique (+ #28 générateur V2) | Combat fluide et expressif, illustrations définitives | À faire |
| **5 · Publication** | #8 Publication sur les stores | Disponible sur l'App Store et Google Play, étude de cas en ligne | À faire |

## Ordre conseillé

1. **#9 → #13** : fondations (#10, #11 et #13 peuvent avancer en parallèle après #9). Fait dans l'ordre #9, #11, #10, #12, #13.
2. **#14 → #23** : moteur. #14 et #15 d'abord, puis #16, #17, et le reste. **#23 (simulation) avant de construire les écrans** : les formules de départ sont des hypothèses. Fait dans l'ordre #14, #15, #24, #25, #16, #17, #27, #18, #19, #20, #21, #22, #23 (le générateur et la capture bloquaient le combat et le hors ligne).
3. **#24 → #27** : générateur, en parallèle de la fin du moteur dès que #14 est fait. #24, #25 et #27 ont été livrées avec la milestone 1, #26 avec la milestone 2.
4. **#29, #30** puis **#31 → #37** : design system, puis écrans.
5. **#38 → #44** et **#28** : finitions. #38 (Nurarihyon) peut être traité à tout moment.
6. **#45 → #49** : publication. Prévoir les 14 jours du test fermé Google Play (#47) dans le planning.

## Hors V1

Sons et musique, anglais, nouvelles planches de Gardiens, arbre de talents du Festival, événements saisonniers (voir [`GAME_DESIGN.md`](GAME_DESIGN.md) § 7).
