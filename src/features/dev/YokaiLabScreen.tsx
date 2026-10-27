import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { generate, nameOf, type YokaiSpec } from '@/engine';
import { describeYokai, RARITY_NAMES, strings } from '@/i18n';
import { YokaiCanvas } from '@/render';
import { bodyText, displayText, outline } from '@/ui/styles';
import { colors, radii, spacing, touchTarget } from '@/ui/tokens';

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
    gap: spacing[2],
    padding: spacing[4],
    paddingTop: spacing[6] * 2,
    backgroundColor: colors.cream,
  },
  title: displayText('2xl'),
  name: displayText('xl'),
  body: bodyText('base'),
  input: {
    ...displayText('xl'),
    minHeight: touchTarget,
    minWidth: 160,
    paddingHorizontal: spacing[3],
    borderRadius: radii.button,
    ...outline('control'),
    backgroundColor: colors.paper,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing[2] },
  tile: {
    width: TILE_SIZE + spacing[2],
    alignItems: 'center',
    padding: spacing[1],
    borderRadius: radii.button,
    ...outline('small'),
    backgroundColor: colors.sky,
  },
  tileName: { ...bodyText('xs'), textAlign: 'center' },
});
