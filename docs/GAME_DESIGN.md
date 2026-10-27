# Game design

> Valeurs chiffrées = **points de départ**. Elles seront ajustées avec le harnais de simulation (milestone 1) avant toute finition.

## 1. Pitch

Chaque soir, le **Hyakki Yagyō** — le défilé des cent démons — traverse la ville. Un jeune **onmyōji** (exorciste) se dresse sur son chemin, ofuda en main. Il purifie les yōkai un par un ; certains, apaisés, deviennent ses **shikigami** et combattent à ses côtés. Tous les cent yōkai, un **Gardien** du défilé barre la route.

Ton : léger, malicieux, coloré. Inspiré du folklore japonais, sans référence à une licence existante.

## 2. Public et contraintes

- Jeu mobile iOS + Android, **gratuit**, sans publicité, sans achat intégré, sans compte, sans réseau.
- Sessions courtes (30 s à 5 min), plusieurs fois par jour. Le jeu avance aussi hors ligne.
- Classification d'âge la plus basse possible : pas de sang, pas de tabac, pas d'alcool, pas de contenu suggestif.
- Objectif du projet : vitrine technique et artistique (portfolio), donc qualité de finition > quantité de contenu.

## 3. Vocabulaire

| Terme | Définition |
|---|---|
| **Défilé** | Une partie (run). Le numéro du défilé augmente à chaque Festival. |
| **Vague** | Un yōkai à purifier. Les vagues s'enchaînent sans fin. |
| **Yōkai** | Ennemi ordinaire, un *tsukumogami* généré procéduralement (voir [`PROCEDURAL_YOKAI.md`](PROCEDURAL_YOKAI.md)). |
| **Gardien** | Boss illustré, toutes les 100 vagues. 10 Gardiens en V1. |
| **Shikigami** | Yōkai capturé, membre de la collection. Trois forment l'équipe active. |
| **Âmes** | Monnaie principale, gagnée en purifiant. |
| **Ofuda** | Monnaie rare, gagnée sur les Gardiens et les paliers. |
| **Étincelles** | Monnaie de prestige, gagnée au Festival. |
| **Sanctuaire** | Écran des améliorations de l'onmyōji (payées en âmes). |
| **Talismans** | Les trois compétences actives de l'onmyōji. |
| **Festival** | Le prestige : relancer le défilé plus fort. |

## 4. Boucle de jeu

```
Combat automatique ──► âmes ──► Sanctuaire (améliorations) ──► combat plus rapide
      │                                                            │
      ├──► capture de shikigami ──► équipe active ──► bonus ───────┤
      │                                                            │
      └──► Gardien toutes les 100 vagues ──► ofuda + palier ───────┘
                       │
      progression qui ralentit ──► Festival ──► étincelles ──► bonus permanent ──► nouveau défilé
```

### 4.1 Combat

- Le héros et l'équipe active attaquent **automatiquement** le yōkai en cours.
- **Toucher l'écran** porte une frappe supplémentaire (dégâts de frappe, chance de critique).
- Quand un yōkai tombe à 0 PV : gain d'âmes, tirage de capture, vague suivante.
- Trois **talismans** à recharge :
  - **Kitsune-bi** (火) : gros dégâts de feu + brûlure pendant 5 s.
  - **Raijin** (雷) : très gros dégâts instantanés.
  - **Kekkai** (結) : contre un Gardien, ajoute 5 s au chrono ; sinon, double les âmes pendant 10 s.

### 4.2 Gardiens

- Vagues 100, 200 … 1000 : un Gardien illustré, **cut-in** animé à son entrée, **30 s** pour le vaincre.
- Échec : retour à la vague précédente (−1), où le joueur peut farmer avant de retenter.
- Victoire : ofuda, palier franchi (les vagues suivantes donnent plus d'âmes), Gardien ajouté à la galerie.
- Ordre V1 : Bake-danuki, Kappa, Karasu-tengu, Tsuchigumo, Yuki-onna, Gashadokuro, Nue, Ibaraki-dōji, Kyūbi no kitsune, Nurarihyon.
- Au-delà de la vague 1000 : les Gardiens reviennent en version « éveillée » (palette et multiplicateur) en attendant de nouvelles planches.

### 4.3 Sanctuaire

Améliorations payées en âmes, achetables par ×1, ×10 ou Max :

| Amélioration | Effet par niveau | Coût de base |
|---|---|---|
| Lame d'ofuda | +8 % de dégâts de frappe et automatiques | 10 |
| Feu de renard | Brûlure : +0,2 % des PV max par seconde | 500 |
| Clochette sacrée | +5 % d'âmes récoltées | 150 |
| Kekkai | −2 % de recharge des talismans (max −50 %) | 5 000 |
| Lanternes de veille | +1 h de plafond hors ligne (max 24 h) | 50 000 |

### 4.4 Shikigami

- À chaque yōkai purifié, tirage de **capture** selon sa rareté : commun 2 %, rare 1 %, épique 0,4 %, légendaire 0,1 %.
- Capturer une graine déjà possédée donne +1 niveau à ce shikigami.
- L'**équipe active** (3 places) ajoute ses dégâts automatiques et ses **bonus d'apparence** (cornes = attaque, yeux = critique, etc. — table complète dans [`PROCEDURAL_YOKAI.md`](PROCEDURAL_YOKAI.md)).
- Un shikigami monte de niveau contre des âmes : `100 × 1,18^(niveau − 1)`.
- **Frappe d'un shikigami** = frappe du héros × 0,5 × attaque / 100 × (1 + 25 % par niveau au-delà du premier), toutes les `1 000 ms × 100 / vitesse` : l'attaque fait la force, la vitesse la cadence.
- **Bonus d'équipe** = somme des traits offensifs des trois membres : attaque (+% de dégâts pour tous), critique (+ points de chance de critique, plafonnée à 75 %), vitesse (+% de cadence pour tous), âmes, brûlure. Les traits de PV et de défense ne jouent que lorsque le yōkai est un ennemi (sa résistance).
- Les bonus de sources différentes se multiplient (Sanctuaire × équipe × Festival) ; ceux d'une même source s'additionnent.
- Un nouveau membre d'équipe commence un cycle d'attaque complet (pas de frappe gratuite en changeant d'équipe).

### 4.5 Festival (prestige)

- Débloqué après le premier Gardien (vague 100).
- Étincelles gagnées : `E = floor(5 × (vague_max / 100) ^ 1.8)`.
- Effet : remise à zéro des vagues, des âmes et des niveaux du Sanctuaire ; **conservation** des shikigami, des ofuda et de la galerie des Gardiens.
- Bonus permanent : `× (1 + 0,05 × étincelles_totales)` sur les dégâts et les âmes.

### 4.6 Hors ligne

- Au retour, le jeu calcule ce que l'équipe a accompli pendant l'absence : yōkai purifiés, âmes, vagues franchies, captures.
- Efficacité hors ligne : 50 % du rendement actif. Les Gardiens ne sont jamais vaincus hors ligne (la progression s'arrête au Gardien suivant).
- Plafond : 8 h au départ, +1 h par niveau de Lanternes de veille, 24 h maximum.
- Une notification locale prévient quand le plafond est atteint (si le joueur l'a autorisée).

## 5. Formules de départ

| Grandeur | Formule | Remarque |
|---|---|---|
| PV d'un yōkai à la vague `v` | `12 × 1.165^(v−1) × m_objet` | `m_objet` = PV de base de l'objet / 100 |
| PV d'un Gardien | `12 × PV(v)` | |
| Âmes par yōkai | `2 × 1.14^(v−1)` | Gardien : ×15 |
| Dégâts de base | `1 × (1 + 0,08 × niv_lame)` | × multiplicateurs (Festival, shikigami, critique) |
| Coût d'achat de `k` niveaux | `base × 1.15^niv × (1.15^k − 1) / 0.15` | |
| Critique | 5 % de base, ×3 dégâts | + bonus d'apparence des shikigami |

Ces croissances dépassent vite la limite d'un `number` JavaScript (vers la vague 4 000) : toutes ces grandeurs utilisent le type `BigNum` du moteur.

Toutes ces constantes sont dans `src/engine/balance.ts` : c'est le seul endroit où on les règle.

### 5.1 Modèle de combat (implémentation)

- **Attaques discrètes** : le héros frappe toutes les 1 000 ms (première frappe immédiate) ; chaque frappe, automatique ou au toucher, tire sa chance de critique sur le RNG à graine de la partie.
- **PV d'un yōkai** = `PV(v) × PV du yōkai / 100` : la stat PV (objet, traits, rareté) fait office de résistance. Un yōkai légendaire est donc plus coriace.
- **Âmes d'un yōkai** = `âmes(v) × multiplicateur de rareté × (1 + bonus de clochette du yōkai) × (1 + 5 % × Clochette sacrée)` : un yōkai coriace rapporte plus.
- La **défense** ne sert pas au combat en V1 (aucun ennemi ne frappe le héros).
- **Brûlures** (Feu de renard, puis onibi et Kitsune-bi) : dégâts continus en % des PV max par seconde, qui peuvent achever un yōkai entre deux frappes.
- Les dégâts en trop sur un yōkai vaincu sont perdus ; le yōkai suivant arrive aussitôt.
- Un pas de simulation couvre l'intervalle semi-ouvert [début, fin[ : découper une durée en plusieurs pas donne les mêmes frappes, dans le même ordre, et le même état (à 1e-9 près sur les dégâts quand une brûlure est active).

## 6. Écrans (maquettes)

Maquettes de référence dans Claude Design (lien dans [`design/README.md`](../design/README.md)) :

1. **Retour hors ligne** — modale de récolte, héros endormi.
2. **Combat** — scène, héros, yōkai, PV, chiffres de dégâts, talismans, barre d'onglets.
3. **Cut-in de Gardien** — bande des yeux, nom, faiblesse, chrono.
4. **Shikigami** — équipe active et collection.
5. **Sanctuaire** — améliorations, ×1 / ×10 / Max.
6. **Festival** — prestige.
7. **Gardiens** — galerie des boss, silhouettes pour ceux pas encore croisés.

## 7. Hors V1

Sons et musique, langue anglaise, nouvelles planches de Gardiens, arbre de talents du Festival, événements saisonniers. À décider après la V1.
