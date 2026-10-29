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
| App Store | 1.0.0 (6), [build EAS](https://expo.dev/accounts/yannvogel/projects/hyakki/builds/9abe1af4-6bec-407e-a701-647ef93b3d54), commit `f827c94` | Construit et envoyé vers TestFlight le 29/10 par `eas build --auto-submit` ([envoi](https://expo.dev/accounts/yannvogel/projects/hyakki/submissions/ae90104e-81ba-4208-8c5b-41c258a0a02f), clé API App Store Connect gardée par EAS), pour le groupe interne « Interne ». **Pas encore soumis à l'examen.** Les builds précédents restent dans TestFlight : (4) du 28/10, sans son, et (5) du 29/10 au matin (commit `4add1b4`, avec le son, sans les illustrations HD). |
| Google Play | 1.0.0, versionCode 7, AAB construit en local (`store-captures/hyakki-1.0.0-7.aab`, 98 Mo, non versionné), commit `f827c94` | Version « 7 (1.0.0) » du test fermé « Tests fermés - Alpha », avec notes de version, **envoyée pour examen** le 29/10 : l'examen de la version 5, en cours depuis le 28/10, a été annulé et relancé avec elle. Taille d'une nouvelle installation : 55,7 Mo (+22,3 Mo, son et illustrations HD), signalée par un avertissement non bloquant de la Play Console. Le versionCode 6, construit le 29/10 au matin (commit `4add1b4`), n'a jamais été importé. Les deux builds EAS gratuits du 28/10 avaient échoué pendant la compilation C++ parallèle : le (2) par manque de mémoire, le (3) bloqué jusqu'à la limite de 45 minutes. |

Les deux builds contiennent les retours de jeu de la milestone 6 (décors illustrés, niveaux d'Éveil, meilleure équipe…), l'icône « Oni caché » (#59), le son (#89, #90) et les illustrations en haute définition (#58). Parcours Maestro et captures des stores pas encore refaits pour ces changements d'interface.

**Builds Android en local.** La machine gratuite d'EAS ne suffit pas pour la compilation native. Le build se fait donc sur le Mac, avec la clé et la numérotation d'EAS :

```bash
ANDROID_HOME=$HOME/Library/Android/sdk npx eas-cli@latest build --platform android --profile production --local --output store-captures/hyakki-<version>.aab
```

Compter une vingtaine de minutes de compilation. Le fichier AAB (environ 100 Mo depuis les illustrations HD) s'importe ensuite à la main dans la Play Console.

## Google Play (#47)

1. Build : en local, voir plus haut (la clé d'importation, générée par EAS au premier build, reste sur ses serveurs).
2. Play Console › Tester et publier › Tests › **Test fermé** : créer le canal, importer l'AAB à la main (Google refuse le tout premier envoi par l'API), rédiger les notes de version (« Première version de test. »).
3. Testeurs : une liste d'au moins **12 adresses** (amis, famille, Google Group) ; ils acceptent l'invitation et gardent l'app installée **14 jours consécutifs**.
4. Au bout des 14 jours : Tableau de bord › **Demander l'accès à la production** (questionnaire sur le déroulé du test).
5. Production : `npx eas-cli@latest submit --platform android --profile production` ou import manuel, pays : tous, puis envoi en examen.

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
