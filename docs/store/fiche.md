# Fiches des stores

Textes en français (la V1 est en français seulement), prêts à coller. Les longueurs respectent les limites des consoles (vérifiées au caractère près). Aucune marque déposée (ni « Tamagotchi », ni nom d'autre jeu).

## Identité

| Champ | Valeur | Limite |
|---|---|---|
| Nom (App Store) / Titre (Google Play) | Hyakki : le défilé des yōkai | 30 |
| Sous-titre (App Store) | Idle RPG gratuit, sans pub | 30 |
| Description courte (Google Play) | Purifie un défilé infini de yōkai et fais-en tes alliés. Gratuit et sans pub. | 80 |
| Mots-clés (App Store) | `idle,rpg,yokai,japon,collection,clicker,onmyoji,shikigami,boss,hors ligne,gratuit,anime` | 100 |
| Texte promotionnel (App Store) | Un défilé sans fin de yōkai, des Gardiens à vaincre en 30 secondes et une collection de plus d'un million de créatures. 100 % gratuit : ni pub, ni achat, ni compte. | 170 |
| Catégories | App Store : Jeux › Jeu de rôle (secondaire : Jeux › Simulation). Google Play : Jeux › Jeux de rôle | |
| Copyright | © 2026 Parallax Works | |
| URL d'assistance | <https://github.com/YannVogel/hyakki/issues> | |
| URL marketing | <https://yannvogel.github.io/hyakki/> | |
| Politique de confidentialité | <https://yannvogel.github.io/hyakki/confidentialite/> | |
| Prix | Gratuit, aucun achat intégré | |

## Description (les deux stores)

```text
Le Hyakki Yagyō approche : cent démons défilent dans la nuit… en plein jour, et en couleurs !

Tu es un jeune onmyōji, armé d'ofuda et de talismans. Face à toi, un défilé sans fin de yōkai : des tsukumogami, ces objets du quotidien qui prennent vie après cent ans. Lanternes cyclopes, théières moqueuses, sandales de paille farceuses… Purifie-les, vague après vague, et chacun peut rejoindre ta bande comme shikigami.

• Un défilé infini : ton équipe combat toute seule, touche l'écran pour frapper plus fort.
• Plus d'un million de yōkai différents, tous générés : leur apparence fixe leurs pouvoirs (trois yeux pour les critiques, des cornes pour l'attaque, un onibi pour brûler…).
• Une collection à compléter : forme ton équipe de trois shikigami, fais-les monter de niveau.
• Dix Gardiens illustrés à vaincre en 30 secondes, du Bake-danuki au redoutable Nurarihyon.
• Feu de renard, foudre de Raijin, barrière Kekkai : lance tes talismans au bon moment.
• Le Sanctuaire pour renforcer ton onmyōji, et le Festival pour relancer le défilé encore plus fort.
• Tes shikigami continuent le combat pendant ton absence.

100 % gratuit, pour de vrai : ni publicité, ni achat intégré, ni compte, ni serveur. Le jeu ne collecte aucune donnée et ta partie reste sur ton téléphone.

Hyakki est un projet de Parallax Works.
```

## Captures

Générées automatiquement sur l'état vitrine du hub de développement :

```bash
scripts/store-captures.sh        # iOS puis Android ; ou : ios, android
```

| Store | Appareil | Taille | Fichiers |
|---|---|---|---|
| App Store | iPhone 17 (6,3 pouces, taille de base d'App Store Connect, réutilisée pour les autres iPhone) | 1206 × 2622 | `store-captures/ios/01-combat.png` … `06-gardien.png` |
| Google Play | Émulateur Android : barres système retirées, puis ramené au 9:16 exigé (côtés complétés avec le crème de l'app) | 1080 × 1920 | `store-captures/android/…` |

Ordre conseillé : 01 Combat (effets), 02 Shikigami (collection et équipe), 03 Sanctuaire, 04 Festival, 05 Retour hors ligne, 06 Gardien. Le dossier `store-captures/` n'est pas versionné : on le régénère.

Google Play demande aussi l'icône 512 × 512 et l'image de présentation 1024 × 500 : `npx tsx scripts/render-store-graphics.ts` les écrit dans `store-captures/google-play/`.

## Classification d'âge

Aucune donnée à déclarer, aucun contenu généré par les joueurs, aucune communication entre joueurs, aucun accès web, aucun achat, aucune publicité, aucun jeu d'argent.

| Questionnaire | Réponse | Résultat attendu |
|---|---|---|
| App Store (âge) | Violence de dessin animé ou fantastique : **à trancher**, peu fréquente ou fréquente (le combat est permanent, mais léger : on « purifie » des créatures, sans sang ni blessure). Thèmes d'horreur ou de peur : **peu fréquents / légers** (Gashadokuro, squelette géant, en style cartoon). Alcool, tabac ou drogues : **peu fréquent**, car l'accessoire « kiseru » du générateur V2 est une pipe. Tout le reste : **aucun**. | Calculé par la console |
| Google Play (IARC) | Catégorie Jeu. Violence : oui, **fantastique / dessin animé**, sans sang, contre des créatures non humaines. Peur : non. Tabac : **représentation** (kiseru). Sexualité, langage, jeux d'argent, achats, interactions : non. | Calculé par l'IARC |

Le kiseru peut relever l'âge minimum. Pour l'éviter, il faudrait le retirer des nouveaux défilés, ce qui demande une version 3 du générateur. Les défilés et les shikigami existants garderaient leur version. À décider par Yann.
