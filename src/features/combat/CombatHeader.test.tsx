import { render, screen } from '@testing-library/react-native';

import { createNewGame } from '@/engine';
import { strings } from '@/i18n';
import { type NextGuardianView, paradeView } from '@/state';
import { colors } from '@/ui';

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
});
