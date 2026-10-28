# Design

Tout ce qui sert de référence visuelle au développement.

| Élément | Où | Rôle |
|---|---|---|
| Maquettes | [Canvas Claude Design « Hyakki »](https://claude.ai/artifact/PSd1a15RrLsUubfoHFdG86) (privé) et sources dans [`mockups/`](mockups/) | Les 7 écrans de référence |
| Prototype du générateur | [`prototypes/fabrique-a-yokai.html`](prototypes/fabrique-a-yokai.html) — aussi publié en [« Fabrique à yōkai »](https://claude.ai/artifact/2JqChM6ZVbQuaRhbEhMrh5) (privé) | Référence de comportement pour `src/engine/yokai` et `src/render/yokai` |
| Tokens | [`tokens.json`](tokens.json) | Source des tokens du design system (couleurs, typo, rayons, ombres) |
| Planches sources | [`sources/`](sources/) | Planches ChatGPT d'origine (style, héros, Gardiens) et décors (`sources/decors/`) |

Les figures détourées prêtes pour l'app sont dans [`../assets/images/`](../assets/images/).

## Maquettes

Chaque fichier de [`mockups/`](mockups/) est un écran au format Claude Design (`.dc.html` : HTML + styles en ligne + un petit bloc de logique). Ils servent de **référence de mise en page et de valeurs** (tailles, espacements, couleurs) : ils ne se copient pas tels quels dans l'app.

| Fichier | Écran |
|---|---|
| `Retour.dc.html` | 01 · Retour hors ligne |
| `Main.dc.html` | 02 · Combat |
| `Boss.dc.html` | 03 · Cut-in de Gardien |
| `Shikigami.dc.html` | 04 · Shikigami |
| `Sanctuaire.dc.html` | 05 · Sanctuaire |
| `Aube.dc.html` | 06 · Festival (prestige) |
| `Gardiens.dc.html` | 07 · Galerie des Gardiens |

Les images y sont référencées par des URL `/_blob/…` propres au canvas. Correspondance avec les fichiers du repo :

| URL dans la maquette | Fichier |
|---|---|
| `/_blob/7ca14f2d97e21ea3bfa9bfc2967160f0` | `assets/images/hero/hero-02-attaque.png` |
| `/_blob/794617e9e0ebca938ed8a138b8777e89` | `assets/images/hero/hero-09-sommeil.png` |
| `/_blob/128fa38ae7cb180c9e300ceca00f02ab` | `assets/images/hero/hero-01-idle.png` |
| `/_blob/d95006342a06d178a419da5e71751be6` | `assets/images/hero/hero-08-victoire.png` |
| `/_blob/8ceb0e4b1bc94ae2383df4b9547fe365` | `assets/images/bosses/boss-01-bake-danuki.png` |
| Autres `/_blob/…` de `Gardiens.dc.html` | Les Gardiens 02 à 10, dans l'ordre |

## Règles

- Une modification de la DA passe d'abord par les tokens et [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md), puis par le code.
- Les planches sources ne sont jamais retouchées : on régénère, on découpe, on remplace dans `assets/images/`.
