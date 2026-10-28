import { render, screen } from '@testing-library/react-native';

import { generate, GENERATOR_VERSION } from '@/engine';
import { SCENE_HEIGHT, SCENE_WIDTH, sceneLayout } from '@/render';
import type { EnemyView } from '@/state';

import { BATTLE_BACKDROPS } from '../shared/images';
import { BattleBackdrop } from './BattleBackdrop';

const LAYOUT = sceneLayout(SCENE_WIDTH, SCENE_HEIGHT);

const yokai: EnemyView = {
  kind: 'yokai',
  spec: generate(7, GENERATOR_VERSION),
  name: 'Kasa-obake',
  hpRatio: 1,
};
const guardian = (index: number, awakening = 0): EnemyView => ({
  kind: 'guardian',
  index,
  awakening,
  hpRatio: 1,
  engaged: false,
  timeLeftMs: 30_000,
  timeRatio: 1,
});

const renderBackdrop = (enemy: EnemyView, upcomingGuardian: number) =>
  render(<BattleBackdrop layout={LAYOUT} enemy={enemy} upcomingGuardian={upcomingGuardian} />);

describe('BattleBackdrop', () => {
  it("shows the parade's backdrop to an ordinary yōkai, the guardian's waiting hidden", async () => {
    await renderBackdrop(yokai, 3);
    expect(screen.getByTestId('backdrop-parade')).toHaveProp(
      'source',
      BATTLE_BACKDROPS.parade.source,
    );
    const waiting = screen.getByTestId('backdrop-guardian-3');
    expect(waiting).toHaveProp('source', BATTLE_BACKDROPS.guardians[3].source);
    expect(waiting).toHaveStyle({ opacity: 0 });
  });

  it("shows a guardian's own backdrop while it is on stage", async () => {
    await renderBackdrop(guardian(4), 4);
    const backdrop = screen.getByTestId('backdrop-guardian-4');
    expect(backdrop).toHaveProp('source', BATTLE_BACKDROPS.guardians[4].source);
    expect(backdrop).toHaveStyle({ opacity: 1 });
  });

  it('gives an awakened guardian the backdrop of its normal self', async () => {
    await renderBackdrop(guardian(0, 2), 0);
    expect(screen.getByTestId('backdrop-guardian-0')).toHaveStyle({ opacity: 1 });
  });

  it('covers the scene frame, its sides cropped', async () => {
    await renderBackdrop(yokai, 0);
    expect(screen.getByTestId('backdrop-parade')).toHaveStyle({
      top: 0,
      width: SCENE_HEIGHT,
      height: SCENE_HEIGHT,
      left: (SCENE_WIDTH - SCENE_HEIGHT) / 2,
    });
  });
});
