# Journal de progression

Journal de reprise du travail autonome (voir [`AGENTS.md`](../AGENTS.md) § 3). Mis à jour à chaque commit.

## État

| | |
|---|---|
| Milestone en cours | 5 · Publication (`milestone/5-publication`) |
| Dernière issue terminée | #46 Fiches stores (saisie dans les consoles : `besoin-yann`) |
| Prochaine issue | #49 Étude de cas (#47 et #48 préparées, attendent Yann) |

## Milestones

| Milestone | État | PR |
|---|---|---|
| 0 · Fondations | Terminée | #52 |
| 1 · Moteur de jeu | Terminée (#53 attend Yann) | #54 |
| 2 · Fabrique à yōkai | Terminée (#55 attend une mesure sur appareil) | #56 |
| 3 · Boucle jouable | Terminée | #57 |
| 4 · Feel & finitions | Terminée (#58 et #59 attendent Yann) | #60 |
| 5 · Publication | En cours | — |

## Points en suspens

- Milestone 3 : ordre #29, #30, puis #31 → #37. Écrans de développement sous `app/dev/` (appui long sur l'en-tête du défilé). Hub de dev : raccourci « Gardien de la vague 100 » (captures, parcours `guardian.yaml`).
- Maestro sur Android : l'émulateur doit avoir 4 Go de RAM (`-memory 4096`), sinon les parcours calent ; chaque frappe reste lente (plusieurs dizaines de secondes) car l'écran animé ne se stabilise jamais. Sur iOS : 8/8 avec le build de la milestone 4.
- Captures des stores : `scripts/store-captures.sh [ios|android]` (Metro lancé), sorties non versionnées dans `store-captures/`.
- Consoles des stores : je n'ai pas le droit d'accepter des déclarations ni de me connecter à la place de Yann. Play Console : formulaire de création prêt, deux déclarations à cocher. App Store Connect : session expirée.
- CocoaPods exige une locale UTF-8 : `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios`.
- Équilibrage : le harnais mesure une graine ; vérifier une cible « au jour près » sur plusieurs défilés (`runProfile(profil, jours, graine)`).
- Metro pour Maestro : `npx expo start --port 8081 < /dev/null` (le mode CI ne recharge pas le code).
- Équilibrage : relancer `npx tsx scripts/simulate.ts` après toute modification de `src/engine/balance.ts`.

- Les branches de milestone ne sont jamais réécrites une fois poussées (pas de push forcé) : un correctif de revue devient un commit `fix` qui référence l'issue.

- Ordre de la milestone 0 : #9, #11, #10, #12, #13 (#10 et #11 sont parallèles après #9 ; les tests des règles de lint de #10 s'appuient sur Jest installé par #11).
- iOS : modules Expo précompilés désactivés (voir `docs/DECISIONS.md`).
- Écrans temporaires à retirer quand les vrais écrans existeront (milestone 3) : accueil (`src/features/home`) et vérification native (`src/features/dev`, route `app/dev/native-check.tsx`). Ils utilisent les tokens depuis #29.
- Vérification locale : simulateur iOS « iPhone 17 » et AVD `Pixel_3a_API_33_arm64-v8a` ; Maestro dans `~/.maestro/bin`.

## Issues `besoin-yann`

- #53 Valider l'équilibrage (cibles et ressenti en jeu, après la milestone 3).
- #55 Vérifier les performances sur un Android d'entrée de gamme (Fabrique, puis Combat et Shikigami).
- #58 Régénérer les 20 illustrations en HD dans ChatGPT (procédure et outils prêts).
- #59 Valider l'icône et l'écran de lancement.
- #62 Créer Hyakki dans les deux consoles (deux déclarations Play à cocher, reconnexion Apple), puis saisir les fiches.
- #61 Déclarer « aucune donnée collectée » dans les deux consoles (réponses prêtes dans `docs/store/confidentialite.md`).
- #47 Google Play : build EAS, test fermé de 14 jours, production (`docs/store/publication.md`).
- #48 App Store : build EAS, TestFlight, soumission (`docs/store/publication.md`).
