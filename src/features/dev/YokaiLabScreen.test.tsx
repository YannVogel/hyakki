import { fireEvent, render, screen } from '@testing-library/react-native';

import { generate, nameOf } from '@/engine';
import { describeYokai } from '@/i18n';

import { YokaiLabScreen } from './YokaiLabScreen';

describe('YokaiLabScreen', () => {
  it('shows the yōkai of seed 2026 and the twelve next ones', async () => {
    await render(<YokaiLabScreen />);
    const spec = generate(2026);
    expect(screen.getByText(nameOf(spec))).toBeOnTheScreen();
    expect(screen.getByText(describeYokai(spec))).toBeOnTheScreen();
    expect(screen.getAllByTestId(/^yokai-tile-/)).toHaveLength(12);
    expect(screen.getByTestId('yokai-tile-2038')).toBeOnTheScreen();
  });

  it('switches to the seed typed in the field', async () => {
    await render(<YokaiLabScreen />);
    await fireEvent.changeText(screen.getByTestId('yokai-lab-seed'), '42');
    expect(screen.getByText(nameOf(generate(42)))).toBeOnTheScreen();
  });

  it('ignores a seed that is not a whole number', async () => {
    await render(<YokaiLabScreen />);
    await fireEvent.changeText(screen.getByTestId('yokai-lab-seed'), 'abc');
    expect(screen.getByText(nameOf(generate(2026)))).toBeOnTheScreen();
  });

  it('selects a yōkai of the sheet when tapped', async () => {
    await render(<YokaiLabScreen />);
    await fireEvent.press(screen.getByTestId('yokai-tile-2030'));
    expect(screen.getByLabelText(new RegExp(describeYokai(generate(2030))))).toBeOnTheScreen();
  });
});
