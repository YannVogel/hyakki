import { fireEvent, render, screen } from '@testing-library/react-native';

import { Slider } from './Slider';

const renderSlider = async (value: number, disabled = false) => {
  const onChange = jest.fn();
  await render(
    <Slider
      value={value}
      onChange={onChange}
      accessibilityLabel="Volume : Sons"
      disabled={disabled}
      testID="slider"
    />,
  );
  return onChange;
};

const swipe = (actionName: 'increment' | 'decrement') =>
  fireEvent(screen.getByTestId('slider'), 'accessibilityAction', { nativeEvent: { actionName } });

describe('Slider', () => {
  it('is an adjustable control that speaks its value in percent', async () => {
    await renderSlider(0.42);
    expect(screen.getByRole('adjustable', { name: 'Volume : Sons' })).toHaveProp(
      'accessibilityValue',
      { min: 0, max: 100, now: 42, text: '42 %' },
    );
  });

  it('moves by round tenths with a screen reader, never past its bounds', async () => {
    const onChange = await renderSlider(0.42);
    await swipe('increment');
    await swipe('decrement');
    expect(onChange.mock.calls).toEqual([[0.5], [0.3]]);
    onChange.mockClear();
    await screen.unmount();
    const atTop = await renderSlider(1);
    await swipe('increment');
    expect(atTop).toHaveBeenCalledWith(1);
  });

  it('follows the finger along the track', async () => {
    const onChange = await renderSlider(0);
    const slider = screen.getByTestId('slider');
    await fireEvent(slider, 'layout', { nativeEvent: { layout: { width: 200 } } });
    await fireEvent(slider, 'responderGrant', { nativeEvent: { locationX: 150 } });
    await fireEvent(slider, 'responderMove', { nativeEvent: { locationX: 260 } });
    expect(onChange.mock.calls).toEqual([[0.75], [1]]);
  });

  it('ignores everything while disabled', async () => {
    const onChange = await renderSlider(0.5, true);
    await swipe('increment');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('slider').props.onStartShouldSetResponder()).toBe(false);
  });
});
