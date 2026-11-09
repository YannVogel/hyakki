# Builds de production et soumission

Procédure pour publier Hyakki sur Google Play (#47) et l'App Store (#48). Les builds de production passent par **EAS Build** (offre gratuite) : il génère et conserve les clés de signature (clé d'importation Android, certificat et profil de distribution iOS), ce qu'un build local ne ferait pas sans configuration native supplémentaire.

## Version

- Version affichée : **1.0.0** (`version` dans [`app.config.ts`](../../app.config.ts)). Elle ne change jamais seule : **la confirmer avant chaque build de production**.
- Numéros de build (`versionCode` Android, `buildNumber` iOS) : gérés par EAS ([`eas.json`](../../eas.json), `appVersionSource: remote` et `autoIncrement`), ils augmentent à chaque build de production.
- Chiffrement : l'app ne fait aucun appel réseau, `ITSAppUsesNonExemptEncryption` vaut `false` (`ios.config.usesNonExemptEncryption`), TestFlight ne pose donc pas la question de conformité à l'exportation.

## Une seule fois (fait le 28/10/2026)

1. Projet EAS `@yannvogel/hyakki`, identifiant dans `extra.eas.projectId` d'`app.config.ts` (la configuration dynamique empêche `eas init` de l'écrire seul).
2. Apps créées dans les deux consoles (`com.parallaxworks.hyakki`, App Store Connect : 6827876932, renseigné dans `eas.json` pour `eas submit`), fiches et déclarations saisies : [`fiche.md`](fiche.md), [`confidentialite.md`](confidentialite.md).
3. Signature : la clé d'importation Android est générée et gardée par EAS. Le premier build iOS demande une connexion Apple interactive (mot de passe et double authentification) pour créer le certificat et le profil de distribution ; les suivants les réutilisent.

## État de la 1.0.0 (09/11/2026)

| Store | Build | Où en est-on |
|---|---|---|
| App Store | 1.0.0 (9), [build EAS](https://expo.dev/accounts/yannvogel/projects/hyakki/builds/eb0fc530-7bb9-4710-9a28-7a09ba8ed24a), commit `ffeec84` | Construit le 09/11 par `eas build --auto-submit --no-wait`, envoi vers TestFlight programmé par EAS pour le groupe interne « Interne » ([envoi](https://expo.dev/accounts/yannvogel/projects/hyakki/submissions/71457740-9d63-4927-bee4-c7c104985925)). **Pas encore soumis à l'examen.** Précédents dans TestFlight : (8) du 05/11 (commit `c34503f`, milestone 8, [build](https://expo.dev/accounts/yannvogel/projects/hyakki/builds/50242b3c-29c8-4860-9bdb-27f3a2d3fab7)) ; (7) du 29/10 au soir (commit `2162390`, milestone 7) ; (6) du 29/10 (commit `f827c94`, avant la milestone 7) ; (5) du 29/10 au matin (commit `4add1b4`, sans les illustrations HD) ; (4) du 28/10, sans son. |
| Google Play | 1.0.0, versionCode 10, AAB construit en local le 09/11 (`store-captures/hyakki-1.0.0-10.aab`, 98 Mo, non versionné), commit `ffeec84` | **À importer en test interne** dans la Play Console, avec les notes « Nouveautés : les Gardiens éveillés brillent d'une aura violette, rapportent plus d'ofuda et ont leur section dans la galerie. ». Elle remplace la versionCode 9 (commit `c34503f`, milestone 8, construite le 05/11), dont les notes étaient « Nouveautés : monte tes shikigami ×10, ×100 ou Max, libère ceux que tu n'équipes pas contre des âmes, et le bilan d'absence défile avec « Récolter » toujours visible. » : à reprendre si la 9 n'a jamais été importée. Précédente publiée : version « 8 (1.0.0) » (commit `2162390`, milestone 7) **publiée en test interne** le 29/10 à 20 h 46 ; taille d'une nouvelle installation 55,7 Mo. Le test fermé « Tests fermés - Alpha » est resté sur la 7 (commit `f827c94`, envoyée pour examen le 29/10). Plus anciennes : versionCode 6 (commit `4add1b4`, son sans illustrations HD) publié en test interne le 29/10 au matin puis remplacé ; les deux builds EAS gratuits du 28/10 avaient échoué pendant la compilation C++ parallèle (manque de mémoire, puis limite de 45 minutes). |

Les builds iOS (9) et Android (10) ajoutent les Gardiens éveillés : ×3 ofuda par niveau d'Éveil (#130), aura violette et puce « Éveil N » (#132), historique des Gardiens éveillés vaincus dans la galerie (#133), ainsi que les correctifs du SDK 58 (`expo` 58.0.23, `react-native` 0.88.1…). **Le schéma de sauvegarde passe à 3** : une sauvegarde ouverte par ces builds n'est plus lisible par les builds iOS (8) et Android (9) ou plus anciens, qui la mettraient de côté ; ne pas revenir en arrière sur un même appareil. Ils contiennent aussi tout ce qu'avaient les builds précédents : milestone 8 (montée de niveau ×10 / ×100 / Max #123, bilan d'absence qui défile #122, libération des shikigami #124), milestone 7 (Kamidana, réactions aux coups, onglet Options), milestone 6, icône « Oni caché » (#59), son (#89, #90), illustrations HD (#58). Vérifiés sur simulateur iOS ; la vérification Android est dans #125. Les parcours Maestro sur Android et les captures des stores restent à refaire avant la production (interface des milestones 6 à 8 et Gardiens éveillés).

Pendant le build Android du 09/11, `expo-doctor` passe (20/20) : les correctifs du SDK 58 signalés au build du 05/11 sont appliqués.

**Builds Android en local.** La machine gratuite d'EAS ne suffit pas pour la compilation native. Le build se fait donc sur le Mac, avec la clé et la numérotation d'EAS :

```bash
ANDROID_HOME=$HOME/Library/Android/sdk npx eas-cli@latest build --platform android --profile production --local --output store-captures/hyakki-<version>.aab
```

Compter une vingtaine de minutes de compilation. Le fichier AAB (environ 100 Mo depuis les illustrations HD) s'importe ensuite à la main dans la Play Console.

## Google Play (#47)

1. Build : en local, voir plus haut (la clé d'importation, générée par EAS au premier build, reste sur ses serveurs).
2. Pour tester tout de suite : Tests › **Tests internes** › Créer une version, puis « Ajouter à partir de la bibliothèque » si l'AAB est déjà importé (un versionCode ne s'importe qu'une fois). La version est publiée sans examen, en général dans l'heure.
3. Play Console › Tester et publier › Tests › **Test fermé** : créer le canal, importer l'AAB à la main (Google refuse le tout premier envoi par l'API), rédiger les notes de version (« Première version de test. »).
4. Testeurs : une liste d'au moins **12 adresses** (amis, famille, Google Group) ; ils acceptent l'invitation et gardent l'app installée **14 jours consécutifs**.
5. Au bout des 14 jours : Tableau de bord › **Demander l'accès à la production** (questionnaire sur le déroulé du test).
6. Production : `npx eas-cli@latest submit --platform android --profile production` ou import manuel, pays : tous, puis envoi en examen.

## App Store (#48)

1. Build : `npx eas-cli@latest build --platform ios --profile production`. EAS demande la connexion au compte Apple Developer et crée le certificat et le profil de distribution.
2. Envoi vers TestFlight : `npx eas-cli@latest submit --platform ios --profile production`.
3. **TestFlight interne** : installer sur un iPhone et rejouer les parcours clés (premier lancement, frappes, capture, Gardien, Festival, retour après une absence, notification, Réglages).
4. Fiche de la version 1.0.0 (le numéro de version App Store doit être celui du build, `1.0.0`) : textes, captures iPhone 6,3 pouces, catégorie, copyright, URL ; App Privacy « Données non collectées » ; classification d'âge ; prix : gratuit, tous les pays.
5. Informations pour l'examen : aucun compte de démonstration nécessaire. Note proposée : « Jeu entièrement hors ligne, sans compte, sans publicité ni achat intégré. La seule notification est locale et facultative. »
6. Sélectionner le build, puis **Soumettre pour examen**.

## Avant chaque soumission

- [ ] Version confirmée.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` verts sur le commit construit.
- [ ] Parcours Maestro passés sur iOS et Android.
- [ ] Politique de confidentialité en ligne : <https://yannvogel.github.io/hyakki/confidentialite/>.
- [ ] Captures régénérées si l'interface a changé (`scripts/store-captures.sh`).
