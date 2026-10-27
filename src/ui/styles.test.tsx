import { render, screen } from '@testing-library/react-native';

import { OutlinedText } from './OutlinedText';
import { bodyText, displayText, hardShadow, outline } from './styles';

describe('style helpers', () => {
  it('draw hard shadows without blur', () => {
    expect(hardShadow('card')).toEqual({ boxShadow: '0px 5px 0px #2B1D3F' });
    expect(hardShadow('button')).toEqual({ boxShadow: '0px 4px 0px #2B1D3F' });
  });

  it('outline with the ink color and the stroke tokens', () => {
    expect(outline('card')).toEqual({ borderWidth: 3, borderColor: '#2B1D3F' });
    expect(outline('control')).toEqual({ borderWidth: 2.5, borderColor: '#2B1D3F' });
  });

  it('use the two game fonts', () => {
    expect(displayText('2xl')).toEqual({
      fontFamily: 'MochiyPopOne',
      fontSize: 22,
      color: '#2B1D3F',
    });
    expect(bodyText('base', 800)).toEqual({
      fontFamily: 'MPLUSRounded1c-ExtraBold',
      fontSize: 14,
      color: '#2B1D3F',
    });
  });
});

describe('OutlinedText', () => {
  it('shows the text once to screen readers, in white', async () => {
    await render(<OutlinedText style={displayText('4xl')}>Festival</OutlinedText>);
    const visible = screen
      .getAllByText('Festival')
      .filter((node) => node.props.accessible !== false);
    expect(visible).toHaveLength(1);
    expect(visible[0]).toHaveStyle({ color: '#FFFFFF' });
  });
});
