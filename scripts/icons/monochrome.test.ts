import { toMonochrome } from './monochrome';

describe('toMonochrome', () => {
  it('keeps light pixels as opaque white', () => {
    expect([...toMonochrome(Uint8Array.from([255, 200, 120, 255]))]).toEqual([255, 255, 255, 255]);
  });

  it('cuts the dark ink out', () => {
    expect(toMonochrome(Uint8Array.from([42, 26, 30, 255]))[3]).toBe(0);
  });

  it('keeps transparency transparent', () => {
    expect(toMonochrome(Uint8Array.from([255, 255, 255, 0]))[3]).toBe(0);
  });
});
