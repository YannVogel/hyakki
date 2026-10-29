import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { statsOf, TEAM_SIZE } from '@/engine';
import { describeYokai, RARITY_NAMES, strings, traitEffectText, traitLabel } from '@/i18n';
import { YokaiCanvas } from '@/render';
import type { ShikigamiView } from '@/state';
import {
  bodyText,
  Button,
  Card,
  Chip,
  colors,
  displayText,
  ProgressBar,
  RarityBadge,
  spacing,
  radii,
  statColors,
} from '@/ui';

import { RARITY_TOKEN } from './rarity';

const STAT_MAX = { hp: 420, attack: 460, defense: 360, speed: 420, crit: 0.3 } as const;

export interface ShikigamiSheetProps {
  readonly shikigami: ShikigamiView;
  readonly teamSize: number;
  readonly levelUpCost: string;
  readonly canLevelUp: boolean;
  readonly onLevelUp: () => void;
  readonly onToggleTeam: () => void;
  readonly onClose: () => void;
}

/** Card of a shikigami: look, stats, traits, level-up and team membership. */
export function ShikigamiSheet({
  shikigami,
  teamSize,
  levelUpCost,
  canLevelUp,
  onLevelUp,
  onToggleTeam,
  onClose,
}: ShikigamiSheetProps) {
  const { spec, name, level, inTeam } = shikigami;
  const stats = statsOf(spec);
  const text = strings.shikigami;
  const rows = [
    {
      key: 'hp',
      label: text.stats.hp,
      value: stats.hp,
      shown: String(stats.hp),
      color: statColors.pv,
    },
    {
      key: 'attack',
      label: text.stats.attack,
      value: stats.attack,
      shown: String(stats.attack),
      color: statColors.atq,
    },
    {
      key: 'defense',
      label: text.stats.defense,
      value: stats.defense,
      shown: String(stats.defense),
      color: statColors.def,
    },
    {
      key: 'speed',
      label: text.stats.speed,
      value: stats.speed,
      shown: String(stats.speed),
      color: statColors.vit,
    },
    {
      key: 'crit',
      label: text.stats.crit,
      value: stats.critChance,
      shown: `${Math.round(stats.critChance * 100)} %`,
      color: statColors.crit,
    },
  ] as const;
  const teamFull = !inTeam && teamSize >= TEAM_SIZE;
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card large style={styles.sheet} testID="shikigami-sheet">
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.stage}>
              <YokaiCanvas
                spec={spec}
                size={180}
                accessibilityLabel={`${name}, ${describeYokai(spec)}`}
              />
            </View>
            <RarityBadge rarity={RARITY_TOKEN[spec.rarity]} label={RARITY_NAMES[spec.rarity]} />
            <Text style={displayText('2xl')}>{name}</Text>
            <Text style={[bodyText('base', 700), styles.muted]}>
              {describeYokai(spec)} · {text.level(level)}
            </Text>
            {rows.map((row) => (
              <View key={row.key} style={styles.stat}>
                <Text style={[bodyText('md', 800), styles.statLabel]}>{row.label}</Text>
                <View style={styles.bar}>
                  <ProgressBar
                    value={row.value / STAT_MAX[row.key]}
                    color={row.color}
                    trackColor={colors.cream}
                    accessibilityLabel={text.statValue(row.label, row.shown)}
                  />
                </View>
                <Text style={[displayText('md'), styles.statValue]}>{row.shown}</Text>
              </View>
            ))}
            <Text style={displayText('base')}>{text.traits}</Text>
            <View style={styles.chips}>
              {stats.traits.map((trait, index) => (
                <Chip
                  key={index}
                  label={traitLabel(trait.source)}
                  detail={traitEffectText(trait)}
                />
              ))}
            </View>
            <Button
              label={text.levelUp(levelUpCost)}
              accessibilityLabel={text.levelUpLabel(levelUpCost)}
              disabled={!canLevelUp}
              onPress={onLevelUp}
              sound="purchase"
              testID="shikigami-level-up"
            />
            <Button
              label={inTeam ? text.removeFromTeam : teamFull ? text.teamFull : text.addToTeam}
              variant="neutral"
              disabled={teamFull}
              onPress={onToggleTeam}
              testID="shikigami-team"
            />
            <Button
              label={text.close}
              variant="neutral"
              onPress={onClose}
              testID="shikigami-close"
            />
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing[3],
    backgroundColor: 'transparent',
  },
  sheet: { maxHeight: '88%', backgroundColor: colors.paper },
  content: { gap: spacing[3], padding: spacing[4] },
  stage: { alignItems: 'center', backgroundColor: colors.sky, borderRadius: radii.card },
  muted: { color: colors.muted },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  statLabel: { width: 72 },
  bar: { flex: 1 },
  statValue: { width: 52, textAlign: 'right' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
