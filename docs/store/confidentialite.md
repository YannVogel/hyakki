# Confidentialité : politique et déclarations

Hyakki ne collecte **aucune** donnée : pas de compte, pas de serveur, pas de publicité, pas d'analytics, pas de rapport de plantage, aucun SDK tiers qui appelle le réseau. La partie est sauvegardée dans le stockage local de l'app (MMKV) ; la seule notification est locale.

## Politique de confidentialité

- URL à déclarer dans les deux consoles : **<https://yannvogel.github.io/hyakki/confidentialite/>**
- Source : [`site/confidentialite/index.html`](../../site/confidentialite/index.html). Toute évolution de l'app qui toucherait aux données doit mettre à jour cette page **avant** sa publication (avec la date).
- La page ne charge rien de tiers (polices système, pas de script) : la consulter ne transmet rien à personne d'autre que GitHub Pages.

## Apple — App Store Connect › App Privacy

| Question | Réponse |
|---|---|
| Privacy Policy URL | <https://yannvogel.github.io/hyakki/confidentialite/> |
| Do you or your third-party partners collect data from this app? | **No, we do not collect data from this app** |
| Résultat affiché sur la fiche | « Données non collectées » |
| App Tracking Transparency | Non utilisé (aucun suivi) |

Pas de manifeste de confidentialité spécifique à ajouter : les modules Expo embarquent leurs propres `PrivacyInfo.xcprivacy` (raisons d'API requises), fusionnés au build.

## Google — Play Console › Contenu de l'application

| Section | Réponse |
|---|---|
| Règles de confidentialité | <https://yannvogel.github.io/hyakki/confidentialite/> |
| Annonces | **Non**, l'application ne contient pas d'annonces |
| Accès aux applications | Toutes les fonctionnalités sont disponibles sans accès particulier |
| Sécurité des données › Votre application collecte-t-elle ou partage-t-elle des données utilisateur des types requis ? | **Non** |
| Sécurité des données › Suppression de compte | L'application ne permet pas de créer de compte |
| Applis gouvernementales, financières, santé, actualités | Non |
| Public cible et contenu | **13 ans et plus** recommandé (voir ci-dessous) |

### Public cible : pourquoi 13 ans et plus

Le style cartoon plaît aux enfants, mais cibler les moins de 13 ans fait entrer l'app dans le programme « Familles » de Google (exigences et revue supplémentaires). Comme Hyakki ne collecte rien et n'a ni pub ni achat, ce programme ne poserait pas de problème de fond, mais il ajoute une revue pour un bénéfice limité. À la question « l'app pourrait-elle attirer involontairement les enfants ? », répondre honnêtement selon la fiche finale. Décision à confirmer par Yann.

### Permissions Android déclarées

| Permission | Pourquoi |
|---|---|
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ajoutées par React Native et Expo (serveur de développement) ; l'app publiée ne fait aucune requête |
| `VIBRATE` | Retours haptiques (désactivables) |
| `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Notification locale « plafond hors ligne atteint » (expo-notifications) |

Bloquées dans `app.config.ts` (ajoutées par le modèle Expo, inutiles) : stockage externe et affichage par-dessus les autres apps.
