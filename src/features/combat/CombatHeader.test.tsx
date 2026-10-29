import { render, screen } from '@testing-library/react-native';

import { createNewGame } from '@/engine';
import { strings } from '@/i18n';
import { nextGuardianView, type NextGuardianView, paradeView } from '@/state';
import { colors } from '@/ui';

import { OFUDA_IMAGE } from '../shared/images';
import { CombatHeader } from './CombatHeader';

const renderHeader = (nextGuardian: NextGuardianView) =>
  render(
    <CombatHeader
      parade={paradeView(createNewGame(1))}
      nextGuardian={nextGuardian}
      souls="12"
      ofuda={3}
    />,
  );

describe('CombatHeader', () => {
  it('shows the illustrated ofuda next to their count, spoken by the pill only', async () => {
    await renderHeader({ index: 1, revealed: false });
    expect(screen.getByTestId('ofuda-icon')).toHaveProp('source', OFUDA_IMAGE.source);
    expect(screen.getByLabelText(strings.combat.ofuda('3'))).toBeOnTheScreen();
  });

  it('shows an unknown next guardian as a silhouette whose label gives nothing away', async () => {
    await renderHeader({ index: 1, revealed: false });
    const thumbnail = screen.getByLabelText(strings.combat.nextGuardianUnknown);
    expect(thumbnail).toHaveProp('testID', 'next-guardian-silhouette');
    expect(thumbnail).toHaveProp('tintColor', colors.ink);
    expect(screen.queryByLabelText(new RegExp(strings.guardians.names[1]))).toBeNull();
  });

  it('shows a known next guardian in color, named in its label', async () => {
    await renderHeader({ index: 1, revealed: true });
    const thumbnail = screen.getByLabelText(
      strings.combat.nextGuardian(strings.guardians.names[1]),
    );
    expect(thumbnail).toHaveProp('testID', 'next-guardian-art');
    expect(thumbnail).not.toHaveProp('tintColor');
  });

  it('starts over at wave 1 of the next awakening level once Nurarihyon falls', async () => {
    const game = createNewGame(1);
    const awakened = {
      ...game,
      parade: { ...game.parade, wave: 1001, maxWave: 1001 },
      guardiansDefeated: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    await render(
      <CombatHeader
        parade={paradeView(awakened)}
        nextGuardian={nextGuardianView(awakened)}
        souls="12"
        ofuda={3}
      />,
    );
    expect(screen.getByText(strings.combat.parade(1, 2))).toBeOnTheScreen();
    expect(screen.getByText(strings.combat.wave(1), { exact: false })).toBeOnTheScreen();
    expect(
      screen.getByLabelText(strings.combat.nextGuardian(strings.guardians.names[0])),
    ).toBeOnTheScreen();
  });
});
