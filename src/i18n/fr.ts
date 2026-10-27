export const fr = {
  home: {
    title: 'Hyakki',
    kanji: '百鬼夜行',
    subtitle: 'Le défilé des cent démons approche…',
    nativeCheckLink: 'Vérification native',
  },
  nativeCheck: {
    title: 'Vérification native',
    description: 'Cercle Skia animé par Reanimated, compteur enregistré dans MMKV.',
    counter: (count: number) => `Compteur MMKV : ${count}`,
    increment: 'Ajouter 1',
  },
} as const;
