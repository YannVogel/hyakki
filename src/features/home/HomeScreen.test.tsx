import { render, screen } from '@testing-library/react-native';

import { strings } from '@/i18n';
import { fontFamily } from '@/ui/fonts';

import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  it('shows the game title in the display font', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText(strings.home.title)).toHaveStyle({ fontFamily: fontFamily.display });
    expect(screen.getByText(strings.home.kanji)).toBeOnTheScreen();
  });

  it('shows the subtitle in the body font', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText(strings.home.subtitle)).toHaveStyle({ fontFamily: fontFamily.body700 });
  });
});
