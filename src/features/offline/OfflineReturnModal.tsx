import { Image, StyleSheet, Text, View } from 'react-native';

import { formatNumber, generate, nameOf, type OfflineReport, waveInCycle } from '@/engine';
import { strings } from '@/i18n';
import { bodyText, Button, colors, displayText, ProgressBar, Sheet, spacing } from '@/ui';

import { HERO_POSES, heroPoseSize } from '../shared/images';

const MINUTE_MS = 60_000;
const HERO_HEIGHT = 130;

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / MINUTE_MS);
  return strings.offline.duration(Math.floor(totalMinutes / 60), totalMinutes % 60);
}

function Row({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label} : ${value}`}>
      <Text style={bodyText('base', 800)}>{label}</Text>
      <Text style={displayText('lg')} testID={testID}>
        {value}
      </Text>
    </View>
  );
}

export interface OfflineReturnModalProps {
  readonly report: OfflineReport;
  readonly onCollect: () => void;
}

/** The harvest after an absence: what the team did, and the offline cap. */
export function OfflineReturnModal({ report, onCollect }: OfflineReturnModalProps) {
  const text = strings.offline;
  const used = formatDuration(report.durationMs);
  const cap = formatDuration(report.capMs);
  return (
    <Sheet
      maxHeight="92%"
      onRequestClose={onCollect}
      testID="offline-report"
      footer={
        // Outside the scrolling report: a long list of level-ups never hides the way out.
        <View style={styles.footer}>
          <Button label={text.collect} size="large" onPress={onCollect} testID="offline-collect" />
        </View>
      }
    >
      <View style={styles.content}>
        <Image
          source={HERO_POSES.sleep.source}
          accessibilityLabel={text.heroLabel}
          style={[styles.hero, heroPoseSize('sleep', HERO_HEIGHT)]}
        />
        <Text style={[bodyText('base', 800), styles.center]}>{text.title}</Text>
        <Text style={[displayText('4xl'), styles.center]} testID="offline-duration">
          {used}
        </Text>
        <Text style={[bodyText('base', 700), styles.center]}>{text.subtitle}</Text>
        <Row label={text.yokai} value={formatNumber(report.yokaiDefeated)} testID="offline-yokai" />
        <Row label={text.souls} value={text.soulsValue(formatNumber(report.souls))} />
        <Row
          label={text.waves}
          value={text.wavesValue(waveInCycle(report.waveFrom), waveInCycle(report.waveTo))}
        />
        {report.levelUps.map((levelUp) => (
          <Text key={levelUp.seed} style={bodyText('base', 800)}>
            {text.levelUp(
              nameOf(generate(levelUp.seed, levelUp.generatorVersion)),
              levelUp.from,
              levelUp.to,
            )}
          </Text>
        ))}
        {report.stoppedAtGuardian ? (
          <Text style={bodyText('base', 700)}>{text.stoppedAtGuardian}</Text>
        ) : null}
        <View style={styles.cap}>
          <View style={styles.row}>
            <Text style={bodyText('sm', 800)}>{text.cap}</Text>
            <Text style={bodyText('sm', 800)}>{text.capValue(used, cap)}</Text>
          </View>
          <ProgressBar
            value={report.durationMs / report.capMs}
            color={colors.purple}
            accessibilityLabel={text.capLabel(used, cap)}
          />
          {report.reachedCap ? (
            <Text style={[bodyText('sm', 700), styles.muted]}>{text.capReached}</Text>
          ) : null}
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3], padding: spacing[5], paddingBottom: spacing[3] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[5], paddingTop: spacing[2] },
  hero: { alignSelf: 'center' },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cap: { gap: spacing[2] },
  muted: { color: colors.muted },
});
