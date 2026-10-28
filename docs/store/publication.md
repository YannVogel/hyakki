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

## Google Play (#47)

1. Build : `npx eas-cli@latest build --platform android --profile production` (un fichier AAB). Au premier build, laisser EAS générer la clé d'importation.
2. Play Console › Tester et publier › Tests › **Test fermé** : créer le canal, importer l'AAB à la main (Google refuse le tout premier envoi par l'API), rédiger les notes de version (« Première version de test. »).
3. Testeurs : une liste d'au moins **12 adresses** (amis, famille, Google Group) ; ils acceptent l'invitation et gardent l'app installée **14 jours consécutifs**.
4. Au bout des 14 jours : Tableau de bord › **Demander l'accès à la production** (questionnaire sur le déroulé du test).
5. Production : `npx eas-cli@latest submit --platform android --profile production` ou import manuel, pays : tous, puis envoi en examen.

## App Store (#48)

1. Build : `npx eas-cli@latest build --platform ios --profile production`. EAS demande la connexion au compte Apple Developer et crée le certificat et le profil de distribution.
2. Envoi vers TestFlight : `npx eas-cli@latest submit --platform ios --profile production`.
3. **TestFlight interne** : installer sur un iPhone et rejouer les parcours clés (premier lancement, frappes, capture, Gardien, Festival, retour après une absence, notification, Réglages).
4. Fiche de la version 1.0 : textes, captures 6,9 pouces, catégorie, copyright, URL ; App Privacy « Données non collectées » ; classification d'âge ; prix : gratuit, tous les pays.
5. Informations pour l'examen : aucun compte de démonstration nécessaire. Note proposée : « Jeu entièrement hors ligne, sans compte, sans publicité ni achat intégré. La seule notification est locale et facultative. »
6. Sélectionner le build, puis **Soumettre pour examen**.

## Avant chaque soumission

- [ ] Version confirmée.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` verts sur le commit construit.
- [ ] Parcours Maestro passés sur iOS et Android.
- [ ] Politique de confidentialité en ligne : <https://yannvogel.github.io/hyakki/confidentialite/>.
- [ ] Captures régénérées si l'interface a changé (`scripts/store-captures.sh`).
