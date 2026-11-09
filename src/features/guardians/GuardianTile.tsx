import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import type { AwakenedGuardianCard, GuardianCard, GuardianStatus } from '@/state';
import { bodyText, Card, colors, displayText, outline, radii, spacing } from '@/ui';

import { GuardianArt } from '../shared/GuardianArt';

const STATUS_COLORS = {
  defeated: colors.grass,
  next: colors.yellow,
  upcoming: colors.paper,
} as const;

interface GalleryTileProps {
  readonly index: number;
  readonly awakened: boolean;
  /** In color once known (or beaten, for an awakened guardian); a black silhouette before. */
  readonly revealed: boolean;
  readonly name: string;
  readonly wave: number;
  readonly status: GuardianStatus;
  readonly statusText: string;
  readonly accessibilityLabel: string;
  readonly testID: string;
}

function GalleryTile(props: GalleryTileProps) {
  const { index, awakened, revealed, name, wave, status, statusText, testID } = props;
  return (
    <Card style={styles.tile} testID={testID}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={props.accessibilityLabel}
        style={styles.inner}
      >
        <View
          style={[styles.art, { backgroundColor: revealed ? colors.skyLight : colors.disabled }]}
        >
          <GuardianArt
            index={index}
            awakened={awakened}
            tintColor={revealed ? undefined : colors.ink}
            style={styles.image}
            testID={revealed ? `${testID}-art` : `${testID}-silhouette`}
          />
        </View>
        <Text style={displayText('md')} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.meta}>
          <Text style={[bodyText('xs', 800), styles.muted]}>
            {strings.guardians.galleryWave(wave)}
          </Text>
          <Text
            style={[bodyText('xs', 800), styles.status, { backgroundColor: STATUS_COLORS[status] }]}
          >
            {statusText}
          </Text>
        </View>
      </View>
    </Card>
  );
}

/** A guardian of the gallery: a black silhouette, unnamed, until it is met. */
export function GuardianTile({ card }: { card: GuardianCard }) {
  const text = strings.guardians;
  const status = text.status[card.status];
  const name = text.names[card.index];
  return (
    <GalleryTile
      index={card.index}
      awakened={false}
      revealed={card.revealed}
      name={card.revealed ? name : text.unknown}
      wave={card.wave}
      status={card.status}
      statusText={status}
      accessibilityLabel={
        card.revealed
          ? text.knownLabel(name, text.descriptions[card.index], card.wave, status)
          : text.unknownLabel(card.wave, status)
      }
      testID={`guardian-${card.index}`}
    />
  );
}

/**
 * An awakened guardian, with its aura: the highest awakening level it fell at, once beaten. Named
 * as its normal self on screen (the section says « éveillés », and the long names would not fit).
 */
export function AwakenedGuardianTile({ card }: { card: AwakenedGuardianCard }) {
  const text = strings.guardians;
  const name = text.names[card.index];
  const statusText =
    card.bestLevel === null ? text.status[card.status] : text.awakeningLevel(card.bestLevel);
  const statusLabel =
    card.bestLevel === null ? statusText : text.awakenedRecordLabel(card.bestLevel);
  return (
    <GalleryTile
      index={card.index}
      awakened
      revealed={card.bestLevel !== null}
      name={name}
      wave={card.wave}
      status={card.status}
      statusText={statusText}
      accessibilityLabel={text.knownLabel(
        text.awakened(name),
        text.descriptions[card.index],
        card.wave,
        statusLabel,
      )}
      testID={`awakened-guardian-${card.index}`}
    />
  );
}

const styles = StyleSheet.create({
  tile: { width: '47%', padding: spacing[2] },
  inner: { gap: spacing[1] },
  art: { aspectRatio: 1, borderRadius: radii.button, ...outline('small'), overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: colors.muted },
  status: {
    paddingHorizontal: spacing[2],
    borderRadius: radii.chip,
    overflow: 'hidden',
    ...outline('small'),
  },
});
