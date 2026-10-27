import { big, createNewGame, eq, step } from '@/engine';

import { MAX_STEP_MS, MIN_OFFLINE_MS } from './gameStore';
import { createFakeStore } from './testing/fakeStore';

describe('game store', () => {
  it('starts a new game when there is no save', () => {
    const { store } = createFakeStore();
    expect(store.getState().game).toEqual(createNewGame(2026));
    expect(store.getState().loadError).toBeNull();
  });

  it('restores the saved game', () => {
    const saved = { ...createNewGame(7), ofuda: 42 };
    const { store } = createFakeStore({ game: saved });
    expect(store.getState().game.ofuda).toBe(42);
  });

  it('sets a corrupted save aside and starts over, reporting the error', () => {
    const { store, deps } = createFakeStore({
      save: { ok: false, error: { reason: 'invalid-json', message: 'broken' } },
    });
    expect(deps.setAsideCorruptedSave).toHaveBeenCalled();
    expect(store.getState().loadError).toBe('broken');
    expect(store.getState().game.parade.wave).toBe(1);
  });

  it('queues the player inputs and hands them to the engine on the next tick', () => {
    const { store } = createFakeStore();
    store.getState().tap();
    store.getState().castTalisman('raijin');
    expect(store.getState().pendingInputs).toEqual([
      { type: 'tap' },
      { type: 'castTalisman', talisman: 'raijin' },
    ]);
    const before = store.getState().game;
    store.getState().tick(100);
    const expected = step(before, 100, [
      { type: 'tap' },
      { type: 'castTalisman', talisman: 'raijin' },
    ]);
    expect(store.getState().game).toEqual(expected.state);
    expect(store.getState().events).toEqual(expected.events);
    expect(store.getState().pendingInputs).toEqual([]);
    expect(store.getState().eventBatch).toBe(1);
  });

  it(`never applies more than ${MAX_STEP_MS} ms at once`, () => {
    const { store } = createFakeStore();
    const before = store.getState().game;
    store.getState().tick(60_000);
    expect(store.getState().game).toEqual(step(before, MAX_STEP_MS).state);
  });

  it('queues guardian decisions', () => {
    const { store } = createFakeStore();
    store.getState().engageGuardian();
    store.getState().fleeGuardian();
    store.getState().challengeGuardian();
    expect(store.getState().pendingInputs.map((input) => input.type)).toEqual([
      'engageGuardian',
      'fleeGuardian',
      'challengeGuardian',
    ]);
  });

  it('refuses a purchase the souls cannot pay, without touching the game', () => {
    const { store } = createFakeStore();
    const before = store.getState().game;
    expect(store.getState().buyUpgrade('blade', 1)).toEqual({
      ok: false,
      reason: 'not-enough-souls',
    });
    expect(store.getState().game).toBe(before);
  });

  it('buys an upgrade when the souls allow it', () => {
    const { store } = createFakeStore({ game: { ...createNewGame(1), souls: big(100) } });
    const result = store.getState().buyUpgrade('blade', 1);
    expect(result.ok).toBe(true);
    expect(store.getState().game.sanctuary.blade).toBe(1);
    expect(eq(store.getState().game.souls, 95)).toBe(true);
  });

  it('saves with the wall-clock time', () => {
    const { store, saves, clock } = createFakeStore();
    clock.now = 5_000_000;
    store.getState().save();
    expect(saves).toHaveLength(1);
    expect(saves[0].savedAt).toBe(5_000_000);
    expect(store.getState().savedAt).toBe(5_000_000);
    expect(eq(saves[0].state.souls, store.getState().game.souls)).toBe(true);
  });
});

describe('resume (offline return)', () => {
  it('does nothing after an absence shorter than a minute', () => {
    const { store, clock, saves } = createFakeStore();
    clock.now += MIN_OFFLINE_MS - 1;
    const before = store.getState().game;
    store.getState().resume();
    expect(store.getState().game).toBe(before);
    expect(store.getState().offlineReport).toBeNull();
    expect(saves).toHaveLength(0);
  });

  it('applies the absence, reports it and saves', () => {
    const { store, clock, saves } = createFakeStore({
      game: { ...createNewGame(2026), sanctuary: { ...createNewGame(2026).sanctuary, blade: 20 } },
    });
    clock.now += 2 * 3_600_000;
    const before = store.getState().game;
    store.getState().resume();
    const report = store.getState().offlineReport;
    expect(report?.durationMs).toBe(2 * 3_600_000);
    expect(report?.yokaiDefeated).toBeGreaterThan(0);
    expect(store.getState().game.parade.wave).toBeGreaterThan(before.parade.wave);
    expect(saves).toHaveLength(1);
    expect(store.getState().savedAt).toBe(clock.now);
    store.getState().dismissOfflineReport();
    expect(store.getState().offlineReport).toBeNull();
  });

  it('gives nothing when the clock went backwards', () => {
    const { store, clock } = createFakeStore();
    clock.now -= 3_600_000;
    const before = store.getState().game;
    store.getState().resume();
    expect(store.getState().game).toBe(before);
    expect(store.getState().offlineReport).toBeNull();
  });
});
