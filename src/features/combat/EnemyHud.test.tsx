import { render, screen } from '@testing-library/react-native';

import { EYES, GENERATOR_VERSION, ONI_SUFFIX, PALETTES, PARTS, SUFFIXES } from '@/engine';
import { strings } from '@/i18n';

import { EnemyHud } from './EnemyHud';

const longest = (names: readonly string[]) =>
  names.reduce((best, name) => (name.length > best.length ? name : best));

// Every name the generator can give (`[prefix-]Object-suffix`, see nameOf), and every awakened
// guardian: the longest of each must show in full.
const prefixes = [...EYES, ...PALETTES].flatMap(({ namePrefix }) =>
  namePrefix === undefined ? [] : [`${namePrefix}-`],
);
const yokaiNames = ['', ...prefixes].flatMap((prefix) =>
  PARTS[GENERATOR_VERSION].objects.flatMap(({ japanese }) =>
    [...SUFFIXES.map((suffix) => suffix.japanese), ONI_SUFFIX].map(
      (suffix) => `${prefix}${japanese}-${suffix}`,
    ),
  ),
);
const LONGEST_YOKAI = longest(yokaiNames);
const LONGEST_GUARDIAN = longest(strings.guardians.names.map(strings.guardians.awakened));

describe('EnemyHud', () => {
  it.each([LONGEST_YOKAI, LONGEST_GUARDIAN])(
    'shows « %s » in full, on two lines at most',
    async (name) => {
      await render(
        <EnemyHud name={name} wave={1000} hpRatio={0.5} secondsLeft={12} timeRatio={0.4} />,
      );
      const title = screen.getByTestId('enemy-name');
      expect(title).toHaveTextContent(name, { exact: true });
      expect(title).toHaveProp('numberOfLines', 2);
    },
  );

  it('shows the level and the HP of the enemy', async () => {
    await render(<EnemyHud name="Kasa-obake" wave={42} hpRatio={0.5} />);
    expect(screen.getByText(strings.combat.enemyLevel(42))).toBeOnTheScreen();
    expect(screen.getByLabelText(strings.combat.hpLabel('Kasa-obake'))).toBeOnTheScreen();
    expect(screen.queryByTestId('guardian-timer')).toBeNull();
  });
});
