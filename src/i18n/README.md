# `src/i18n` — les textes du jeu

Tous les textes affichés au joueur. V1 : français uniquement.

| Fichier | Contenu |
|---|---|
| `fr.ts` | Textes des écrans (`strings`). Un texte paramétré est une fonction : `counter(2)`. |
| `yokai.ts` | Noms des pièces, description accordée en genre (`describeYokai`), libellés et effets des traits. |

## Règles

- Aucun texte joueur en dur ailleurs dans le code.
- Les écrans importent `strings` depuis `@/i18n`.
- Ce dossier ne dépend du moteur que par ses types (identifiants des pièces).
