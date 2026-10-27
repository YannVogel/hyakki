import { fireEvent, render, screen } from '@testing-library/react-native';

import { strings } from '@/i18n';
import { storage } from '@/services/storage';

import { NativeCheckScreen } from './NativeCheckScreen';

describe('NativeCheckScreen', () => {
  beforeEach(() => storage.clearAll());

  it('draws the Skia canvas', async () => {
    await render(<NativeCheckScreen />);

    expect(screen.getByTestId('native-check-canvas')).toBeOnTheScreen();
  });

  it('persists the counter in storage', async () => {
    await render(<NativeCheckScreen />);

    await fireEvent.press(screen.getByRole('button', { name: strings.nativeCheck.increment }));
    await fireEvent.press(screen.getByRole('button', { name: strings.nativeCheck.increment }));

    expect(screen.getByText(strings.nativeCheck.counter(2))).toBeOnTheScreen();
    expect(storage.getNumber('nativeCheck.counter')).toBe(2);
  });

  it('restores a saved counter', async () => {
    storage.set('nativeCheck.counter', 7);

    await render(<NativeCheckScreen />);

    expect(screen.getByText(strings.nativeCheck.counter(7))).toBeOnTheScreen();
  });
});
