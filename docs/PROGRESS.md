# Journal de progression

Journal de reprise du travail autonome (voir [`AGENTS.md`](../AGENTS.md) § 3). Mis à jour à chaque commit.

## État

| | |
|---|---|
| Milestone en cours | 7 · Progression permanente et confort (#96), une PR par issue à la demande de Yann ; 5 · Publication attend Yann (#47, #48, #63) |
| Dernière issue terminée | #98 Effets de combat du Kamidana (Bénédiction, Œil du tengu, Paume d'Inari, Pacte) |
| Prochaine issue | #99 (effets Gardiens et talismans du Kamidana), puis #100 à #107. Publication, #47 : 1.0.0 (7) publiée en test interne et en examen dans le test fermé depuis le 29/10 (remplace la version 5), il faut 12 testeurs pendant 14 jours avant la production. #48 : 1.0.0 (6) envoyé vers TestFlight le 29/10, soumission à décider par Yann. Avant soumission : parcours Maestro et captures des stores à refaire (interface de la milestone 6) |

## Milestones

| Milestone | État | PR |
|---|---|---|
| 0 · Fondations | Terminée | #52 |
| 1 · Moteur de jeu | Terminée (#53 attend Yann) | #54 |
| 2 · Fabrique à yōkai | Terminée (#55 attend une mesure sur appareil) | #56 |
| 3 · Boucle jouable | Terminée | #57 |
| 4 · Feel & finitions | Terminée (#58 faite le 29/10, validation visuelle par Yann ; icône #59 refaite en milestone 5) | #60 |
| 5 · Publication | Fiches et déclarations faites dans les deux consoles ; attendent Yann : #47, #48 (builds, test fermé, soumission), #63 | #64, #66 |
| 6 · Retours de jeu | Terminée (#76 fourni par Yann) | #81 à #87 |
| 7 · Progression permanente et confort | En cours : #97, #98 faits | une PR par issue |

## Points en suspens

- Milestone 7 (29/10) : à la demande de Yann, **une branche, un commit et une PR par issue**, mergée (merge commit) dans `main` dès que la CI est verte, au lieu d'une PR par milestone.
- Milestone 3 : ordre #29, #30, puis #31 → #37. Écrans de développement sous `app/dev/` (appui long sur l'en-tête du défilé). Hub de dev : raccourci « Gardien de la vague 100 » (captures, parcours `guardian.yaml`).
- Maestro sur Android : l'émulateur doit avoir 4 Go de RAM (`-memory 4096`), sinon les parcours calent ; chaque frappe reste lente (plusieurs dizaines de secondes) car l'écran animé ne se stabilise jamais. Sur iOS : 8/8 avec le build de la milestone 4.
- Captures des stores : `scripts/store-captures.sh [ios|android]` (Metro lancé), sorties non versionnées dans `store-captures/`.
- Consoles des stores (28/10) : tout est saisi, avec l'accord de Yann pour les attestations et ses coordonnées. Fiches, captures, catégories, prix, confidentialité (publiée chez Apple, envoyée chez Google), classifications (App Store 13+, PEGI 7), public 13 ans et plus, mention IA. Il ne manque que les builds (#47, #48), et un numéro de classification local pour la Corée du Sud si on y distribue l'app.
- Icône « Oni caché » (#59, 28/10) : à rendre avec `npx tsx scripts/render-icons.ts`, puis `scripts/render-store-graphics.ts` pour l'icône Play. Les builds iOS 1.0.0 (5) et (6) et Android (6) et (7) la portent.
- Formats de captures exigés en octobre 2026 : App Store, iPhone 6,3 pouces (1206 × 2622) ; Google Play, 9:16 exact (1080 × 1920).
- CocoaPods exige une locale UTF-8 : `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios`.
- Équilibrage : le harnais mesure une graine ; vérifier une cible « au jour près » sur plusieurs défilés (`runProfile(profil, jours, graine)`).
- Brûlures (28/10) : plafonnées à 9 fois les frappes, sans plancher, pour que la barre de vie des gros sacs à PV descende à vitesse constante (`DECISIONS.md`). À ressentir en jeu par Yann avec le reste de l'équilibrage (#53).
- Metro pour Maestro : `npx expo start --port 8081 < /dev/null` (le mode CI ne recharge pas le code).
- Équilibrage : relancer `npx tsx scripts/simulate.ts` après toute modification de `src/engine/balance.ts`.
- Audio (29/10) : bruitages et musiques branchés (#89, #90), réglages de volume séparés. Musiques Suno de Yann ([défilé](https://suno.com/song/a485fdce-bdfd-457a-a1ff-32e84809ec94), « Le Gardien approche » : [version 1](https://suno.com/song/6ce5284f-9943-4d50-9d27-913817a2d325), [version 2](https://suno.com/song/b841c6aa-3127-4e29-b4c2-43df358c5995)) enregistrées avec OBS faute de quota, silences coupés. Module natif : le son est dans les builds iOS 1.0.0 (5) et (6) et Android (6) et (7).

- Illustrations HD (#58, 29/10) : 19 figures régénérées par Yann, toutes ≥ 900 px (`docs/art/hd-regeneration.md`). Les PNG des figures passent de 5,9 à 25,9 Mo (+20 Mo dans l'app) ; une palette 256 couleurs les diviserait par 7, avec un tramage visible en gros plan : à décider. Elles sont dans les builds iOS 1.0.0 (6) et Android (7).

- Vignette du prochain Gardien (#75, 28/10) : 44 pt à la demande de Yann, plus haute que l'ancien libellé « Gardien » ; la scène de combat descend d'environ 26 pt.

- Les branches de milestone ne sont jamais réécrites une fois poussées (pas de push forcé) : un correctif de revue devient un commit `fix` qui référence l'issue.

- Ordre de la milestone 0 : #9, #11, #10, #12, #13 (#10 et #11 sont parallèles après #9 ; les tests des règles de lint de #10 s'appuient sur Jest installé par #11).
- iOS : modules Expo précompilés désactivés (voir `docs/DECISIONS.md`).
- Écrans temporaires à retirer quand les vrais écrans existeront (milestone 3) : accueil (`src/features/home`) et vérification native (`src/features/dev`, route `app/dev/native-check.tsx`). Ils utilisent les tokens depuis #29.
- Vérification locale : simulateur iOS « iPhone 17 » et AVD `Pixel_3a_API_33_arm64-v8a` ; Maestro dans `~/.maestro/bin`.

## Issues `besoin-yann`

- #53 Valider l'équilibrage (cibles et ressenti en jeu, après la milestone 3).
- #55 Vérifier les performances sur un Android d'entrée de gamme (Fabrique, puis Combat et Shikigami).
- #58 Valider dans l'app les illustrations HD (combat, cut-in d'un Gardien, galerie), notamment la taille du héros K.-O.
- #47 Google Play : build EAS, test fermé de 14 jours, production (`docs/store/publication.md`).
- #48 App Store : build EAS, TestFlight, soumission (`docs/store/publication.md`).
- #63 Vidéo de 30 s, GIF du générateur et liens stores de l'étude de cas.
