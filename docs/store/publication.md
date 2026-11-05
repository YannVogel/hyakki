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

## État de la 1.0.0 (05/11/2026)

| Store | Build | Où en est-on |
|---|---|---|
| App Store | 1.0.0 (8), [build EAS](https://expo.dev/accounts/yannvogel/projects/hyakki/builds/50242b3c-29c8-4860-9bdb-27f3a2d3fab7), commit `c34503f` | Construit le 05/11 au soir par `eas build --auto-submit --no-wait`, envoi vers TestFlight programmé par EAS pour le groupe interne « Interne » ([envoi](https://expo.dev/accounts/yannvogel/projects/hyakki/submissions/016c367f-6a2c-4651-9a53-34f745a05439)). **Pas encore soumis à l'examen.** Précédents dans TestFlight : (7) du 29/10 au soir (commit `2162390`, milestone 7, [build](https://expo.dev/accounts/yannvogel/projects/hyakki/builds/f68fc977-6c72-4821-be71-6c03ad35b814)) ; (6) du 29/10 (commit `f827c94`, avant la milestone 7) ; (5) du 29/10 au matin (commit `4add1b4`, sans les illustrations HD) ; (4) du 28/10, sans son. |
| Google Play | 1.0.0, versionCode 9, AAB construit en local le 05/11 au soir (`store-captures/hyakki-1.0.0-9.aab`, 94 Mo, non versionné), commit `c34503f` | **À importer en test interne** dans la Play Console, avec les notes « Nouveautés : monte tes shikigami ×10, ×100 ou Max, libère ceux que tu n'équipes pas contre des âmes, et le bilan d'absence défile avec « Récolter » toujours visible. ». Précédente : version « 8 (1.0.0) » (commit `2162390`, milestone 7) **publiée en test interne** le 29/10 à 20 h 46 ; taille d'une nouvelle installation 55,7 Mo. Le test fermé « Tests fermés - Alpha » est resté sur la 7 (commit `f827c94`, envoyée pour examen le 29/10). Plus anciennes : versionCode 6 (commit `4add1b4`, son sans illustrations HD) publié en test interne le 29/10 au matin puis remplacé ; les deux builds EAS gratuits du 28/10 avaient échoué pendant la compilation C++ parallèle (manque de mémoire, puis limite de 45 minutes). |

Les builds iOS (8) et Android (9) contiennent la milestone 8 : montée de niveau des shikigami ×10 / ×100 / Max (#123), bilan d'absence qui défile avec « Récolter » toujours visible (#122), libération des shikigami hors de l'équipe contre des âmes, seule ou en lot (#124). Le schéma de sauvegarde ne change pas (toujours 2). Ils contiennent aussi tout ce qu'avaient les builds précédents : milestone 7 (Kamidana, réactions aux coups, onglet Options), milestone 6, icône « Oni caché » (#59), son (#89, #90), illustrations HD (#58). Vérifiés sur simulateur iOS ; la vérification Android est dans #125. Les parcours Maestro sur Android et les captures des stores restent à refaire avant la production (interface des milestones 6 à 8).

Pendant le build Android, `expo-doctor` signale 14 dépendances Expo en retard d'une version de correctif sur le SDK 58 (`expo` 58.0.19 au lieu de 58.0.23, `react-native` 0.88.0 au lieu de 0.88.1…). L'étape n'est pas bloquante ; la mise à niveau (`npx expo install --check`) est à faire à part, avec de nouveaux builds.

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
