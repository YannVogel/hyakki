import { generate } from '@/engine';

import { isGroup } from '../yokai/nodes';
import {
  ADAPTIVE_SAFE_ZONE,
  adaptiveForeground,
  appIcon,
  ICON_MASCOT_SEED,
  mascot,
} from './appIcon';

describe('app icon', () => {
  it('uses a real generated yōkai: a one-eyed paper lantern sticking its tongue out', () => {
    const spec = generate(ICON_MASCOT_SEED);
    expect(spec).toMatchObject({
      object: 'lantern',
      eyes: 'cyclops',
      mouth: 'tongue',
      palette: 'paper',
    });
  });

  it('centers the mascot where asked', () => {
    const { group } = mascot(0.5, 100, 100);
    expect(group).toEqual({ translateX: 50, translateY: 50, scale: 0.5 });
  });

  it('keeps the adaptive foreground inside the Android safe zone', () => {
    const [foreground] = adaptiveForeground().children;
    const scale = isGroup(foreground) ? (foreground.group.scale ?? 1) : 1;
    expect(scale).toBeLessThanOrEqual(ADAPTIVE_SAFE_ZONE);
  });

  it('draws still pictures (no animation left)', () => {
    const animated = (node: ReturnType<typeof appIcon>): boolean =>
      node.group.animation !== undefined ||
      node.children.some((child) => isGroup(child) && animated(child));
    expect(animated(appIcon())).toBe(false);
  });
});
