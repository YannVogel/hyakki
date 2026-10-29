import { fireEvent, screen } from '@testing-library/react-native';

import { big, createNewGame, festivalSparks, type GameState } from '@/engine';
import { strings } from '@/i18n';

import { FESTIVAL_HEADER } from '../shared/images';
import { renderScreen } from '../testing/renderScreen';
import { FestivalScreen } from './FestivalScreen';

const withRecord = (maxWave: number): GameState => {
  const state = createNewGame(4);
  return {
    ...state,
    parade: { ...state.parade, wave: maxWave, maxWave },
    souls: big(1e12),
    ofuda: 30,
    shikigami: [{ seed: 5, level: 3, generatorVersion: 1 }],
    team: [5],
    attackTimers: { hero: 0, team: [1000] },
    guardiansDefeated: [0, 1],
  };
};

describe('FestivalScreen', () => {
  it('shows the illustrated festival with the hero over it', async () => {
    await renderScreen(<FestivalScreen onDone={jest.fn()} />, withRecord(300));
    expect(screen.getByLabelText(strings.festival.sceneLabel)).toHaveProp(
      'source',
      FESTIVAL_HEADER.source,
    );
    expect(screen.getByLabelText(strings.festival.heroLabel)).toBeOnTheScreen();
  });

  it('tells the awakening level of the parade and of its record', async () => {
    const game = withRecord(1300);
    await renderScreen(<FestivalScreen onDone={jest.fn()} />, {
      ...game,
      parade: { ...game.parade, wave: 1050 },
    });
    expect(screen.getByText(strings.festival.status(1, 2, 50, 300, 2))).toBeOnTheScreen();
    expect(strings.festival.status(1, 2, 50, 300, 2)).toBe(
      'Défilé 1 · Éveil 2 · vague 50 · record : 300 (Éveil 2)',
    );
  });

  it('stays locked before the first guardian', async () => {
    await renderScreen(<FestivalScreen onDone={jest.fn()} />, withRecord(80));
    expect(screen.getByTestId('festival-locked')).toBeOnTheScreen();
    expect(screen.getByTestId('festival-start')).toBeDisabled();
  });

  it('shows the sparks to earn and the bonus before and after', async () => {
    await renderScreen(<FestivalScreen onDone={jest.fn()} />, withRecord(300));
    expect(screen.getByTestId('festival-sparks')).toHaveTextContent(
      strings.festival.sparks(String(festivalSparks(300))),
    );
    expect(screen.getByLabelText(strings.festival.bonusLabel('1,0', '2,8'))).toBeOnTheScreen();
  });

  it('never starts without a confirmation', async () => {
    const onDone = jest.fn();
    const { store } = await renderScreen(<FestivalScreen onDone={onDone} />, withRecord(300));
    await fireEvent.press(screen.getByTestId('festival-start'));
    expect(screen.getByTestId('festival-confirm')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('festival-confirm-no'));
    expect(store.getState().game.parade.number).toBe(1);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('resets the parade and keeps the collection once confirmed', async () => {
    const onDone = jest.fn();
    const { store } = await renderScreen(<FestivalScreen onDone={onDone} />, withRecord(300));
    await fireEvent.press(screen.getByTestId('festival-start'));
    await fireEvent.press(screen.getByTestId('festival-confirm-yes'));
    const game = store.getState().game;
    expect(game.parade).toMatchObject({ number: 2, wave: 1, maxWave: 1 });
    expect(game.sparks).toBe(festivalSparks(300));
    expect(game.shikigami).toEqual([{ seed: 5, level: 3, generatorVersion: 1 }]);
    expect(game.ofuda).toBe(30);
    expect(game.guardiansDefeated).toEqual([0, 1]);
    expect(onDone).toHaveBeenCalled();
  });

  it('goes back to the parade', async () => {
    const onDone = jest.fn();
    await renderScreen(<FestivalScreen onDone={onDone} />, withRecord(300));
    await fireEvent.press(screen.getByTestId('festival-keep-going'));
    expect(onDone).toHaveBeenCalled();
  });

  it('tells where the next parade starts with the Head Start', async () => {
    const game = withRecord(300);
    await renderScreen(<FestivalScreen onDone={jest.fn()} />, {
      ...game,
      kamidana: { ...game.kamidana, headStart: 2 },
    });
    expect(screen.getByTestId('festival-head-start')).toHaveTextContent(
      strings.festival.headStart(51),
    );
  });

  it('says nothing about a head start without the blessing', async () => {
    await renderScreen(<FestivalScreen onDone={jest.fn()} />, withRecord(300));
    expect(screen.queryByTestId('festival-head-start')).toBeNull();
  });
});
