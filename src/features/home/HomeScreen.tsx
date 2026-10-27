import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { fontFamily } from '@/ui/fonts';

// Temporary welcome screen until the combat screen exists (#31).
export function HomeScreen() {
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
    gap: 8,
  },
  kanji: {
    fontFamily: fontFamily.display,
    fontSize: 22,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 42,
  },
  subtitle: {
    fontFamily: fontFamily.body700,
    fontSize: 16,
  },
  devLink: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
