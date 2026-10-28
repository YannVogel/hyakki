import { act, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';

import { big, type CombatEvent, createNewGame } from '@/engine';
import { strings } from '@/i18n';

import { renderScreen } from '../testing/renderScreen';
import { CombatScreen } from './CombatScreen';
import {
  AWAKENING_ANNOUNCEMENT_MS,
  awakeningReached,
  useAwakeningAnnouncement,
} from './useAwakeningAnnouncement';

const victory = (wave: number): CombatEvent => ({
  type: 'guardianDefeated',
  wave,
  index: (wave / 100 - 1) % 10,
  ofuda: 50,
  souls: big(1),
  firstTime: true,
  atMs: 0,
});

describe('awakeningReached', () => {
  it('announces the next level when the tenth guardian falls', () => {
    expect(awakeningReached([victory(1000)])).toBe(2);
    expect(awakeningReached([victory(2000)])).toBe(3);
  });

  it('stays quiet for the other guardians and the other events', () => {
    expect(awakeningReached([victory(900)])).toBeNull();
    expect(awakeningReached([victory(1100)])).toBeNull();
    expect(awakeningReached([])).toBeNull();
  });
});

function Probe() {
  const level = useAwakeningAnnouncement();
  return <Text testID="probe">{level === null ? '-' : String(level)}</Text>;
}

describe('useAwakeningAnnouncement', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('holds the new level for a few seconds and tells screen readers', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const { store } = await renderScreen(<Probe />, createNewGame(8));
    expect(screen.getByTestId('probe')).toHaveTextContent('-');

    await act(() => store.setState({ events: [victory(1000)], eventBatch: 1 }));
    expect(screen.getByTestId('probe')).toHaveTextContent('2');
    expect(announce).toHaveBeenCalledWith(
      `${strings.combat.awakeningTitle(2)} ${strings.combat.awakeningBody}`,
    );

    await act(() => jest.advanceTimersByTime(AWAKENING_ANNOUNCEMENT_MS));
    expect(screen.getByTestId('probe')).toHaveTextContent('-');
  });
});

describe('CombatScreen', () => {
  it('shows the new awakening level over the scene', async () => {
    const { store } = await renderScreen(<CombatScreen />, createNewGame(8));
    expect(screen.queryByTestId('awakening-banner')).toBeNull();
    await act(() => store.setState({ events: [victory(1000)], eventBatch: 1 }));
    expect(screen.getByTestId('awakening-banner')).toHaveProp(
      'accessibilityLabel',
      `${strings.combat.awakeningTitle(2)} ${strings.combat.awakeningBody}`,
    );
  });
});
