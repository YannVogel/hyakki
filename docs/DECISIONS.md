# Journal des décisions

Chaque entrée : date, décision, raison, conséquence. Les plus récentes en haut.

## 2026-10-27 — Le moteur parle en identifiants, les textes français vivent dans `src/i18n`

- **Décision** : le générateur et les stats manipulent des identifiants anglais (`lantern`, `cyclops`, `horns`…). Le nom japonais d'un yōkai (`Mitsume-Taiko-obake`) est calculé par le moteur (`nameOf`) : c'est une donnée du jeu, identique dans toutes les langues. La description française accordée en genre, les noms des pièces et les libellés des traits sont dans `src/i18n/yokai.ts` (`describeYokai`, `traitLabel`, `traitEffectText`).
- **Raison** : le moteur reste pur et sans texte joueur ; l'accord en genre est une règle de la langue française, pas du jeu. Ajouter une langue ne touche pas au moteur.
- **Conséquence** : les tests de `src/i18n/yokai.test.ts` vérifient que les textes français sont identiques à ceux du prototype (aux espaces fines près).

## 2026-10-27 — Socle technique : Expo SDK 58, iPhone uniquement, polices chargées au démarrage

- **Décision** : Expo SDK 58 (React Native 0.88, React 19.3, TypeScript 6.0), routes expo-router dans `app/` à la racine, identifiant `com.parallaxworks.hyakki` sur iOS et Android. Sur iOS, `supportsTablet: false` : l'app tourne en mode iPhone sur iPad. Les polices sont chargées par `useFonts` derrière l'écran de lancement.
- **Raison** : SDK stable le plus récent ; `app/` à la racine conforme à [`ARCHITECTURE.md`](ARCHITECTURE.md) ; pas de captures iPad à produire pour l'App Store en V1 ; `useFonts` donne le même nom de famille sur les deux plateformes.
- **Conséquence** : la prise en charge de l'iPad (orientation, captures, mise en page) est hors V1.
- **Modules précompilés désactivés sur iOS** (`expo-build-properties`, `ios.usePrecompiledModules: false`) : avec les XCFrameworks précompilés du SDK 58.0.19, l'app plante au lancement (`ExpoFileSystem` ne trouve pas un symbole d'`ExpoModulesCore`). Les modules Expo sont donc compilés depuis les sources : premier build plus long, comportement identique. À réévaluer à la prochaine montée de SDK.

## 2026-10-27 — Nurarihyon coiffé d'un chapeau de cour

- **Décision** : Nurarihyon porte un haut chapeau de cour noir laqué qui cache entièrement son crâne allongé.
- **Raison** : les versions à crâne nu prêtaient à une lecture involontaire, gênante sur les stores et en partage.
- **Conséquence** : sa silhouette haute reste reconnaissable ; source dans `design/sources/nurarihyon-v3.png`.

## 2026-10-27 — Art hybride : illustrations pour le héros et les Gardiens, génération pour le reste

- **Décision** : le héros (10 poses) et les Gardiens (10 en V1) sont des illustrations ChatGPT détourées. Les yōkai ordinaires sont générés en code à partir d'une graine.
- **Raison** : variété quasi illimitée et cohérence parfaite pour les ennemis, sans pipeline d'images ; charme d'une vraie illustration là où le joueur s'attache (héros, boss).
- **Conséquence** : un Gardien toutes les 100 vagues ; 10 planches de 10 Gardiens couvriraient 10 000 vagues. La V1 n'en a qu'une.

## 2026-10-27 — Yōkai ordinaires = tsukumogami à graine, l'apparence fixe les stats

- **Décision** : les ennemis sont des objets animés (lanterne, ombrelle, théière…) assemblés par pièces ; chaque pièce visible donne un bonus de stat.
- **Raison** : cohérent avec le folklore (les tsukumogami), et le visuel porte du gameplay au lieu d'être un simple skin.
- **Conséquence** : l'ordre des tirages est un contrat (voir [`PROCEDURAL_YOKAI.md`](PROCEDURAL_YOKAI.md)).

## 2026-10-27 — Style cartoon/animé lumineux

- **Décision** : abandon de la première DA nocturne et sombre au profit d'un style cartoon/animé très coloré, en plein jour.
- **Conséquence** : le prestige s'appelle **Festival** (et non plus « Aube »), sa monnaie **Étincelles**.

## 2026-10-27 — 100 % gratuit, hors ligne, sans collecte

- **Décision** : ni publicité, ni achat intégré, ni compte, ni serveur, ni analytics.
- **Raison** : projet vitrine ; coût minimal ; étiquette « Aucune donnée collectée » sur les stores.
- **Conséquence** : toute logique tourne sur l'appareil ; sauvegarde locale uniquement.

## 2026-10-27 — Grands nombres via un adaptateur `BigNum`

- **Décision** : `break_infinity.js` derrière `src/engine/numbers`.
- **Raison** : les croissances exponentielles dépassent `1e308` vers la vague 4 000.
- **Conséquence** : interdiction d'utiliser `number` pour les grandeurs exponentielles. Seul `src/engine/numbers/bigNum.ts` importe la bibliothèque (règle de lint) ; le reste du moteur manipule un type opaque `BigNum`.
- **Spike de performance (2026-10-27)** : 1 million de multiplications `BigNum × number` en **35 ms** (médiane de 5 passes, Node 24.16, Mac Apple Silicon), largement sous la cible de 200 ms. Script : `npx tsx scripts/bench-bignum.ts`.

## Questions ouvertes

- Anglais dès la V1 ou plus tard ? (Par défaut : français seul en V1, textes centralisés pour faciliter l'ajout.)
- Sons et musique : périmètre V1 ou après ?
