# Pipeline art

Le jeu est **hybride** :

| Quoi | Comment | Où |
|---|---|---|
| Héros (l'onmyōji), 10 poses | Illustrations ChatGPT, détourées | `assets/images/hero/` |
| Gardiens (boss), 10 en V1 | Illustrations ChatGPT, détourées | `assets/images/bosses/` |
| Yōkai ordinaires | Générés en code (Skia) | `src/engine/yokai/`, `src/render/yokai/` |
| Décors (fonds de combat, en-tête du Festival) | Illustrations ChatGPT | `assets/images/backdrops/` |
| Icône de la monnaie ofuda | Illustration ChatGPT, détourée | `assets/images/icons/` |
| Interface, effets, cut-in | Dessinés en code (Skia, composants) | `src/render/`, `src/ui/` |

## 1. Règles de cohérence

- Toutes les générations se font **dans la même conversation ChatGPT**, avec la planche de référence (`design/sources/planche-bestiaire.png`) en contexte.
- Style imposé à chaque prompt : chibi cartoon-animé, ~2,5 têtes, contour épais uniforme `#2B1D3F`, cel-shading à une seule ombre, lumière en haut à gauche, palette saturée.
- Fond uni crème `#FFF4DC` (ou transparent), aucun texte, aucune ombre au sol, figures séparées dans une grille.
- Orientation : le héros regarde **à droite**, les Gardiens regardent **à gauche** (ils se font face en combat). Un retournement horizontal en code reste possible.
- Contenu tout public : pas de sang, pas de tabac, pas d'alcool.

## 2. Planches existantes

| Fichier | Contenu |
|---|---|
| `design/sources/planche-bestiaire.png` | Planche de référence de style (héros en 3 poses + yōkai d'essai + premier Nurarihyon) |
| `design/sources/planche-heros.png` | 10 poses du héros |
| `design/sources/planche-boss.png` | 10 Gardiens (le n° 10 y est remplacé par la version 3 ci-dessous) |
| `design/sources/nurarihyon-v3.png` | Nurarihyon, version 3, générée seule |
| `design/sources/hd/` | Les 19 autres figures, générées seules en haute définition (§ 5) |
| `design/sources/icons/ofuda.png` | Icône de la monnaie ofuda (1254 × 1254, fond crème), générée seule dans la conversation de référence (#103) |

Ordre des poses du héros : 01 attente, 02 attaque, 03 sort de feu, 04 sort de foudre, 05 barrière, 06 touché, 07 K.-O., 08 victoire, 09 sommeil, 10 surpris.

Chaque pose garde sa propre taille (de 636 × 1301 à 1366 × 969 px, pose d'attente en 707 × 1310), toutes à la même échelle et les pieds à 5–7 px du bord bas. Le code connaît ces tailles (`HERO_POSES` dans `src/features/shared/images.ts`, vérifiées par un test contre les en-têtes PNG) et dessine chaque pose à l'échelle de la pose d'attente, ancrée par le bas : les pieds ne bougent pas d'une pose à l'autre. Une figure régénérée doit être remise à l'échelle commune (`scripts/scale_poses.py`), garder cette marge sous les pieds (`scripts/check_figures.py` le vérifie) et mettre à jour sa taille dans `HERO_POSES`.

Ordre des Gardiens : 01 Bake-danuki, 02 Kappa, 03 Karasu-tengu, 04 Tsuchigumo, 05 Yuki-onna, 06 Gashadokuro, 07 Nue, 08 Ibaraki-dōji, 09 Kyūbi no kitsune, 10 Nurarihyon.

### Nurarihyon : version 3

Les deux premières versions avaient une tête en long obus lisse et beige, qui pouvait prêter à une lecture involontaire. La version 3 le coiffe d'un haut chapeau de cour noir laqué, orné d'or et de rubans violets, qui cache entièrement le crâne tout en gardant sa silhouette haute. C'est la seule version à utiliser : `assets/images/bosses/boss-10-nurarihyon.png`.

## 3. Découper une planche

```bash
python3 scripts/cut_sheet.py design/sources/planche-heros.png assets/images/hero \
  --names hero-01-idle,hero-02-attaque,hero-03-feu,hero-04-foudre,hero-05-barriere,hero-06-touche,hero-07-ko,hero-08-victoire,hero-09-sommeil,hero-10-surpris \
  --dilate 3
```

Le script détecte les figures, rattache les petits éléments (flammes, gouttes, bulles, flocons) à la figure la plus proche, rend le fond transparent et adoucit les bords. Détails dans [`scripts/README.md`](../scripts/README.md).

Le découpage laisse un liseré crème anticrénelé autour du trait encré, visible sur fond coloré : le retirer avec `scripts/defringe.py`, puis vérifier avec `scripts/check_figures.py` (hauteur, frange, ligne des pieds des poses du héros).

```bash
python3 scripts/defringe.py assets/images/hero/*.png assets/images/bosses/*.png
python3 scripts/check_figures.py assets/images/hero assets/images/bosses --min-height 900
```

Toujours vérifier le résultat sur un fond coloré avant de committer.

## 4. Nommage

- Minuscules, ASCII, tirets : `hero-07-ko.png`, `boss-08-ibaraki-doji.png`.
- Le numéro donne l'ordre d'apparition (poses) ou de rencontre (Gardiens).
- Une nouvelle version d'une figure **remplace** le fichier (même nom) ; l'ancienne reste dans l'historique Git.

## 5. Haute définition

Les figures découpées depuis les planches faisaient ~300 × 450 px, un peu juste sur tablette. Depuis le 29/10/2026, chacune est régénérée seule en grand (planche jointe, fond crème uni, format adapté à la silhouette), puis découpée, défrangée, vérifiée et remplacée : toutes font au moins 900 px de haut. Une pose du héros dessinée seule arrive à sa propre échelle : `scripts/scale_poses.py` la ramène à l'échelle commune des poses. Prompt, procédure pas à pas et liste des figures : [`art/hd-regeneration.md`](art/hd-regeneration.md).

## 6. Icône et écran de lancement

L'icône « Oni caché » est dessinée en code : un petit oni rouge se cache derrière le kanji 百 (*hyaku*, la centaine du Hyakki Yagyō) et s'y agrippe, sur les rayons du ciel du festival. Le kanji est un autocollant : ombre franche, contour encré, bordure blanche, remplissage jaune. La maquette retenue vient d'un canevas Claude Design (variante 3 des « Yōkai cachés »).

Les compositions vivent dans `src/render/icon/appIcon.ts` : des calques posés dans une boîte de 512 × 512 (celle des maquettes), ramenés au cadre 200 × 200 des rendus, couleurs des tokens uniquement. Le 百 n'est pas un tracé : c'est un glyphe de la police d'affichage (Mochiy Pop One), que `scripts/icons/composition.ts` dessine entre l'oni et ses mains. `scripts/render-icons.ts` rend le tout en PNG avec CanvasKit (le moteur de Skia, en Node) :

| Fichier (`assets/images/app/`) | Contenu |
|---|---|
| `icon.png` | Icône iOS et stores, 1024 × 1024, opaque (Expo retire le canal alpha à la génération iOS) |
| `android-icon-background.png` | Fond de l'icône adaptative : ciel et rayons |
| `android-icon-foreground.png` | L'oni et son kanji, dans la zone sûre de 66 dp sur 108 dp |
| `android-icon-monochrome.png` | Silhouette blanche pour les icônes à thème (Android 13+) : les contours encrés deviennent des jours. Le kanji y perd sa bordure blanche, sinon elle se confondrait avec le jaune et effacerait ses traits |
| `splash-icon.png` | L'oni et son kanji sur transparence ; l'écran de lancement est crème (`imageWidth` 160 dans `app.config.ts`) |

```bash
npx tsx scripts/render-icons.ts /chemin/apercus   # le dossier d'aperçus (48, 96 et 180 px) est facultatif
```

L'icône 512 × 512 de Google Play sort du même code : `npx tsx scripts/render-store-graphics.ts` (voir [`store/fiche.md`](store/fiche.md)). Toute nouvelle icône demande un nouveau build pour arriver sur les appareils.

## 7. Décors

Le fond des combats et l'en-tête du Festival sont des illustrations ChatGPT (#76) : un fond commun pour les vagues ordinaires, **un fond exclusif par Gardien** (éveillé compris) et un en-tête pour le Festival, où le héros est superposé en code.

| Où | Quoi |
|---|---|
| `design/sources/decors/` | Sources : 11 fonds de combat carrés (1254 × 1254) et l'en-tête du Festival (1536 × 1024) |
| `assets/images/backdrops/` | Versions de l'app en WebP (2,2 Mo en tout) : fonds à la taille source, au plus 3 × leur taille d'affichage (≈ 420 pt) ; en-tête ramené à 1200 × 800 |
| `src/features/shared/images.ts` | `BATTLE_BACKDROPS` et `FESTIVAL_HEADER`, avec leurs tailles (vérifiées par un test contre les en-têtes WebP) |

```bash
cwebp -m 6 -q 80 -metadata none design/sources/decors/combat-01-bake-danuki.png -o assets/images/backdrops/combat-01-bake-danuki.webp
cwebp -m 6 -q 80 -metadata none -resize 1200 800 design/sources/decors/festival-header.png -o assets/images/backdrops/festival-header.webp
```

**En combat** (`src/features/combat/BattleBackdrop.tsx`), le fond couvre le cadre 366 × 400 de la scène (`frameCover` dans `src/render/scene/layout.ts`), comme les combattants : le sol de l'illustration reste sous leurs pieds (y ≈ 302 sur 400) quelle que soit la taille de l'écran, les bords gauche et droit sont rognés. Le fond commun est toujours dessiné ; celui du Gardien du palier est chargé dès le début de la centaine, masqué au-dessus, et s'affiche pendant son cut-in et son combat : pas d'écran vide au changement. Après une victoire, une fuite ou un échec, le fond commun revient. L'ombre du héros au sol est dessinée par-dessus, comme dans l'ancien décor en code.

**Au Festival** (`src/features/festival/FestivalScreen.tsx`), l'en-tête garde le cadre 366 × 220 de la maquette, rempli en « cover » ; le héros (pose victoire) se tient en bas à gauche.

### Contraintes de composition

- Fonds de combat : carrés, sol plat sur le tiers bas, un emplacement dégagé à gauche (héros) et à droite (ennemi), coin haut droit calme (carte de l'ennemi), rien d'important à moins de 8 % des bords gauche et droit.
- En-tête du Festival : 3:2, recadré vers 5:3 ; bas gauche dégagé pour le héros.
- Décor seul : aucun personnage, yōkai, animal, texte, kanji ni cadre ; fonds un peu plus doux que les personnages pour qu'ils restent lisibles.

### Prompts

Dans la conversation ChatGPT de référence, planche `design/sources/planche-bestiaire.png` jointe, un message d'amorce puis **une image par message**. Régénérer une image qui contient un personnage, un animal, du texte ou des kanji, ou dont les zones du héros et de l'ennemi ne sont pas dégagées.

Amorce :

```text
I will ask you for 12 background illustrations for my mobile game, one per message. Use the attached model sheet as the exact style reference for all of them:
- same chibi cartoon-anime universe, thick uniform dark ink outline (#2B1D3F), flat cel shading with a single shadow tone, light from the top left, saturated palette;
- backgrounds are slightly softer and less contrasted than the characters of the sheet, so that the characters drawn on top of them later stay readable;
- scenery only: no characters, no yōkai, no people, no animals, no text, no kanji, no signature, no frame, no UI;
- family-friendly: no blood, no bones, no alcohol, no tobacco.
Just answer "ready" to this message.
```

Chaque fond de combat reprend ce bloc, suivi de sa ligne `Scene:` :

```text
Same style and rules as before. Square 1:1 battle background for a mobile game screen. A flat walkable ground (path or clearing) fills the bottom 30% of the image. Keep two empty standing spots on that ground, one in the left third (the hero) and one in the right third (the enemy), with nothing tall in front of them. Keep the top-right corner calm (a health panel covers it). Nothing important within 8% of the left and right edges (they may be cropped). Landmarks go in the middle distance, behind and between the standing spots.
Scene: <scène du tableau ci-dessous>
```

| Fichier | Pour | Scène |
|---|---|---|
| `combat-00-parade.png` | fond commun (vagues ordinaires) | ōmagatoki, the dusk hour when yōkai come out. A country road in old Japan leads toward a red torii gate and a small shrine on a hill; paper lanterns on wooden poles line the road; rolling hills, a distant pagoda, a few blossoming trees. Warm orange-pink sunset sky turning purple at the top, small puffy clouds. |
| `combat-01-bake-danuki.png` | Bake-danuki | a mountain temple garden in autumn under a huge golden full moon, where tanuki are said to drum on their bellies at night. Red and orange maple trees, maple leaves swirling in the air like a transformation spell, a small temple hall with a thatched roof, a stone lantern, a few round ceramic tanuki statues (no bottles). Deep blue night sky. |
| `combat-02-kappa.png` | Kappa | a riverbank in early summer. A pebble shore as the ground, a clear green river with a small waterfall behind it, big lily pads and lotus flowers, tall reeds, a curved wooden bridge in the distance, a little cucumber patch on the far bank, light mist over the water. Soft late-afternoon light. |
| `combat-03-karasu-tengu.png` | Karasu-tengu | the summit of a sacred mountain where crow tengu train. Giant ancient cedar trees, a huge rock bound with a thick shimenawa rope and white zigzag paper streamers, a small cliffside shrine, a sea of clouds below, black feathers drifting in a swirling wind. Windy twilight sky with streaks of orange. |
| `combat-04-tsuchigumo.png` | Tsuchigumo | the mouth of a deep cave on a rocky mountainside at night. Huge silky spider webs stretched between twisted dead trees and rocks, glowing pale-purple mushrooms, fallen stones, faint mist creeping out of the cave. Eerie but cute, not scary. Dark purple sky with a thin crescent moon. |
| `combat-05-yuki-onna.png` | Yuki-onna | a snowy mountain pass on a winter night. Snow-covered ground, snow-laden pine trees, a frozen lake with icy blue reflections, icicles hanging from rocks, gentle falling snow, a tiny mountain hut with a warm lit window far in the distance. Pale blue moonlit sky. |
| `combat-06-gashadokuro.png` | Gashadokuro | a haunted field of silver pampas grass at midnight under a huge pale moon. Old moss-covered stone lanterns, a ruined wooden gate, small purple will-o'-the-wisps floating in the air, low creeping fog. Spooky but family-friendly: no bones, no skulls, no graves. |
| `combat-07-nue.png` | Nue | the courtyard of the old imperial palace of Heian-kyō at night, white gravel ground, vermilion pillars and curved roofs. A swirling black thundercloud hovers above the roofs with an eerie green glow inside it, small sparks of lightning, wind-blown leaves. Dark teal and purple sky. |
| `combat-08-ibaraki-doji.png` | Ibaraki-dōji | the great ruined Rashōmon gate of old Kyoto at night in the rain. A huge two-storey wooden gate with broken roof tiles and weeds growing on it, stone-paved ground with puddles reflecting the light of a few lanterns, heavy stormy sky. |
| `combat-09-kyubi.png` | Kyūbi no kitsune | an open stone plaza at the foot of a mountain at night; behind it, a path of countless vermilion torii gates climbs into the distance. Stone fox statues wearing red bibs on both sides, floating blue-white foxfires, golden ginkgo leaves on the ground. Deep indigo sky with golden glows. |
| `combat-10-nurarihyon.png` | Nurarihyon | the courtyard of a grand old feudal mansion at night, home of the lord of all yōkai. A wide wooden veranda with glowing shoji screens, a tall gate with a purple curtain, hundreds of floating paper lanterns rising into the sky in a long winding line like a night parade, a huge full moon. Majestic final-boss atmosphere, deep purple and gold palette. |

En-tête du Festival (`festival-header.png`) :

```text
Same style and rules as before. Wide 3:2 landscape header image for the Festival screen of a mobile game. It will be cropped to about 5:3: keep everything important away from the top and bottom edges.
Scene: a Japanese summer night festival. A wooden yagura tower with a big taiko drum in the center-right, strings of red and white paper lanterns crossing the image, food stalls with colorful noren curtains, big colorful fireworks blooming in a purple-to-blue night sky. No people.
Keep the bottom-left third of the image an empty open festival ground with nothing tall: a character will be added there later.
```

## 8. Icônes de monnaie

L'ofuda, monnaie des Gardiens dépensée au Kamidana, a une icône illustrée (#103, #104) ; les âmes gardent leur icône vectorielle (`SOULS_ICON`).

| Où | Quoi |
|---|---|
| `design/sources/icons/ofuda.png` | Source : 1254 × 1254, fond crème |
| `assets/images/icons/ofuda.png` | Version de l'app : détourée, défrangée, centrée dans un carré transparent de 144 px (3 × sa plus grande taille d'affichage, 48 pt) |
| `src/features/shared/OfudaIcon.tsx` | Composant décoratif (`OFUDA_IMAGE`, taille vérifiée par un test) : 20 pt dans l'en-tête de combat, 40 pt au Kamidana |

```bash
python3 scripts/cut_sheet.py design/sources/icons/ofuda.png /tmp/ofuda --names ofuda --dilate 3
python3 scripts/defringe.py /tmp/ofuda/ofuda.png
```

Puis centrer la figure dans un carré transparent et la ramener à 144 px (Pillow, `LANCZOS`). Vérifier à 20 pt sur fond crème, blanc et sombre.

Prompt, envoyé dans la conversation de référence après les décors :

```text
New request, different from the backgrounds: a currency icon for the game interface, in the exact style of the model sheet from the beginning of this conversation (chibi cartoon-anime, thick uniform dark ink outline #2B1D3F, flat cel shading with a single shadow tone, light from the top left, saturated palette).
Square 1:1 image. One single ofuda (Japanese paper talisman), centered, slightly tilted about 10 degrees to the right, filling about 80% of the height, with an even empty margin all around.
The ofuda: a tall rectangular strip of thick cream-white paper with slightly rounded corners, a bold vermilion-red vertical band down the middle, a small round red seal near the bottom, a thin gold trim along the top edge, and two or three bold abstract dark brush swirls on the red band (decorative strokes only, not readable characters).
It will be displayed very small (20 to 48 pixels): bold simple shapes, strong readable silhouette, no fine details, no thin lines.
Plain flat cream background (#FFF4DC). No text, no letters, no kanji, no ground shadow, no glow, no sparkles, no frame, no other object.
```

