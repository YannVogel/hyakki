import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { generate, nameOf, type YokaiSpec } from '@/engine';
import { describeYokai, RARITY_NAMES, strings } from '@/i18n';
import { YokaiCanvas } from '@/render';
import { fontFamily } from '@/ui/fonts';

// Temporary design values until the design system tokens exist (#29).
import tokens from '../../../design/tokens.json';

const SHEET_SIZE = 12;
const STAGE_SIZE = 220;
const TILE_SIZE = 96;
const MAX_SEED = 999_999_999;

function parseSeed(text: string): number | null {
  const seed = Number(text);
  return Number.isInteger(seed) && seed >= 0 && seed <= MAX_SEED ? seed : null;
}

function YokaiTile({ spec, onSelect }: { spec: YokaiSpec; onSelect: (seed: number) => void }) {
  const name = nameOf(spec);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.yokaiLab.tileLabel(name, RARITY_NAMES[spec.rarity])}
      onPress={() => onSelect(spec.seed)}
      style={styles.tile}
      testID={`yokai-tile-${spec.seed}`}
    >
      <YokaiCanvas spec={spec} size={TILE_SIZE} accessibilityLabel={name} />
      <Text style={styles.tileName} numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
}

/** Development screen: browse generated yōkai by seed (#26). */
export function YokaiLabScreen() {
  const [seed, setSeed] = useState(2026);
  const [input, setInput] = useState(String(seed));
  const spec = useMemo(() => generate(seed), [seed]);
  const sheet = useMemo(
    () => Array.from({ length: SHEET_SIZE }, (_, index) => generate(seed + 1 + index)),
    [seed],
  );
  const select = (next: number) => {
    setSeed(next);
    setInput(String(next));
  };
  const name = nameOf(spec);
  const description = describeYokai(spec);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{strings.yokaiLab.title}</Text>
      <TextInput
        accessibilityLabel={strings.yokaiLab.seedLabel}
        keyboardType="number-pad"
        value={input}
        onChangeText={(text) => {
          setInput(text);
          const parsed = parseSeed(text);
          if (parsed !== null) {
            setSeed(parsed);
          }
        }}
        style={styles.input}
        testID="yokai-lab-seed"
      />
      <YokaiCanvas
        spec={spec}
        size={STAGE_SIZE}
        accessibilityLabel={strings.yokaiLab.yokaiLabel(name, description)}
        testID="yokai-lab-stage"
      />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.body}>{description}</Text>
      <Text style={styles.body}>{RARITY_NAMES[spec.rarity]}</Text>
      <Text style={styles.body}>{strings.yokaiLab.sheetTitle(seed + 1, seed + SHEET_SIZE)}</Text>
      <View style={styles.grid}>
        {sheet.map((tile) => (
          <YokaiTile key={tile.seed} spec={tile} onSelect={select} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingTop: 64,
    backgroundColor: tokens.color.cream.$value,
  },
  title: { fontFamily: fontFamily.display, fontSize: 22, color: tokens.color.ink.$value },
  name: { fontFamily: fontFamily.display, fontSize: 18, color: tokens.color.ink.$value },
  body: { fontFamily: fontFamily.body700, fontSize: 14, color: tokens.color.ink.$value },
  input: {
    minHeight: 44,
    minWidth: 160,
    paddingHorizontal: 12,
    borderWidth: 2.5,
    borderRadius: 14,
    borderColor: tokens.color.ink.$value,
    fontFamily: fontFamily.display,
    fontSize: 18,
    color: tokens.color.ink.$value,
    backgroundColor: tokens.color.paper.$value,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  tile: {
    width: TILE_SIZE + 8,
    alignItems: 'center',
    padding: 4,
    borderWidth: 2,
    borderRadius: 14,
    borderColor: tokens.color.ink.$value,
    backgroundColor: tokens.color.sky.$value,
  },
  tileName: {
    fontFamily: fontFamily.body700,
    fontSize: 11,
    color: tokens.color.ink.$value,
    textAlign: 'center',
  },
});
