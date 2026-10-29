# Assets

| Dossier | Contenu |
|---|---|
| `images/hero/` | Les 10 poses de l'onmyōji, PNG transparents découpés depuis `design/sources/planche-heros.png` |
| `images/bosses/` | Les 10 Gardiens, PNG transparents découpés depuis `design/sources/planche-boss.png` |
| `images/backdrops/` | Les 11 fonds de combat (commun, puis un par Gardien) et l'en-tête du Festival, WebP compressés depuis `design/sources/decors/` (voir [`docs/ART_PIPELINE.md`](../docs/ART_PIPELINE.md) § 7) |
| `images/app/` | Icône et écran de lancement, rendus par `scripts/render-icons.ts` (voir [`docs/ART_PIPELINE.md`](../docs/ART_PIPELINE.md) § 6) |
| `fonts/` | Mochiy Pop One et M PLUS Rounded 1c (500, 700, 800), licence SIL OFL 1.1 (`OFL-*.txt`), issues de [google/fonts](https://github.com/google/fonts) |
| `audio/sfx/` | Les 15 bruitages, WAV mono 16 bits à 44,1 kHz, issus des packs audio de [Kenney](https://kenney.nl) (voir ci-dessous) |
| `audio/music/` | Les deux musiques, AAC 128 kbit/s : « Le défilé en fête » et « Le Gardien approche » (voir ci-dessous) |

Les yōkai ordinaires n'ont **pas** d'image : ils sont générés en code (voir [`docs/PROCEDURAL_YOKAI.md`](../docs/PROCEDURAL_YOKAI.md)).

Production, découpe et nommage : [`docs/ART_PIPELINE.md`](../docs/ART_PIPELINE.md).

## Bruitages

Choisis à l'oreille par Yann le 28/10/2026, branchés dans le jeu par #89 (`src/services/audio.ts`).

| Fichier | Événement | Source Kenney |
|---|---|---|
| `tap-1.wav` … `tap-5.wav` | Tap sur un yōkai (variantes en rotation) | Impact Sounds, `impactSoft_medium_000` … `_004` |
| `crit.wav` | Coup critique | Impact Sounds, `impactPunch_medium_000` |
| `purify.wav` | Yōkai purifié | Interface Sounds, `maximize_001` |
| `capture.wav` | Shikigami capturé | Music Jingles, `jingles_STEEL09` |
| `guardian-appeared.wav` | Apparition d'un Gardien | Impact Sounds, `impactBell_heavy_000` |
| `guardian-defeated.wav` | Gardien vaincu | Music Jingles, `jingles_HIT15` |
| `guardian-failed.wav` | Gardien raté ou fui | Interface Sounds, `error_003` |
| `talisman-cast.wav` | Talisman lancé | Interface Sounds, `maximize_006` |
| `purchase.wav` | Achat au Sanctuaire | Interface Sounds, `confirmation_001` |
| `festival.wav` | Festival | Music Jingles, `jingles_STEEL02` |
| `ui.wav` | Bouton, onglet, sélection | Interface Sounds, `select_001` |

Licence [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) : domaine public, aucun crédit obligatoire. Les originaux sont en Ogg Vorbis, qu'iOS ne lit pas ; ils sont convertis avec l'outil fourni par macOS :

```bash
afconvert -f WAVE -d LEI16 -c 1 impactSoft_medium_000.ogg tap-1.wav
```

WAV plutôt qu'AAC : pas de délai d'encodeur au début du son, ce qui compte pour le tap.

## Musiques

| Fichier | Quand | Durée |
|---|---|---|
| `defile-en-fete.m4a` | « Le défilé en fête » : en boucle pendant toute la partie | 1 min 35 |
| `gardien-approche.m4a` | « Le Gardien approche » : du cut-in d'un Gardien à la fin de son combat, puis le défilé reprend sa musique là où elle s'était arrêtée | 1 min 06 |

Générées par Yann sur [Suno](https://suno.com) avec l'offre Pro, qui donne les droits commerciaux sur les morceaux créés pendant l'abonnement. Instrumentales, style « Japanese folk game music » (shamisen, koto, shakuhachi, taiko) ; « Le Gardien approche » en est la variante de combat de boss, 150 BPM. Faute de quota de téléchargement, les deux ont été enregistrées avec OBS : le silence ajouté au début (1,8 s et 1,6 s) et à la fin a été coupé à l'échantillon près avant l'encodage, pour que la boucle ne marque pas de blanc.

```bash
afconvert -f WAVE -d LEI16 musique.m4a musique.wav     # décodage, puis coupe des silences
afconvert -f m4af -d aac -b 128000 musique-propre.wav defile-en-fete.m4a
```
