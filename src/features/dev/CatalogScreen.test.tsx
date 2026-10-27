import { fireEvent, render, screen } from '@testing-library/react-native';

import { strings } from '@/i18n';

import { CatalogScreen } from './CatalogScreen';

describe('CatalogScreen', () => {
  it('shows every base component', async () => {
    await render(<CatalogScreen />);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(5);
    expect(screen.getByLabelText(strings.catalog.soulsLabel)).toBeOnTheScreen();
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('lets the tabs and the quantity selector change', async () => {
    await render(<CatalogScreen />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Festival' }));
    expect(screen.getByRole('tab', { name: 'Festival' })).toBeSelected();
    await fireEvent.press(screen.getByRole('radio', { name: 'Max' }));
    expect(screen.getByRole('radio', { name: 'Max' })).toBeChecked();
  });
});
