# Roadmap

Miroir des [milestones](https://github.com/YannVogel/hyakki/milestones) et des epics GitHub. Chaque epic regroupe ses issues en sous-issues.

| Milestone | Epics | Résultat attendu | État |
|---|---|---|---|
| **0 · Fondations** | #1 Fondations du projet | App Expo saine, lint avec règles de dépendances, tests, CI, development builds | Terminée (PR #52) |
| **1 · Moteur de jeu** | #2 Moteur de jeu (TypeScript pur) | Partie complète simulable en Node, équilibrage mesuré | Terminée (PR #54) ; #53 attend la validation de Yann |
| **2 · Fabrique à yōkai** | #3 Fabrique à yōkai | Yōkai générés, dessinés et animés en Skia, capture des shikigami | Terminée (PR #24-#27 : milestones 1 et 2) ; #55 attend une mesure sur appareil |
| **3 · Boucle jouable** | #4 Design system et composants, #5 Écrans et boucle de jeu | Une partie se joue de la première vague au premier Festival | Terminée (PR #57) |
| **4 · Feel & finitions** | #6 Art : héros et Gardiens, #7 Feel : effets, animations, haptique (+ #28 générateur V2) | Combat fluide et expressif, illustrations définitives | Terminée (PR #60, illustrations HD #58 en PR #92), 60 i/s à mesurer dans #55 |
| **5 · Publication** | #8 Publication sur les stores | Disponible sur l'App Store et Google Play, étude de cas en ligne | En cours (PR #64, #66) : politique de confidentialité en ligne, app créée et fiches complètes dans les deux consoles (classifications 13+ / PEGI 7), procédure de build, étude de cas. Attendent Yann : #47 et #48 (builds, test fermé de 14 jours, soumission), #63 (vidéo, GIF, liens stores) |
| **6 · Retours de jeu** | #72 Retours de jeu après la 1.0 | Interface de combat corrigée, confort de l'écran Shikigami, décors illustrés, cycles de difficulté après le 10e Gardien | Terminée (PR #81 à #87) |
| **7 · Progression permanente et confort** | #96 Améliorations d'ofuda, réactions aux coups, onglet réglages et règles | Le Kamidana (améliorations permanentes payées en ofuda), des ennemis qui réagissent aux coups, un onglet pour les réglages et les règles du jeu | Terminée (PR #108 à #118, une par issue) ; 60 i/s des réactions à mesurer dans #55, cibles du Kamidana à ressentir dans #53 |

## Ordre conseillé

1. **#9 → #13** : fondations (#10, #11 et #13 peuvent avancer en parallèle après #9). Fait dans l'ordre #9, #11, #10, #12, #13.
2. **#14 → #23** : moteur. #14 et #15 d'abord, puis #16, #17, et le reste. **#23 (simulation) avant de construire les écrans** : les formules de départ sont des hypothèses. Fait dans l'ordre #14, #15, #24, #25, #16, #17, #27, #18, #19, #20, #21, #22, #23 (le générateur et la capture bloquaient le combat et le hors ligne).
3. **#24 → #27** : générateur, en parallèle de la fin du moteur dès que #14 est fait. #24, #25 et #27 ont été livrées avec la milestone 1, #26 avec la milestone 2.
4. **#29, #30** puis **#31 → #37** : design system, puis écrans.
5. **#38 → #44** et **#28** : finitions. #38 (Nurarihyon) peut être traité à tout moment.
6. **#45 → #49** : publication. Prévoir les 14 jours du test fermé Google Play (#47) dans le planning.

## Hors V1

Sons et musique, anglais, nouvelles planches de Gardiens, événements saisonniers (voir [`GAME_DESIGN.md`](GAME_DESIGN.md) § 7).
