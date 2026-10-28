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

Réponses saisies le 28/10/2026, à refaire si le contenu change (nouvel accessoire, nouveau Gardien) :

| Questionnaire | Réponses | Résultat |
|---|---|---|
| App Store | Violence de dessin animé ou fantastique : **fréquente** (le combat est permanent, mais léger : on « purifie » des créatures, sans sang). Armes : **peu fréquentes** (le kanabō clouté d'Ibaraki-dōji). Horreur ou peur : **peu fréquentes** (Gashadokuro, regards du cut-in). Alcool, tabac ou drogues : **peu fréquent** (kiseru). Violence réaliste, vulgarité, sexualité, médical, hasard, coffres à butin : **aucun**. | **13+** (12+ au Vietnam et au Brésil ; la Corée du Sud demande un numéro de classification local) |
| Google Play (IARC) | Catégorie Jeu. Violence fantastique et irréaliste, sans sang, style enfantin : contre des créatures (fréquente, en plan éloigné) et contre l'humain (le héros assommé après un Gardien raté, rare). Peur : éléments effrayants rares. Tabac : consommation, rare, jamais par le joueur. Sexualité, jeux d'argent, langage, humour grossier, achats, interactions, localisation : non. | **PEGI 7**, USK 6, ESRB 10+, ClassInd 10, IARC 7+ ; Corée du Sud 15+, Taïwan 15 |

Le kiseru (environ 7 % des yōkai V2, dessiné à la bouche avec de la fumée) est gardé et déclaré : décision de Yann, voir [`DECISIONS.md`](../DECISIONS.md).

## Éléments générés par IA (Google Play)

La fiche Google Play signale comme créés avec l'IA l'image de présentation et les captures 01, 03, 04, 05 et 06, où apparaissent le héros ou un Gardien (illustrations ChatGPT, voir [`ART_PIPELINE.md`](../ART_PIPELINE.md)). L'icône et la capture 02 (Shikigami) ne montrent que des yōkai générés par le code : elles ne sont pas signalées. À refaire à chaque changement d'image.
