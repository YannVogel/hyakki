import { render, screen, within } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Button } from './Button';
import { Sheet } from './Sheet';

const LINES = Array.from({ length: 40 }, (_, index) => `Ligne ${index + 1}`);

describe('Sheet', () => {
  it('scrolls its content but keeps its footer out of the scroll, always in view', async () => {
    await render(
      <Sheet
        maxHeight="90%"
        onRequestClose={jest.fn()}
        testID="sheet"
        footer={<Button label="Fermer" onPress={jest.fn()} />}
      >
        {LINES.map((line) => (
          <Text key={line}>{line}</Text>
        ))}
      </Sheet>,
    );
    const scroll = screen.getByTestId('sheet-scroll');
    expect(within(scroll).getByText('Ligne 40')).toBeOnTheScreen();
    expect(within(scroll).queryByRole('button', { name: 'Fermer' })).toBeNull();
    expect(
      within(screen.getByTestId('sheet')).getByRole('button', { name: 'Fermer' }),
    ).toBeOnTheScreen();
  });
});
