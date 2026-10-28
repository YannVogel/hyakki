# Journal des décisions

Chaque entrée : date, décision, raison, conséquence. Les plus récentes en haut.

## 2026-10-28 — Brûlures plafonnées par les frappes, sans plancher

- **Décision** (Yann) : une brûlure n'inflige jamais plus de 9 fois les dégâts par seconde espérés des frappes (`BALANCE.burn.maxHitsMultiple`). Elle n'a plus de plancher et peut donc achever l'ennemi. Elle remplace la règle du 2026-10-27, où une brûlure s'arrêtait quand il restait 10 % des PV.
- **Raison** : sur un gros sac à PV, la brûlure vidait 90 % de la barre en quelques secondes, puis la barre se bloquait aux 9/10ᵉ et seules les frappes entamaient le dernier dixième. La barre ne disait donc rien du temps restant. Plafonnée par les frappes, la brûlure fait descendre la barre à vitesse constante et la progression reste liée à la puissance du joueur. Le multiple 9 garde le même temps pour tuer aux deux extrêmes : brûlure nulle, et brûlure très forte face aux PV, où l'ancien plancher laissait aussi 10 % aux frappes. Entre les deux, on tue jusqu'à 1,9 fois plus vite.
- **Conséquence** : toutes les cibles du harnais restent tenues (`GAME_DESIGN.md` § 5.2). La simulation hors ligne applique le même plafond. Une mise à mort par brûlure peut faire apparaître un Gardien au milieu d'un pas : les minuteurs d'attaque s'arrêtent à cet instant. Si le yōkai de la vague 99 meurt de sa brûlure, `attackTimers` peut garder une fraction de milliseconde, ce que la sauvegarde accepte.

## 2026-10-28 — Bruitages Kenney (CC0), musique Suno

- **Décision** (Yann) : les 15 bruitages viennent des packs audio de Kenney (CC0), choisis à l'oreille (liste dans `assets/README.md`). La musique d'ambiance est « Hyakki - Le défilé en fête » (version A), générée sur Suno avec l'offre Pro de Yann.
- **Raison** : le CC0 n'impose ni crédit ni restriction, ce qui convient à un jeu gratuit distribué sur les stores ; l'offre Pro de Suno donne les droits commerciaux sur les morceaux générés pendant l'abonnement.
- **Conséquence** : bruitages en WAV mono, car iOS ne lit pas l'Ogg. Le morceau n'est pas encore dans le dépôt : le quota de téléchargements Suno est épuisé jusqu'au 7 novembre 2026. Rien n'est branché dans le jeu ; le périmètre (V1 ou après) reste une question ouverte.

## 2026-10-28 — Icône « Oni caché »

- **Décision** (Yann) : l'icône de l'app montre un petit oni rouge caché derrière le kanji 百, sur le ciel du festival. Elle remplace la lanterne générée (graine 116 300). Choisie parmi plusieurs séries de maquettes Claude Design (variante 3 des « Yōkai cachés »).
- **Raison** : le 百 dit le nom du jeu (Hyakki, les cent démons) et reste lisible à 48 px ; l'oni qui dépasse donne le ton cartoon.
- **Conséquence** : l'icône ne dépend plus du générateur. Le kanji est un glyphe de la police d'affichage, dessiné par le script de rendu. Les builds 1.0.0 déjà envoyés portent l'ancienne icône : il faut un nouveau build par store, et remplacer l'icône 512 × 512 de la fiche Google Play.

## 2026-10-28 — Build Android limité aux architectures ARM

- **Décision** : l'app Android n'embarque que `armeabi-v7a` et `arm64-v8a` (`expo-build-properties`, `android.buildArchs`).
- **Raison** : avec les quatre ABI par défaut, le premier build EAS de production a manqué de mémoire (« Gradle build daemon disappeared unexpectedly » sur la machine gratuite de 15,6 Go). `x86` et `x86_64` ne servent qu'aux émulateurs Intel ; les téléphones sont en ARM.
- **Conséquence** : compilation native et fichier AAB deux fois plus légers. Un émulateur x86 ne peut plus installer le build ; l'émulateur de développement (Apple Silicon) est en ARM.

## 2026-10-28 — Public 13 ans et plus, illustrations IA signalées

- **Décision** (Yann) : sur Google Play, le public cible est 13 ans et plus (13-15, 16-17, 18+). La fiche signale comme générés par IA les visuels qui montrent le héros ou un Gardien.
- **Raison** : cohérent avec le 13+ de l'App Store ; éviter le programme « Familles » de Google et sa revue supplémentaire. Les illustrations viennent de ChatGPT : le dire est conforme aux règles du store et à l'honnêteté du projet.
- **Conséquence** : refaire la déclaration IA à chaque nouvelle capture ou image ; viser les moins de 13 ans plus tard demanderait d'entrer dans le programme Familles.

## 2026-10-28 — Le kiseru reste, déclaré comme référence au tabac

- **Décision** (Yann) : l'accessoire « kiseru » du générateur V2 reste dans le jeu. Les deux questionnaires de classification le déclarent comme référence au tabac peu fréquente.
- **Raison** : le retirer demanderait un générateur V3 pour un gain limité ; le déclarer honnêtement évite un refus ou une reclassification en examen.
- **Conséquence** : App Store 13+, PEGI 7 (ESRB 10+). Les réponses complètes sont dans `docs/store/fiche.md` ; tout nouvel élément sensible (accessoire, Gardien) impose de refaire les questionnaires.

## 2026-10-28 — Builds de production avec EAS, version confirmée à chaque build

- **Décision** : les builds de production (AAB Android, IPA iOS) et leur envoi aux stores passent par l'offre gratuite d'EAS (`eas.json`, profil `production`). Les numéros de build sont gérés par EAS (`appVersionSource: remote`, `autoIncrement`) ; la version affichée reste celle d'`app.config.ts` (1.0.0) et se confirme avant chaque build. `ITSAppUsesNonExemptEncryption` vaut `false` : l'app ne fait aucun appel réseau.
- **Raison** : EAS génère et conserve les clés de signature (clé d'importation Google, certificat et profil Apple) sans configuration native supplémentaire, ce qui compte avec des dossiers `ios/` et `android/` générés. Un build local signé demanderait un plugin de configuration et une gestion manuelle des clés.
- **Conséquence** : il faut un compte Expo (`eas init` ajoute un `projectId`). Procédure dans `docs/store/publication.md` ; #47 et #48 attendent Yann (comptes, testeurs, soumission).

## 2026-10-27 — Site public sur GitHub Pages, permissions Android au plus juste

- **Décision** : la politique de confidentialité (exigée par les deux stores) et une page de présentation vivent dans `site/`, publiées sur GitHub Pages par un workflow (`.github/workflows/pages.yml`) : <https://yannvogel.github.io/hyakki/confidentialite/>. Le site n'utilise que des polices système et aucun script. Les permissions Android ajoutées par le modèle Expo et inutiles (stockage externe, affichage par-dessus les autres apps) sont bloquées dans `app.config.ts`.
- **Raison** : hébergement gratuit, versionné avec le code, sans dépendance ni service tiers ; publier les docs du projet (`docs/`) en même temps n'aurait servi à rien. Moins de permissions = déclarations « aucune donnée » sans ambiguïté en revue.
- **Conséquence** : modifier `site/` sur `main` republie le site. Les déclarations dans les consoles (Apple, Google) restent à saisir par Yann (`docs/store/confidentialite.md`).

## 2026-10-27 — Générateur V2 et Lame d'ofuda moins chère au départ

- **Décision** : le générateur passe en version 2 pour les nouveaux défilés : 6 objets (bouilloire, éventail, masque, sandale, cloche, mortier) et 4 accessoires (feuille de tanuki, chapelet, queue de renard, kiseru) ajoutés à la suite des listes V1. Les objets V2 ont les mêmes moyennes que la V1 (PV, attaque × vitesse). Le premier niveau de la Lame d'ofuda coûte 5 âmes au lieu de 10.
- **Raison** : plus de variété sans toucher un seul yōkai déjà rencontré (défilé en cours et shikigami gardent leur version). En vérifiant le harnais sur 12 défilés au lieu d'un, le premier Gardien du joueur régulier ne tombait au jour 1 que grâce à une graine chanceuse (1 défilé sur 8 en V1, 4 sur 12 en V2) ; la Lame à 5 âmes le fait tomber au jour 1 dans 10 défilés sur 12, sans déplacer les autres cibles (`GAME_DESIGN.md` § 5.2).
- **Conséquence** : à valider en jeu par Yann avec le reste de l'équilibrage (#53). Le harnais reste sur une graine fixe ; une cible « au jour près » est indicative.

## 2026-10-27 — Équilibrage : niveaux qui se multiplient, brûlures plafonnées

- **Décision** : la Lame d'ofuda multiplie les dégâts par 1,0925 à chaque niveau (au lieu de +8 % linéaires) ; PV et âmes croissent de ×1,13 par vague (au lieu de 1,165 et 1,14) ; les coûts du Sanctuaire de ×1,12 par niveau (au lieu de 1,15). Les niveaux de shikigami restent linéaires (+10 %). Une brûlure s'arrête quand il reste 10 % des PV de l'ennemi. Le bonus du Festival reste à +5 % par étincelle.
- **Raison** : mesuré par le harnais (`scripts/simulate.ts`) : avec les formules de départ, tous les profils butaient vers la vague 40 ; deux croissances composées (Lame et niveaux de shikigami) faisaient au contraire s'emballer la progression ; une brûlure en % des PV donnait une vitesse de progression indépendante de la puissance (vague 512 000 en 2 jours). Les valeurs retenues tiennent les cibles de `GAME_DESIGN.md` § 5.2.
- **Conséquence** : toutes les constantes vivent dans `src/engine/balance.ts` ; toute modification se mesure en relançant le harnais. Validation en jeu par Yann : issue `besoin-yann` « Valider l'équilibrage ».

## 2026-10-27 — Hors ligne : calcul analytique et extrapolation au-delà de 2 000 yōkai

- **Décision** : `simulateOffline` calcule yōkai par yōkai avec les dégâts espérés ; au-delà de 2 000 yōkai simulés, le farm est extrapolé depuis l'échantillon et les captures ne sont tirées que sur l'échantillon. Un yōkai ne tombe jamais plus vite qu'une frappe de l'attaquant le plus rapide.
- **Raison** : rejouer 24 h de combat (jusqu'à ~86 000 yōkai) prendrait plusieurs secondes sous Hermes au démarrage de l'app.
- **Conséquence** : calcul borné et rapide ; un retour après une très longue absence donne un peu moins de captures qu'en jeu actif (acceptable : l'efficacité hors ligne est déjà de 50 %).

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
