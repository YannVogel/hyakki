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

## État de la 1.0.0 (29/10/2026)

| Store | Build | Où en est-on |
|---|---|---|
| App Store | 1.0.0 (7), [build EAS](https://expo.dev/accounts/yannvogel/projects/hyakki/builds/f68fc977-6c72-4821-be71-6c03ad35b814), commit `2162390` | Construit le 29/10 au soir par `eas build --auto-submit` et envoyé vers TestFlight pour le groupe interne « Interne » ([envoi](https://expo.dev/accounts/yannvogel/projects/hyakki/submissions/d42d50e8-b6c8-44e4-95e8-c0f9e601727d), clé API App Store Connect gardée par EAS). **Pas encore soumis à l'examen.** Les builds précédents restent dans TestFlight : (4) du 28/10, sans son ; (5) du 29/10 au matin (commit `4add1b4`, sans les illustrations HD) ; (6) du 29/10 (commit `f827c94`, avant la milestone 7, [build](https://expo.dev/accounts/yannvogel/projects/hyakki/builds/9abe1af4-6bec-407e-a701-647ef93b3d54)). |
| Google Play | 1.0.0, versionCode 8, AAB construit en local le 29/10 au soir (`store-captures/hyakki-1.0.0-8.aab`, 98 Mo, non versionné), commit `2162390` | Version « 8 (1.0.0) » **publiée en test interne** le 29/10 à 20 h 46 (AAB importé par Yann, release préparée et publiée depuis la Play Console), avec les notes « Nouveautés : Kamidana, réactions des ennemis aux coups, onglet Options ». Taille d'une nouvelle installation : 55,7 Mo (+35 Ko), aucun appareil perdu. Le test fermé reste sur la 7. Précédent : version « 7 (1.0.0) » (commit `f827c94`, avant la milestone 7) **publiée en test interne** le 29/10 à 13 h (disponible tout de suite pour les testeurs internes), et **envoyée pour examen** le même jour dans le test fermé « Tests fermés - Alpha », avec les mêmes notes de version : l'examen de la version 5, en cours depuis le 28/10, a été annulé et relancé avec elle. Taille d'une nouvelle installation : 55,7 Mo (+22,3 Mo, son et illustrations HD), signalée par un avertissement non bloquant de la Play Console. Le versionCode 6, construit le 29/10 au matin (commit `4add1b4`, avec le son, sans les illustrations HD), a été publié en test interne à 10 h 58, puis remplacé par la 7. Les deux builds EAS gratuits du 28/10 avaient échoué pendant la compilation C++ parallèle : le (2) par manque de mémoire, le (3) bloqué jusqu'à la limite de 45 minutes. |

Les builds iOS (7) et Android (8) contiennent la milestone 7 : le Kamidana (améliorations permanentes payées en ofuda, nouvelle icône d'ofuda), les réactions des ennemis aux coups et l'onglet Options (réglages et règles du jeu). Ils passent la sauvegarde en schéma 2 : les parties de la 1.0.0 (7) et antérieures sont migrées au premier lancement, ofuda compris. Ils contiennent aussi tout ce qu'avaient les builds précédents : retours de jeu de la milestone 6 (décors illustrés, niveaux d'Éveil, meilleure équipe…), icône « Oni caché » (#59), son (#89, #90) et illustrations en haute définition (#58). Les parcours Maestro du Kamidana, des Réglages et des règles ont été joués sur le simulateur iOS. Les parcours sur Android et les captures des stores restent à refaire avant la production (interface des milestones 6 et 7).

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
