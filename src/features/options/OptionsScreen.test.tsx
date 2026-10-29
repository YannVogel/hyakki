import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BALANCE } from '@/engine';
import { strings } from '@/i18n';
import { createSettingsStore, SettingsStoreProvider } from '@/state';

import { OptionsScreen } from './OptionsScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 20, left: 0, right: 0, bottom: 0 },
};

async function openRules() {
  const settings = createSettingsStore({ read: () => undefined, write: jest.fn() });
  await render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <SettingsStoreProvider store={settings}>
        <OptionsScreen />
      </SettingsStoreProvider>
    </SafeAreaProvider>,
  );
  await fireEvent.press(screen.getByRole('radio', { name: strings.options.rules }));
}

const ruleText = (key: string) =>
  within(screen.getByTestId(`rule-${key}`))
    .getAllByText(/./)
    .map((node) => node.props.children);

describe('OptionsScreen', () => {
  it('opens on the settings', async () => {
    const settings = createSettingsStore({ read: () => undefined, write: jest.fn() });
    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <SettingsStoreProvider store={settings}>
          <OptionsScreen />
        </SettingsStoreProvider>
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('options-title')).toHaveTextContent(strings.settings.title);
    expect(screen.getByTestId('setting-sound')).toBeOnTheScreen();
    expect(screen.queryByTestId('rule-parade')).toBeNull();
  });

  it('shows the rules, one titled card per theme', async () => {
    await openRules();
    expect(screen.getByTestId('options-title')).toHaveTextContent(strings.rules.title);
    for (const section of Object.values(strings.rules.sections)) {
      expect(screen.getByRole('header', { name: section.title })).toBeOnTheScreen();
    }
    expect(screen.queryByTestId('setting-sound')).toBeNull();
  });

  it('reads its numbers from the balance', async () => {
    await openRules();
    const { guardian, shikigami, offline, crit, festival } = BALANCE;
    expect(ruleText('guardians').join(' ')).toContain(`${guardian.timeLimitMs / 1000}\u00a0s`);
    expect(ruleText('guardians').join(' ')).toContain(`Toutes les ${guardian.every} vagues`);
    expect(ruleText('shikigami').join(' ')).toContain(
      `${shikigami.captureChance.common * 100}\u00a0% de chances pour un commun`,
    );
    expect(ruleText('shikigami').join(' ')).toContain('0,4\u00a0% pour un épique');
    expect(ruleText('offline').join(' ')).toContain(`${offline.efficiency * 100}\u00a0%`);
    expect(ruleText('offline').join(' ')).toContain(`${offline.maxCapHours}\u00a0h`);
    expect(ruleText('parade').join(' ')).toContain(`×${crit.multiplier} dégâts`);
    expect(ruleText('festival').join(' ')).toContain(`${festival.bonusPerSpark * 100}\u00a0%`);
  });

  it('shows the currencies next to their shop', async () => {
    await openRules();
    expect(within(screen.getByTestId('rule-kamidana')).getByTestId('ofuda-icon')).toBeOnTheScreen();
  });
});
