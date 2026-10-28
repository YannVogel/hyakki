# Scripts

| Script | Rôle |
|---|---|
| [`cut_sheet.py`](cut_sheet.py) | Découpe une planche ChatGPT (fond uni) en figures PNG transparentes |
| [`defringe.py`](defringe.py) | Retire le liseré crème laissé autour des figures découpées (réécrit les PNG) |
| [`check_figures.py`](check_figures.py) | Vérifie les figures : hauteur minimale, absence de frange crème, ligne des pieds des poses du héros |
| [`bench-bignum.ts`](bench-bignum.ts) | Spike de performance de `BigNum` (1 million de multiplications) |
| [`simulate.ts`](simulate.ts) | Harnais d'équilibrage : 3 profils de joueurs sur N jours, courbes dans `docs/balancing/` (logique dans `balancing/`) |
| [`render-icons.ts`](render-icons.ts) | Rend l'icône et l'écran de lancement en PNG (CanvasKit, en Node) |
| [`render-store-graphics.ts`](render-store-graphics.ts) | Icône 512 px et image de présentation 1024 × 500 de Google Play, dans `store-captures/google-play/` |
| [`store-captures.sh`](store-captures.sh) | Captures des fiches stores sur simulateur iOS et émulateur Android (parcours Maestro `e2e/store/captures.yaml`), dans `store-captures/` |

Les scripts TypeScript se lancent avec `npx tsx scripts/<script>.ts` : ils importent le moteur directement.

## `cut_sheet.py`

Dépendances : Python 3, Pillow, numpy, scipy (`pip install pillow numpy scipy`). `defringe.py` et `check_figures.py` n'utilisent que Pillow et numpy.

```bash
# Poses du héros
python3 scripts/cut_sheet.py design/sources/planche-heros.png assets/images/hero \
  --names hero-01-idle,hero-02-attaque,hero-03-feu,hero-04-foudre,hero-05-barriere,hero-06-touche,hero-07-ko,hero-08-victoire,hero-09-sommeil,hero-10-surpris \
  --dilate 3

# Gardiens (figures plus serrées : dilatation plus faible)
python3 scripts/cut_sheet.py design/sources/planche-boss.png assets/images/bosses \
  --names boss-01-bake-danuki,boss-02-kappa,boss-03-karasu-tengu,boss-04-tsuchigumo,boss-05-yuki-onna,boss-06-gashadokuro,boss-07-nue,boss-08-ibaraki-doji,boss-09-kyubi,boss-10-nurarihyon \
  --dilate 1
```

Les noms se lisent **ligne par ligne, de gauche à droite**.

Si le script trouve moins de figures que de noms :
- des figures se touchent → baisser `--dilate` (1 ou 0) ;
- une figure est coupée en morceaux → augmenter `--dilate`.

Toujours contrôler le résultat sur un fond coloré avant de committer.

