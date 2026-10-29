# Game design

> Valeurs chiffrées calibrées avec le harnais de simulation (§ 5.2, `docs/balancing/`). Elles restent à valider par Yann en jeu.

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
| **Ofuda** | Monnaie rare, gagnée uniquement sur les Gardiens, dépensée au Kamidana et conservée au Festival. |
| **Étincelles** | Monnaie de prestige, gagnée au Festival. |
| **Sanctuaire** | Écran des améliorations de l'onmyōji (payées en âmes). |
| **Kamidana** | L'autel des ofuda : améliorations permanentes, conservées au Festival et remboursables à 100 %. |
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
- Valeurs de départ (`balance.ts`) : Kitsune-bi = 20 frappes du héros puis brûlure de 1 % des PV max par seconde pendant 5 s, recharge 30 s ; Raijin = 50 frappes, recharge 60 s ; Kekkai, recharge 45 s. Un talisman de l'élément faible du Gardien fait ×2. Les talismans ne font pas de critique. Ils sont refusés pendant le cut-in d'un Gardien ; les recharges suivent le temps réel.

### 4.2 Gardiens

- Vagues 100, 200 … 1000 : un Gardien illustré, **cut-in** animé à son entrée, **30 s** pour le vaincre.
- Échec : retour à la vague précédente (−1), où le joueur peut farmer avant de retenter.
- Victoire : ofuda, palier franchi (les vagues suivantes donnent plus d'âmes), Gardien ajouté à la galerie.
- Ordre V1 : Bake-danuki, Kappa, Karasu-tengu, Tsuchigumo, Yuki-onna, Gashadokuro, Nue, Ibaraki-dōji, Kyūbi no kitsune, Nurarihyon.
- Au-delà de la vague 1000 : **niveaux d'Éveil**. Chaque fois que Nurarihyon tombe, le défilé repart de la première vague un niveau d'« Éveil » plus haut (Éveil 2, Éveil 3…), et les Gardiens reviennent en version « éveillée » en attendant de nouvelles planches. Une annonce « Éveil N ! » salue le passage ; l'en-tête affiche « Défilé N · Éveil N » à partir de l'Éveil 2, et toutes les vagues montrées au joueur (en-tête, carte de l'ennemi, cut-in, retour hors ligne, Festival) sont celles du niveau, de 1 à 1000.
- **Implémentation** :
  - À son apparition, le Gardien **attend** (cut-in) : rien ne combat et le chrono ne tourne pas tant que le joueur n'a pas choisi « Affronter » (`engageGuardian`) ou « Fuir » (`fleeGuardian`).
  - PV = 12 × PV(v) (×2 par cycle éveillé). Âmes = âmes(v) × 15. Ofuda = 5 × rang du Gardien (1 à 10) × (cycle + 1).
  - Éveil : l'état garde la vague absolue (pas de changement de sauvegarde) ; niveau = `floor((v − 1) / 1000) + 1`, vague du niveau = `(v − 1) mod 1000 + 1` (`awakeningLevel`, `waveInCycle`). L'éveil d'un Gardien vaut le niveau moins un. Les PV continuent de suivre `1,13^(v−1)` : à vague du niveau égale, tout ennemi du niveau N + 1 est plus résistant qu'au niveau N, sans multiplicateur ajouté. Le Festival ramène au niveau 1 avec les vagues.
  - Échec ou fuite : retour à la vague précédente en **farm** ; chaque yōkai vaincu y est remplacé par un nouveau (graine dérivée de la répétition). « Affronter le Gardien » (`challengeGuardian`) le fait revenir.
  - Palier : chaque centaine de vagues franchie donne **+50 % d'âmes** aux vagues suivantes.
  - Les brûlures en % des PV max ne font que **20 %** de leur effet sur un Gardien (sinon elles le videraient en 30 s).
  - Faiblesses (talisman ×2) : feu pour Bake-danuki, Karasu-tengu, Tsuchigumo, Yuki-onna, Nurarihyon ; foudre pour Kappa, Gashadokuro, Nue, Ibaraki-dōji, Kyūbi.
  - Un Gardien ne se capture pas.

### 4.3 Sanctuaire

Améliorations payées en âmes, achetables par ×1, ×10 ou Max :

| Amélioration | Effet par niveau | Coût de base |
|---|---|---|
| Lame d'ofuda | ×1,0925 sur les dégâts de frappe et automatiques (cumulatif) | 5 |
| Feu de renard | Brûlure : +0,2 % des PV max par seconde | 500 |
| Clochette sacrée | +5 % d'âmes récoltées | 150 |
| Kekkai | −2 % de recharge des talismans (max −50 %) | 5 000 |
| Lanternes de veille | +1 h de plafond hors ligne (max 24 h) | 50 000 |

Implémentation : coût de `k` niveaux depuis le niveau `n` = `base × 1,12^n × (1,12^k − 1) / 0,12` ; « Max » achète autant de niveaux que le solde le permet ; près du niveau maximal (Kekkai 25, Lanternes 16), « ×10 » achète ce qui reste. Le Feu de renard brûle le yōkai en cours en continu ; Lame d'ofuda, Clochette sacrée et équipe se multiplient entre elles.

### 4.4 Shikigami

- À chaque yōkai purifié, tirage de **capture** selon sa rareté : commun 2 %, rare 1 %, épique 0,4 %, légendaire 0,1 %.
- Capturer une graine déjà possédée donne +1 niveau à ce shikigami.
- L'**équipe active** (3 places) ajoute ses dégâts automatiques et ses **bonus d'apparence** (cornes = attaque, yeux = critique, etc. — table complète dans [`PROCEDURAL_YOKAI.md`](PROCEDURAL_YOKAI.md)).
- Un shikigami monte de niveau contre des âmes : `100 × 1,18^(niveau − 1)`.
- **Frappe d'un shikigami** = frappe du héros × 0,5 × attaque / 100 × (1 + 10 % par niveau au-delà du premier), toutes les `1 000 ms × 100 / vitesse` : l'attaque fait la force, la vitesse la cadence. La progression par niveau est linéaire : la frappe du héros, dont elle dépend, se multiplie déjà avec la Lame.
- **Bonus d'équipe** = somme des traits offensifs des trois membres : attaque (+% de dégâts pour tous), critique (+ points de chance de critique, plafonnée à 75 %), vitesse (+% de cadence pour tous), âmes, brûlure. Les traits de PV et de défense ne jouent que lorsque le yōkai est un ennemi (sa résistance).
- Les bonus de sources différentes se multiplient (Sanctuaire × équipe × Festival) ; ceux d'une même source s'additionnent.
- Un nouveau membre d'équipe commence un cycle d'attaque complet (pas de frappe gratuite en changeant d'équipe).
- **Meilleure équipe** (bouton de l'écran Shikigami) : équipe les trois shikigami qui font le plus de dégâts ensemble, **chacun jugé au niveau 1** (le yōkai lui-même, pas les niveaux investis : un shikigami très monté peut sortir de l'équipe). Score = dégâts par seconde espérés du héros et de l'équipe à la vague en cours, bonus d'équipe compris (attaque, vitesse, critique, brûlure plafonnée par les frappes) ; départage par le bonus d'âmes, puis par les plus petites graines. Recherche exacte parmi les 12 meilleurs shikigami pris seuls (`bestTeam`), environ 5 ms pour 500 shikigami. Bouton désactivé si la collection est vide ou si l'équipe est déjà la meilleure.

### 4.5 Festival (prestige)

- Débloqué après le premier Gardien (vague 100).
- Étincelles gagnées : `E = floor(5 × (vague_max / 100) ^ 1.8)`.
- Effet : remise à zéro des vagues, des âmes et des niveaux du Sanctuaire ; **conservation** des shikigami, des ofuda, du Kamidana et de la galerie des Gardiens.
- Bonus permanent : `× (1 + 0,05 × étincelles_totales)` sur les dégâts et les âmes.
- **Implémentation** : débloqué dès que le record du défilé dépasse la vague 100. Le nouveau défilé a sa propre graine (dérivée de la précédente) ; l'équipe active est conservée avec la collection ; les recharges des talismans et les effets repartent de zéro. Le bonus s'applique partout où le moteur calcule dégâts et âmes (combat actif et hors ligne).

### 4.6 Hors ligne

- Au retour, le jeu calcule ce que l'équipe a accompli pendant l'absence : yōkai purifiés, âmes, vagues franchies, captures.
- Efficacité hors ligne : 50 % du rendement actif. Les Gardiens ne sont jamais vaincus hors ligne (la progression s'arrête au Gardien suivant).
- Plafond : 8 h au départ, +1 h par niveau de Lanternes de veille, 24 h maximum.
- Une notification locale prévient quand le plafond est atteint (si le joueur l'a autorisée) : « Les lanternes sont pleines ! ». Elle est planifiée quand l'app passe en arrière-plan, à l'heure où le plafond sera atteint, et annulée au retour. La permission n'est jamais demandée au premier lancement : seulement après la fermeture du premier bilan d'absence (le joueur sait alors à quoi elle sert) ou quand il active « Notifications » dans les Réglages. Refusée, ou réglage coupé : aucune notification. Aucun push, aucun serveur (`src/services/notifications.ts`, `src/state/useCapReminder.ts`).
- **Implémentation** (`simulateOffline`) : calcul yōkai par yōkai avec les **dégâts espérés** (critiques moyennés, brûlures comprises), sans rejouer de ticks. La progression s'arrête devant le Gardien suivant : le reste du temps, l'équipe farme la vague d'avant, et le joueur retrouve le Gardien qui l'attend (un Gardien quitté en plein combat l'attend de nouveau, chrono plein). Un joueur parti en farm continue de farmer.
- Au-delà de **2 000 yōkai** simulés un par un, les âmes de la suite du farm sont extrapolées depuis cet échantillon (même vague, même rendement moyen) ; les captures ne sont tirées que sur l'échantillon. Cela garde le calcul sous la centaine de millisecondes sur mobile.
- Sur 10 minutes à efficacité 100 %, le résultat reste à ±1 vague et ±15 % d'âmes du combat actif (test de cohérence).
- Le rapport donne : durée prise en compte, plafond atteint ou non, yōkai purifiés, âmes, vagues (de → à), arrêt devant un Gardien, montées de niveau des shikigami (captures et doublons).

### 4.7 Kamidana (améliorations permanentes)

Le **kamidana** (神棚) est l'autel domestique où l'on dépose ses ofuda. Chaque ofuda qu'on y place achète un niveau d'une amélioration très puissante, **conservée d'un Festival à l'autre** ; on peut les reprendre tous à tout moment, gratuitement, pour les placer ailleurs.

| Amélioration | Effet par niveau | Coût de base | Niveau max |
|---|---|---|---|
| Bénédiction de la lame | ×1,5 sur tous les dégâts (héros, toucher, shikigami, talismans) | 10 | 10 |
| Œil du tengu | +1 au multiplicateur de critique (×3 → ×4…), plafond de chance inchangé | 10 | 5 |
| Paume d'Inari | ×2 sur les dégâts du toucher | 5 | 8 |
| Pacte des shikigami | ×1,5 sur les dégâts de l'équipe | 10 | 10 |
| Sablier du kami | +5 s au chrono des Gardiens (50 s au plus) | 10 | 4 |
| Œil de la faille | +1 au multiplicateur de faiblesse (×2 → ×3…) | 10 | 5 |
| Talismans majeurs | ×2 sur Kitsune-bi et Raijin ; +5 s au bonus d'âmes de Kekkai | 10 | 8 |
| Départ avancé | chaque nouveau défilé démarre 25 vagues plus loin | 15 | 8 |
| Bourse sacrée | ×2 sur les âmes, combat et hors ligne | 10 | 10 |
| Flamme du Festival | +25 % d'étincelles gagnées au Festival | 15 | 8 |
| Veille de l'onmyōji | +10 points d'efficacité hors ligne (100 % au plus) | 10 | 5 |
| Appel des yōkai | ×1,5 sur les chances de capture (100 % au plus) | 5 | 6 |

- **Coût** du niveau `n → n + 1` : `arrondi(base × 2^n)` ofuda, achat un niveau à la fois. Valeurs de départ, à calibrer avec le harnais (§ 5.2).
- **Remboursement** : un seul geste rend tout, au prix actuel des niveaux possédés (somme des coûts). Il vaut donc toujours exactement le prix de rachat, même après un rééquilibrage ; rien d'autre n'est sauvegardé. Un niveau au-dessus d'un maximum abaissé reste chargé et remboursé.
- Un effet lié à un minuteur déjà lancé (chrono d'un Gardien engagé) s'applique au prochain lancement.
- **Implémentation** : `src/engine/economy/kamidana.ts` (achat, remboursement), niveaux dans `GameState.kamidana` (schéma de sauvegarde 2). Les effets se branchent dans le moteur au fil de la milestone 7 et se multiplient avec les autres sources.

## 5. Formules

| Grandeur | Formule | Remarque |
|---|---|---|
| PV d'un yōkai à la vague `v` | `12 × 1,13^(v−1) × PV du yōkai / 100` | La stat PV (objet, traits, rareté) fait la résistance |
| PV d'un Gardien | `12 × 12 × 1,13^(v−1)` | ×2 par cycle éveillé au-delà de 1000 |
| Âmes par yōkai | `2 × 1,13^(v−1)` | × rareté × clochette ; Gardien ×15 ; +50 % par palier de 100 vagues |
| Frappe du héros | `1 × 1,0925^niv_lame` | × (1 + attaque d'équipe) × Festival ; critique ×3 |
| Frappe d'un shikigami | `frappe du héros × 0,5 × attaque / 100 × (1 + 10 % × (niveau − 1))` | toutes les `1 000 ms × 100 / vitesse` |
| Coût de `k` niveaux au Sanctuaire | `base × 1,12^niv × (1,12^k − 1) / 0,12` | |
| Coût d'un niveau de shikigami | `100 × 1,18^(niveau − 1)` | |
| Critique | 5 % de base (75 % au plus), ×3 dégâts | + bonus d'apparence des shikigami |
| Brûlures | % des PV max par seconde, au plus 9 × les dégâts par seconde espérés des frappes | ×0,2 contre un Gardien |
| Festival | `étincelles = ⌊5 × (record / 100)^1,8⌋`, bonus `× (1 + 0,05 × étincelles)` | Dégâts et âmes |

**Pourquoi des niveaux qui se multiplient** : les coûts croissent de façon exponentielle (×1,12 par niveau). Avec des dégâts linéaires (« +8 % par niveau » des formules de départ), les dégâts ne croissent que comme le logarithme des âmes et le joueur bute contre un mur dès la vague 40, quel que soit son temps de jeu (mesuré par le harnais). Chaque niveau de Lame multiplie donc les dégâts par 1,0925 ; l'écart entre la croissance des PV (×1,13 par vague) et celle des dégâts achetables crée un mur progressif, que le Festival repousse.

Ces croissances dépassent vite la limite d'un `number` JavaScript (vers la vague 4 000) : toutes ces grandeurs utilisent le type `BigNum` du moteur.

Toutes ces constantes sont dans `src/engine/balance.ts` : c'est le seul endroit où on les règle.

### 5.1 Modèle de combat (implémentation)

- **Attaques discrètes** : le héros frappe toutes les 1 000 ms (première frappe immédiate) ; chaque frappe, automatique ou au toucher, tire sa chance de critique sur le RNG à graine de la partie.
- **PV d'un yōkai** = `PV(v) × PV du yōkai / 100` : la stat PV (objet, traits, rareté) fait office de résistance. Un yōkai légendaire est donc plus coriace.
- **Âmes d'un yōkai** = `âmes(v) × multiplicateur de rareté × (1 + bonus de clochette du yōkai) × (1 + 5 % × Clochette sacrée)` : un yōkai coriace rapporte plus.
- La **défense** ne sert pas au combat en V1 (aucun ennemi ne frappe le héros).
- **Brûlures** (Feu de renard, onibi, Kitsune-bi) : dégâts continus en % des PV max par seconde, plafonnés à 9 fois les dégâts par seconde espérés des frappes (critiques moyennés, touchers exclus). Une brûlure peut achever l'ennemi. Sans plafond, une brûlure en % des PV tue tout yōkai en un temps fixe et la progression devient indépendante de la puissance (mesuré : vague 512 000 en 2 jours). Plafonnée par les frappes, elle fait descendre la barre de vie à vitesse constante. L'ancien plancher (arrêt à 10 % des PV) vidait 90 % de la barre d'un gros sac à PV en quelques secondes, puis la laissait ramper.
- Les dégâts en trop sur un yōkai vaincu sont perdus ; le yōkai suivant arrive aussitôt.
- Un pas de simulation couvre l'intervalle semi-ouvert [début, fin[ : découper une durée en plusieurs pas donne les mêmes frappes, dans le même ordre, et le même état (à 1e-9 près sur les dégâts quand une brûlure est active).


### 5.2 Équilibrage : cibles et mesures

Mesuré par `npx tsx scripts/simulate.ts` (bot simple et déterministe : il achète toujours le moins cher, aligne ses trois shikigami les plus forts, garde ses talismans d'attaque pour les Gardiens, affronte chaque Gardien et lance un Festival quand il bloque et que le bonus progresse d'au moins 15 %). Trois profils sur 30 jours ; courbes et jalons dans [`docs/balancing/`](balancing/README.md).

| Cible (joueur régulier : 3 sessions de 5 min par jour) | Visé | Mesuré |
|---|---|---|
| Premier Gardien (vague 100) | jour 1 | jour 0,5 (10 min de jeu actif) |
| Premier Festival | jours 1 à 3 | jour 1,2 |
| Gardien 5 (vague 500) | jours 4 à 10 | jour 5,2 |
| Record de 800 | jours 15 à 25 | jour 15,5 |
| Gardien 10 (vague 1000) | au-delà du jour 30 (objectif de long terme) | non atteint à J30 (record 900) |
| Éveil 2 (Nurarihyon vaincu) | ni trivial ni infranchissable | profil persévérant (Festival dès +5 % de bonus), sur 200 jours : record 1000 au jour 52,5, Nurarihyon vaincu au jour 102, Bake-danuki éveillé (vague 1100) atteint vers le jour 130 puis nouveau mur. Avec la règle à +15 %, le bot cesse ses Festivals devant Nurarihyon et y reste (120 jours) |

| Cible (autres profils) | Visé | Mesuré |
|---|---|---|
| Joueur actif (2 h par jour) : premier Gardien | ≤ 45 min de jeu | 30 min |
| Joueur actif : Gardien 5 | ≤ 3 jours | jour 1 |
| Joueur hors ligne (3 passages d'1 min) : meilleur record à J30 | ≥ 80 % du joueur régulier | 853 / 900 = 95 % |
| Temps de calcul | 30 jours de simulation en environ 30 s | 4 profils : 31 s |

Mesures avec le générateur V2 (défilés neufs). Sensibilité : d'un défilé à l'autre (graine), le premier Gardien du joueur régulier tombe ou non au jour 1 selon la chance des premiers yōkai et des captures ; sur 12 défilés, il tombe au jour 1 dans 10 cas avec la Lame à 5 âmes (contre 4 avec l'ancien coût de 10). Le harnais mesure une graine fixe (2026) : une cible « au jour près » est donc indicative.

L'Éveil 2 ne demande pas de multiplicateur de résistance : la courbe `1,13^(v−1)` des PV continue au-delà de la vague 1000 et le Gardien éveillé a ses PV doublés ; ce qui borne la fin de partie, c'est le rendement du Festival (bonus linéaire en étincelles, étincelles plafonnées par le record). Mesure : `runProfile` du profil `perseverant` sur 200 jours (ce que fait `npx tsx scripts/simulate.ts 200` pour chaque profil).

Limites connues : le bot ne fait pas de choix fins (il ne garde pas Kekkai pour un Gardien, ne tape pas pendant le hors ligne, ne choisit pas l'équipe selon les bonus). La progression de long terme est bornée par le Festival : les trois profils convergent vers les mêmes records, le temps actif accélère surtout le début. À valider en jeu par Yann.
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

Langue anglaise, nouvelles planches de Gardiens, événements saisonniers. À décider après la V1. L'« arbre de talents du Festival » envisagé ici est devenu le Kamidana (§ 4.7).
