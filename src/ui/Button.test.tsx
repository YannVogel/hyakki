import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';
import { HapticsProvider } from './haptics';
import { SoundProvider } from './sound';
import { colors } from './tokens';

describe('Button', () => {
  it('is an accessible button that calls onPress with a haptic tick', async () => {
    const onPress = jest.fn();
    const haptics = jest.fn();
    await render(
      <HapticsProvider trigger={haptics}>
        <Button label="Affronter !" onPress={onPress} />
      </HapticsProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Affronter !' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(haptics).toHaveBeenCalledWith('selection');
  });

  it('clicks on press, or plays the sound it is given', async () => {
    const sound = jest.fn();
    await render(
      <SoundProvider trigger={sound}>
        <Button label="Retour" onPress={jest.fn()} />
        <Button label="Acheter" onPress={jest.fn()} sound="purchase" />
      </SoundProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Acheter' }));
    expect(sound.mock.calls).toEqual([['ui'], ['purchase']]);
  });

  it('uses the variant color', async () => {
    await render(<Button label="Fuir" variant="danger" onPress={jest.fn()} testID="b" />);
    expect(screen.getByTestId('b')).toHaveStyle({ backgroundColor: colors.red });
  });

  it('does nothing and turns grey when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Acheter" disabled onPress={onPress} testID="b" />);
    const button = screen.getByRole('button', { name: 'Acheter' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('b')).toHaveStyle({ backgroundColor: colors.disabled });
  });

  it('keeps a 44 pt touch target and may speak a richer label', async () => {
    await render(
      <Button
        label="×10"
        accessibilityLabel="Acheter dix niveaux"
        onPress={jest.fn()}
        testID="b"
      />,
    );
    expect(screen.getByRole('button', { name: 'Acheter dix niveaux' })).toBeOnTheScreen();
    expect(screen.getByTestId('b')).toHaveStyle({ minHeight: 44, minWidth: 44 });
  });
});
