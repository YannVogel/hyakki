import { fireEvent, render, screen } from '@testing-library/react-native';

import { HapticsProvider } from './haptics';
import { Segmented } from './Segmented';
import { TabBar } from './TabBar';

const TABS = [
  { key: 'combat', label: 'Combat' },
  { key: 'shikigami', label: 'Shikigami' },
  { key: 'sanctuary', label: 'Sanctuaire' },
  { key: 'festival', label: 'Festival' },
] as const;

describe('TabBar', () => {
  it('marks the active tab and selects another one', async () => {
    const onSelect = jest.fn();
    await render(
      <TabBar
        tabs={TABS}
        active="combat"
        onSelect={onSelect}
        accessibilityLabel="Navigation principale"
      />,
    );
    expect(screen.getByRole('tab', { name: 'Combat' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Festival' })).not.toBeSelected();
    await fireEvent.press(screen.getByRole('tab', { name: 'Sanctuaire' }));
    expect(onSelect).toHaveBeenCalledWith('sanctuary');
  });

  it('ignores a press on the active tab', async () => {
    const onSelect = jest.fn();
    await render(
      <TabBar
        tabs={TABS}
        active="combat"
        onSelect={onSelect}
        accessibilityLabel="Navigation principale"
      />,
    );
    await fireEvent.press(screen.getByRole('tab', { name: 'Combat' }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('Segmented', () => {
  it('checks the selected option and reports a change with a haptic tick', async () => {
    const onChange = jest.fn();
    const haptics = jest.fn();
    await render(
      <HapticsProvider trigger={haptics}>
        <Segmented
          accessibilityLabel="Quantité"
          value={1}
          onChange={onChange}
          options={[
            { value: 1, label: '×1' },
            { value: 10, label: '×10' },
          ]}
        />
      </HapticsProvider>,
    );
    expect(screen.getByRole('radio', { name: '×1' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: '×10' }));
    expect(onChange).toHaveBeenCalledWith(10);
    expect(haptics).toHaveBeenCalledWith('selection');
  });
});
