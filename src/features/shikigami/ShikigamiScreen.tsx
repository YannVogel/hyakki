import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatNumber, gte, levelUpCost, statsOf, TEAM_SIZE } from '@/engine';
import { RARITY_NAMES, strings } from '@/i18n';
import { YokaiThumbnail } from '@/render';
import { bestTeamView, collectionView, type ShikigamiView, useGame, useGameStore } from '@/state';
import {
  bodyText,
  Button,
  Card,
  colors,
  displayText,
  hardShadow,
  outline,
  radii,
  rarityColors,
  spacing,
  strokes,
  useHaptics,
} from '@/ui';

import { mainTeamBonus, RARITY_TOKEN } from './rarity';
import { ShikigamiSheet } from './ShikigamiSheet';

const COLUMNS = 3;
const THUMB = 84;

function Tile({ shikigami, onOpen }: { shikigami: ShikigamiView; onOpen: (seed: number) => void }) {
  const text = strings.shikigami;
  const label = text.tileLabel(
    shikigami.name,
    shikigami.level,
    RARITY_NAMES[shikigami.spec.rarity],
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={shikigami.inTeam ? text.inTeamLabel(label) : label}
      onPress={() => onOpen(shikigami.seed)}
      style={[styles.tile, shikigami.inTeam && styles.inTeam]}
      testID={`shikigami-${shikigami.seed}`}
    >
      <View
        style={[
          styles.thumb,
          { backgroundColor: rarityColors[RARITY_TOKEN[shikigami.spec.rarity]] },
        ]}
      >
        <YokaiThumbnail spec={shikigami.spec} size={THUMB} />
      </View>
      <Text style={bodyText('xs', 800)} numberOfLines={1}>
        {shikigami.name}
      </Text>
      <Text style={[bodyText('xs', 700), styles.muted]}>{text.level(shikigami.level)}</Text>
      {shikigami.inTeam ? (
        <Text
          style={[bodyText('xs', 800), styles.badge]}
          testID={`shikigami-${shikigami.seed}-badge`}
        >
          {text.inTeamBadge}
        </Text>
      ) : null}
    </Pressable>
  );
}

function TeamSlot({
  shikigami,
  onOpen,
}: {
  shikigami: ShikigamiView | undefined;
  onOpen: (seed: number) => void;
}) {
  if (shikigami === undefined) {
    return (
      <View style={[styles.slot, styles.emptySlot]}>
        <Text style={[bodyText('sm', 800), styles.muted]}>{strings.shikigami.emptySlot}</Text>
      </View>
    );
  }
  const bonus = mainTeamBonus(statsOf(shikigami.spec).traits) ?? strings.shikigami.noBonus;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${strings.shikigami.tileLabel(shikigami.name, shikigami.level, RARITY_NAMES[shikigami.spec.rarity])}, ${bonus}`}
      onPress={() => onOpen(shikigami.seed)}
      style={styles.slot}
      testID={`team-${shikigami.seed}`}
    >
      <YokaiThumbnail spec={shikigami.spec} size={THUMB - 12} />
      <Text style={bodyText('xs', 800)} numberOfLines={1}>
        {shikigami.name}
      </Text>
      <Text style={[bodyText('xs', 800), styles.bonus]} numberOfLines={2}>
        {bonus}
      </Text>
    </Pressable>
  );
}

/** The collection and the active team of three. */
export function ShikigamiScreen() {
  const game = useGame((store) => store.game);
  const store = useGameStore();
  const [open, setOpen] = useState<number | null>(null);
  const collection = collectionView(game);
  const team = game.team.map((seed) => collection.find((entry) => entry.seed === seed));
  const selected = collection.find((entry) => entry.seed === open);
  const best = bestTeamView(game);
  const haptics = useHaptics();

  const toggleTeam = (shikigami: ShikigamiView) => {
    const next = shikigami.inTeam
      ? game.team.filter((seed) => seed !== shikigami.seed)
      : [...game.team, shikigami.seed];
    store.getState().setTeam(next);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={collection}
        keyExtractor={(item) => String(item.seed)}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        initialNumToRender={12}
        windowSize={5}
        renderItem={({ item }) => <Tile shikigami={item} onOpen={setOpen} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={displayText('3xl')}>{strings.shikigami.title}</Text>
            <Text style={bodyText('base', 700)}>{strings.shikigami.subtitle}</Text>
            <Button
              label={strings.shikigami.guardiansLink}
              variant="neutral"
              onPress={() => router.push('/guardians')}
              testID="guardians-link"
            />
            <Card style={styles.team}>
              <Text style={displayText('base')}>{strings.shikigami.team(game.team.length)}</Text>
              <View style={styles.slots}>
                {Array.from({ length: TEAM_SIZE }, (_, index) => (
                  <TeamSlot key={index} shikigami={team[index]} onOpen={setOpen} />
                ))}
              </View>
              <Button
                label={strings.shikigami.bestTeam}
                accessibilityHint={strings.shikigami.bestTeamHint}
                variant="neutral"
                disabled={collection.length === 0 || best.fielded}
                onPress={() => {
                  haptics('success');
                  store.getState().setTeam([...best.team]);
                }}
                testID="best-team"
              />
            </Card>
            <Text style={displayText('base')}>
              {strings.shikigami.collection} · {strings.shikigami.count(collection.length)}
            </Text>
            {collection.length === 0 ? (
              <Text style={[bodyText('base', 700), styles.muted]}>{strings.shikigami.empty}</Text>
            ) : null}
          </View>
        }
      />
      {selected === undefined ? null : (
        <ShikigamiSheet
          shikigami={selected}
          teamSize={game.team.length}
          levelUpCost={formatNumber(levelUpCost(selected.level))}
          canLevelUp={gte(game.souls, levelUpCost(selected.level))}
          onLevelUp={() => store.getState().levelUpShikigami(selected.seed)}
          onToggleTeam={() => toggleTeam(selected)}
          onClose={() => setOpen(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[3], padding: spacing[4] },
  header: { gap: spacing[3] },
  row: { gap: spacing[3] },
  muted: { color: colors.muted },
  team: { gap: spacing[3], padding: spacing[3] },
  slots: { flexDirection: 'row', gap: spacing[2] },
  slot: {
    flex: 1,
    minHeight: 150,
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[2],
    borderRadius: radii.button,
    backgroundColor: colors.cream,
    ...outline('control'),
  },
  emptySlot: { justifyContent: 'center', borderStyle: 'dashed' },
  bonus: { color: colors.ink, textAlign: 'center' },
  tile: {
    flex: 1 / COLUMNS,
    alignItems: 'center',
    gap: 2,
    padding: spacing[2],
    borderRadius: radii.button,
    backgroundColor: colors.paper,
    ...outline('control'),
    ...hardShadow('small'),
  },
  // A team member stands out in the grid: yellow tile, thicker outline, « Équipe » badge.
  inTeam: { backgroundColor: colors.yellow, borderWidth: strokes.card },
  badge: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    paddingHorizontal: spacing[1] + 2,
    overflow: 'hidden',
    borderRadius: radii.chip,
    color: colors.paper,
    backgroundColor: colors.ink,
  },
  thumb: { borderRadius: radii.chip, ...outline('small') },
});
