import { StyleSheet, Text, View } from 'react-native';

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
});
