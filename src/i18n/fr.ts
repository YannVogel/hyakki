export const fr = {
  home: {
    title: 'Hyakki',
    kanji: '百鬼夜行',
    subtitle: 'Le défilé des cent démons approche…',
    nativeCheckLink: 'Vérification native',
    yokaiLabLink: 'Fabrique à yōkai',
  },
  nativeCheck: {
    title: 'Vérification native',
    description: 'Cercle Skia animé par Reanimated, compteur enregistré dans MMKV.',
    counter: (count: number) => `Compteur MMKV : ${count}`,
    increment: 'Ajouter 1',
  },
  yokaiLab: {
    title: 'Fabrique à yōkai',
    seedLabel: 'Graine',
    sheetTitle: (from: number, to: number) => `Graines ${from} à ${to}`,
    tileLabel: (name: string, rarity: string) => `${name}, ${rarity}`,
    yokaiLabel: (name: string, description: string) => `${name}, ${description}`,
  },
} as const;
