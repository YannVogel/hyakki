import { StyleSheet, Text, View } from 'react-native';

import { statsOf, TEAM_SIZE } from '@/engine';
import { describeYokai, RARITY_NAMES, strings, traitEffectText, traitLabel } from '@/i18n';
import { YokaiCanvas } from '@/render';
import type { ShikigamiView } from '@/state';
import {
  bodyText,
  Button,
  Chip,
  colors,
  displayText,
  ProgressBar,
  RarityBadge,
  Sheet,
  spacing,
  radii,
  statColors,
} from '@/ui';

import { LevelUpControl, type LevelUpControlProps } from './LevelUpControl';
import { RARITY_TOKEN } from './rarity';

const STAT_MAX = { hp: 420, attack: 460, defense: 360, speed: 420, crit: 0.3 } as const;

export interface ShikigamiSheetProps {
  readonly shikigami: ShikigamiView;
  readonly teamSize: number;
  readonly levelUp: LevelUpControlProps;
  readonly onToggleTeam: () => void;
  readonly onClose: () => void;
}

/** Card of a shikigami: look, stats, traits, level-up and team membership. */
export function ShikigamiSheet({
  shikigami,
  teamSize,
  levelUp,
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
    <Sheet
      maxHeight="88%"
      onRequestClose={onClose}
      testID="shikigami-sheet"
      footer={
        <View style={styles.footer}>
          <Button label={text.close} variant="neutral" onPress={onClose} testID="shikigami-close" />
        </View>
      }
    >
      <View style={styles.content}>
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
            <Chip key={index} label={traitLabel(trait.source)} detail={traitEffectText(trait)} />
          ))}
        </View>
        <LevelUpControl {...levelUp} />
        <Button
          label={inTeam ? text.removeFromTeam : teamFull ? text.teamFull : text.addToTeam}
          variant="neutral"
          disabled={teamFull}
          onPress={onToggleTeam}
          testID="shikigami-team"
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3], padding: spacing[4], paddingBottom: spacing[3] },
  footer: { paddingHorizontal: spacing[4], paddingBottom: spacing[4], paddingTop: spacing[2] },
  stage: { alignItems: 'center', backgroundColor: colors.sky, borderRadius: radii.card },
  muted: { color: colors.muted },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  statLabel: { width: 72 },
  bar: { flex: 1 },
  statValue: { width: 52, textAlign: 'right' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
