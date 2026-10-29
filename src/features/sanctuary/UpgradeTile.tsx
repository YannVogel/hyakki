import { StyleSheet, View } from 'react-native';

import { displayText, OutlinedText, outline, radii } from '@/ui';

const TILE = 52;

/** The inked square of an upgrade, with its kanji. */
export function UpgradeTile({ kanji, color }: { kanji: string; color: string }) {
  return (
    <View style={[styles.tile, { backgroundColor: color }]}>
      <OutlinedText style={displayText('3xl')}>{kanji}</OutlinedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: TILE,
    height: TILE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button,
    ...outline('control'),
  },
});
