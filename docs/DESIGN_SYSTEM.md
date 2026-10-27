# Design system

## 1. Direction artistique

**Cartoon / animé, lumineux et saturé.** Un monde de festival japonais en plein jour : ciel bleu vif, torii rouge, cerisiers roses, collines vertes. Tout est cerné d'un **contour encre épais** et posé avec des **ombres franches** (pas de flou, pas de dégradé d'interface). Les boutons ressemblent à des objets physiques qui s'enfoncent.

À éviter : interface sombre, dégradés décoratifs, textures réalistes, emojis, imitation d'un studio ou d'une licence existante.

Les tokens de référence sont dans [`design/tokens.json`](../design/tokens.json). Dans l'app, ils sont exposés par `src/ui/tokens.ts` (import typé du fichier : le modifier change toute l'app, sans étape de génération) ; aucun écran ne contient de valeur en dur.

| Module | Contenu |
|---|---|
| `src/ui/tokens.ts` | `colors`, `rarityColors`, `statColors`, `fontSizes`, `radii`, `strokes`, `spacing`, `shadows`, `touchTarget` |
| `src/ui/styles.ts` | `hardShadow(token)` (ombre franche `boxShadow` sans flou, identique iOS et Android), `outline(épaisseur)`, `displayText(taille)`, `bodyText(taille, graisse)` |
| `src/ui/OutlinedText.tsx` | Texte blanc cerné d'encre (8 copies décalées + ombre de 4 px vers le bas), lu une seule fois par les lecteurs d'écran |

Règle de lint : aucune couleur littérale (`#…`, `rgb(…)`) dans `src/ui/` et `src/features/`, et `design/tokens.json` n'est lu que par `src/ui/tokens.ts`. Les couleurs d'art des yōkai générés sont des données du générateur et vivent dans `src/render/yokai/colors.ts`.

## 2. Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `ink` | `#2B1D3F` | Contours, texte principal, ombres franches |
| `cream` | `#FFF4DC` | Fond des écrans |
| `paper` | `#FFFFFF` | Cartes, panneaux |
| `muted` | `#5A5266` | Texte secondaire (contraste ≥ 4,5:1 sur `paper` et `cream`) |
| `sky` | `#5CC8FF` | Ciel, bandeaux, sélection |
| `skyLight` | `#A8E9FF` | Bas du ciel, fonds d'écran clairs |
| `red` | `#FF4B3E` | Torii, actions principales de combat, PV ennemis (accent réglable) |
| `yellow` | `#FFD23F` | Monnaies, boutons d'action, onglet actif |
| `pink` | `#FF8FC7` | Sakura, joues, langues |
| `grass` / `grassDeep` | `#7FDCA0` / `#5CC88A` | Collines, stat PV |
| `orange` | `#FF7A45` | Talisman Kitsune-bi |

### Rareté

| Rareté | Couleur |
|---|---|
| Commun | `#B7C3D0` |
| Rare | `#3FB8FF` |
| Épique | `#B06BFF` |
| Légendaire | `#FFD23F` |

La rareté n'est **jamais** signalée par la couleur seule : toujours un libellé ou une icône en plus (accessibilité).

## 3. Typographie

| Rôle | Police | Usage |
|---|---|---|
| Display | **Mochiy Pop One** | Titres, chiffres de jeu, boutons principaux, dégâts |
| Interface | **M PLUS Rounded 1c** (500, 700, 800) | Texte courant, libellés, listes |

Les deux polices couvrent les kana et kanji utilisés (百鬼夜行, 火, 雷, 結…). Licence : SIL Open Font License (à embarquer dans `assets/fonts/`).

Titres sur fond coloré : texte blanc avec **contour encre** (ombre portée de 2 px dans 8 directions + 4 px vers le bas).

Échelle : 11 · 12 · 13 · 14 · 16 · 18 · 22 · 28 · 36 · 42.

## 4. Formes et relief

- **Contour** : 3 px `ink` sur les cartes et boutons, 2–2,5 px sur les éléments plus petits.
- **Ombre franche** : `0 4–6 px 0 ink` (aucun flou). Un bouton pressé descend de 3 px et perd son ombre.
- **Rayons** : 10 (puces), 14 (boutons, tuiles), 18–22 (cartes), 26 (modales), 44 (coins d'écran des maquettes).
- **Barres** : 14–16 px de haut, contour 2,5 px, remplissage à bord droit encré.

## 5. Composants de base

| Composant | Description |
|---|---|
| `Button` | Variantes `primary` (jaune), `danger` (rouge), `neutral` (blanc). Relief 3D, état pressé, état désactivé gris `#E6E3EC` avec texte `muted`. |
| `Card` | Fond `paper`, contour 3 px, rayon 18–22, ombre franche. |
| `Pill` | Monnaie ou info courte : fond blanc, contour, icône + valeur en display. |
| `ProgressBar` | PV, progression du défilé, plafond hors ligne. |
| `TabBar` | 4 onglets (Combat, Shikigami, Sanctuaire, Festival) ; onglet actif = pastille jaune encrée. |
| `Chip` | Traits d'un yōkai (« Cornes · +20 % attaque »). |
| `RarityBadge` | Pastille de couleur + libellé. |
| `Segmented` | ×1 / ×10 / Max. |

Implémentation : `src/ui/` (export groupé dans `src/ui/index.ts`). Chaque composant a un rôle d'accessibilité (`button`, `tab`, `radio`, `progressbar`…), un libellé, et des cibles d'au moins 44 pt. `Button`, `TabBar` et `Segmented` déclenchent un retour haptique via `useHaptics()` : `ui` ne parle pas à la plateforme, l'implémentation (`src/services/haptics.ts`) est fournie par la racine de l'app (`HapticsProvider`). En développement, l'écran « Catalogue des composants » (lien depuis l'accueil) les montre tous.

## 6. Animation et effets

- Effets de combat (Skia) : étoile d'impact jaune, chiffres de dégâts qui éclatent puis montent, « Critique ! » rouge cerné de blanc, lignes de vitesse, impact frame au critique.
- Cut-in de Gardien : fond en rayons tournants, bande blanche des yeux qui glisse depuis la gauche, bandeau jaune du nom depuis la droite.
- Respect strict de « réduire les animations » : les effets deviennent des fondus courts, rien ne tourne ni ne clignote.

## 7. Accessibilité

- Cibles tactiles ≥ 44 pt.
- Contraste texte ≥ 4,5:1 (≥ 3:1 au-delà de 24 px ou 18,7 px gras). Le texte blanc n'est autorisé sur couleur vive qu'avec le contour encre.
- Libellé d'accessibilité sur chaque bouton-icône et chaque illustration informative.
- Haptique désactivable dans les réglages.
