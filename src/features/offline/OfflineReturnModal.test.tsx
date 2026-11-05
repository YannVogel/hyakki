import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { big, generate, nameOf, type OfflineReport } from '@/engine';
import { strings } from '@/i18n';

import { formatDuration, OfflineReturnModal } from './OfflineReturnModal';

const HOUR = 3_600_000;

const report = (overrides: Partial<OfflineReport> = {}): OfflineReport => ({
  durationMs: 7 * HOUR + 32 * 60_000,
  capMs: 8 * HOUR,
  reachedCap: false,
  yokaiDefeated: 1284,
  souls: big(2_410_000),
  waveFrom: 38,
  waveTo: 47,
  stoppedAtGuardian: false,
  levelUps: [{ seed: 9, generatorVersion: 1, from: 18, to: 19 }],
  ...overrides,
});

describe('formatDuration', () => {
  it.each([
    [45 * 60_000, '45 min'],
    [HOUR, '1 h'],
    [7 * HOUR + 32 * 60_000, '7 h 32 min'],
  ])('formats %d ms as %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});

describe('OfflineReturnModal', () => {
  it('reports the absence like the mockup', async () => {
    await render(<OfflineReturnModal report={report()} onCollect={jest.fn()} />);
    expect(screen.getByTestId('offline-duration')).toHaveTextContent('7 h 32 min');
    expect(screen.getByLabelText(`${strings.offline.yokai} : 1 284`)).toBeOnTheScreen();
    expect(screen.getByLabelText(`${strings.offline.souls} : + 2,41 M`)).toBeOnTheScreen();
    expect(screen.getByLabelText(`${strings.offline.waves} : 38 → 47`)).toBeOnTheScreen();
    expect(
      screen.getByText(strings.offline.levelUp(nameOf(generate(9, 1)), 18, 19)),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('progressbar', { name: strings.offline.capLabel('7 h 32 min', '8 h') }),
    ).toBeOnTheScreen();
  });

  it('points to the Sanctuary when the cap was reached, and to the guardian waiting', async () => {
    await render(
      <OfflineReturnModal
        report={report({ reachedCap: true, stoppedAtGuardian: true })}
        onCollect={jest.fn()}
      />,
    );
    expect(screen.getByText(strings.offline.capReached)).toBeOnTheScreen();
    expect(screen.getByText(strings.offline.stoppedAtGuardian)).toBeOnTheScreen();
  });

  it('closes when the player collects', async () => {
    const onCollect = jest.fn();
    await render(<OfflineReturnModal report={report()} onCollect={onCollect} />);
    await fireEvent.press(screen.getByRole('button', { name: strings.offline.collect }));
    expect(onCollect).toHaveBeenCalled();
  });

  it('keeps « Récolter » out of the scrolling report, however long the list of level-ups', async () => {
    const levelUps = Array.from({ length: 30 }, (_, index) => ({
      seed: 100 + index,
      generatorVersion: 2 as const,
      from: 0,
      to: 1,
    }));
    const onCollect = jest.fn();
    await render(<OfflineReturnModal report={report({ levelUps })} onCollect={onCollect} />);
    const scroll = screen.getByTestId('offline-report-scroll');
    // Several seeds can share a name: count the « joins your band » lines instead.
    const joined = new RegExp(`${strings.offline.levelUp('', 0, 1)}$`);
    expect(within(scroll).getAllByText(joined)).toHaveLength(levelUps.length);
    expect(within(scroll).queryByTestId('offline-collect')).toBeNull();
    await fireEvent.press(screen.getByTestId('offline-collect'));
    expect(onCollect).toHaveBeenCalled();
  });
});
