# Équilibrage

Courbes de référence produites par le harnais de simulation (`scripts/simulate.ts`). Elles montrent comment progressent trois profils de joueurs avec les constantes de [`src/engine/balance.ts`](../../src/engine/balance.ts). Cibles et lecture des résultats : [`GAME_DESIGN.md`](../GAME_DESIGN.md) § 5.2.

```bash
npx tsx scripts/simulate.ts      # 30 jours (par défaut)
npx tsx scripts/simulate.ts 60   # 60 jours
```

| Fichier | Contenu |
|---|---|
| `resume.md` | Jalons clés par profil (généré) |
| `jalons.csv` | Chaque jalon atteint : premier Gardien vaincu, Festivals, niveaux d'Éveil, records, Kamidana (`kamidana-1` : premier ofuda déposé, `kamidana-tous` : toutes les bénédictions au niveau 1, `kamidana-max` : toutes au maximum), en temps réel (heures) et en temps de jeu actif (minutes) |
| `actif.csv`, `trois-sessions.csv`, `hors-ligne.csv`, `perseverant.csv` | Un relevé par session : vague, record du défilé et meilleur record, log10 des âmes, étincelles, ofuda, shikigami, Gardiens vaincus |

Le profil `perseverant` joue comme le joueur régulier mais relance le Festival dès que le bonus progresse de 5 % (les autres attendent +15 %) : il est moins rapide au début, mais c'est le seul qui franchit Nurarihyon et atteint l'Éveil 2 (jalon `eveil-2`, voir [`GAME_DESIGN.md`](../GAME_DESIGN.md) § 5.2).

Les profils sont décrits dans `scripts/balancing/profiles.ts`, la stratégie du bot dans `scripts/balancing/bot.ts` (au Kamidana, il dépose toujours ses ofuda sur la bénédiction la moins chère et ne rembourse jamais). La simulation est déterministe : relancer le script sans changer les constantes redonne exactement les mêmes fichiers.

Toute modification de `balance.ts` s'accompagne d'une nouvelle génération de ces fichiers, et d'une mise à jour du tableau de `GAME_DESIGN.md` § 5.2 si un jalon bouge.
