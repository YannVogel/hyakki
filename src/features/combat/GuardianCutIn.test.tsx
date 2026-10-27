import { fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { strings } from '@/i18n';

import { GuardianCutIn, type GuardianCutInProps } from './GuardianCutIn';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderCutIn = (props: Partial<GuardianCutInProps> = {}) =>
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <GuardianCutIn
        index={3}
        name="Tsuchigumo"
        wave={400}
        hp="1,2 Md"
        weakness="fire"
        timeLimitSeconds={30}
        reduceMotion={false}
        onEngage={jest.fn()}
        onFlee={jest.fn()}
        {...props}
      />
    </SafeAreaProvider>,
  );

describe('GuardianCutIn', () => {
  it('introduces the guardian: name, kana, tagline, HP, weakness and time limit', async () => {
    await renderCutIn();
    expect(screen.getByText('Tsuchigumo')).toBeOnTheScreen();
    expect(screen.getByText(strings.guardians.kana[3])).toBeOnTheScreen();
    expect(screen.getByText(strings.guardians.taglines[3])).toBeOnTheScreen();
    expect(screen.getByText(strings.guardians.hp('1,2 Md'))).toBeOnTheScreen();
    expect(screen.getByText(strings.guardians.timeLeft(30))).toBeOnTheScreen();
    expect(screen.getByText(strings.guardians.intro(400))).toBeOnTheScreen();
  });

  it('lets the player face the guardian or go back one wave', async () => {
    const onEngage = jest.fn();
    const onFlee = jest.fn();
    await renderCutIn({ onEngage, onFlee });
    await fireEvent.press(screen.getByRole('button', { name: strings.guardians.engage }));
    await fireEvent.press(screen.getByRole('button', { name: strings.guardians.flee(399) }));
    expect(onEngage).toHaveBeenCalled();
    expect(onFlee).toHaveBeenCalled();
  });

  it('starts with the bands off screen, sliding in', async () => {
    await renderCutIn();
    expect(screen.getByLabelText(strings.guardians.eyesLabel('Tsuchigumo'))).toHaveStyle({
      transform: [{ translateX: -Dimensions.get('window').width }, { rotate: '-6deg' }],
    });
  });

  it('only fades when motion is reduced: nothing slides', async () => {
    await renderCutIn({ reduceMotion: true });
    expect(screen.getByLabelText(strings.guardians.eyesLabel('Tsuchigumo'))).toHaveStyle({
      transform: [{ translateX: 0 }, { rotate: '-6deg' }],
    });
  });
});
