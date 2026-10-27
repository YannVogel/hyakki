# Journal des décisions

Chaque entrée : date, décision, raison, conséquence. Les plus récentes en haut.

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
- **Conséquence** : interdiction d'utiliser `number` pour les grandeurs exponentielles. À valider par un spike de performance (issue de la milestone 1).

## Questions ouvertes

- Anglais dès la V1 ou plus tard ? (Par défaut : français seul en V1, textes centralisés pour faciliter l'ajout.)
- Sons et musique : périmètre V1 ou après ?
- Correction définitive de Nurarihyon.
