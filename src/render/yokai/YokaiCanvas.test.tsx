import { render, screen } from '@testing-library/react-native';

import { generate } from '@/engine';

import { YokaiCanvas } from './YokaiCanvas';

describe('YokaiCanvas', () => {
  it('mounts an image with the given label and size', async () => {
    await render(
      <YokaiCanvas
        spec={generate(7)}
        size={120}
        accessibilityLabel="Hitotsume-Chōchin-obake"
        testID="canvas"
      />,
    );
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toHaveProp('accessibilityLabel', 'Hitotsume-Chōchin-obake');
    expect(canvas).toHaveStyle({ width: 120, height: 120 });
  });
});
