import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { bodyText, Card, displayText, Icon, spacing } from '@/ui';

import { SOULS_ICON } from '../shared/icons';
import { OfudaIcon } from '../shared/OfudaIcon';
import { RULES, type RuleSection } from './rulesText';

const ICON_SIZE = 24;

// The currencies next to their name: souls for the Sanctuary, ofuda for the Kamidana.
const ICONS: Partial<Record<RuleSection, ReactNode>> = {
  sanctuary: <Icon parts={SOULS_ICON} size={ICON_SIZE} />,
  kamidana: <OfudaIcon size={ICON_SIZE} />,
};

/** The rules of the game, one card per theme, in the order the player meets them. */
export function RulesList() {
  return (
    <>
      {RULES.map((rule) => (
        <Card key={rule.key} style={styles.card} testID={`rule-${rule.key}`}>
          <View style={styles.title}>
            {ICONS[rule.key]}
            <Text style={displayText('lg')} accessibilityRole="header">
              {strings.rules.sections[rule.key].title}
            </Text>
          </View>
          <Text style={bodyText('base', 700)}>{rule.body}</Text>
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[2], padding: spacing[3] },
  title: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
});
