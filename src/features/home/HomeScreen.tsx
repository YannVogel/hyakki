import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { useGameStore } from '@/state';
import { bodyText, displayText } from '@/ui/styles';

import { devGuardianState } from '../dev/devStates';
import { colors, spacing, touchTarget } from '@/ui/tokens';

// Development hub (route /dev): links to the development screens.
export function HomeScreen() {
  const store = useGameStore();
  return (
    <View style={styles.container}>
      <Text style={styles.kanji}>{strings.home.kanji}</Text>
      <Text style={styles.title} testID="home-title">
        {strings.home.title}
      </Text>
      <Text style={styles.subtitle}>{strings.home.subtitle}</Text>
      {__DEV__ && (
        <>
          <Link href="/dev/native-check" asChild>
            <Pressable
              accessibilityRole="link"
              style={styles.devLink}
              testID="home-native-check-link"
            >
              <Text style={styles.subtitle}>{strings.home.nativeCheckLink}</Text>
            </Pressable>
          </Link>
          <Link href="/dev/yokai-lab" asChild>
            <Pressable accessibilityRole="link" style={styles.devLink} testID="home-yokai-lab-link">
              <Text style={styles.subtitle}>{strings.home.yokaiLabLink}</Text>
            </Pressable>
          </Link>
          <Pressable
            accessibilityRole="button"
            style={styles.devLink}
            testID="dev-guardian"
            onPress={() => {
              store.setState({ game: devGuardianState(2026, 100) });
              router.back();
            }}
          >
            <Text style={styles.subtitle}>{strings.home.guardianShortcut}</Text>
          </Pressable>
          <Link href="/dev/catalog" asChild>
            <Pressable accessibilityRole="link" style={styles.devLink} testID="home-catalog-link">
              <Text style={styles.subtitle}>{strings.home.catalogLink}</Text>
            </Pressable>
          </Link>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.cream,
  },
  kanji: displayText('2xl'),
  title: displayText('5xl'),
  subtitle: bodyText('lg'),
  devLink: {
    minHeight: touchTarget,
    justifyContent: 'center',
  },
});
