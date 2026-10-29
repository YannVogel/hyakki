import { migrate, MIGRATIONS, MissingMigrationError, type RawState } from './index';

const bump =
  (to: number, extra: RawState): ((state: RawState) => RawState) =>
  (state) => ({ ...state, ...extra, schemaVersion: to });

describe('migrate', () => {
  it('applies the migrations in order up to the target version', () => {
    const migrations = { 1: bump(2, { gems: 0 }), 2: bump(3, { title: 'none' }) };
    expect(migrate({ schemaVersion: 1, souls: '1e3' }, 1, 3, migrations)).toEqual({
      schemaVersion: 3,
      souls: '1e3',
      gems: 0,
      title: 'none',
    });
  });

  it('does nothing when the state is already current', () => {
    const state = { schemaVersion: 2 };
    expect(migrate(state, 2, 2, {})).toBe(state);
  });

  it('fails with a typed error when a step is missing', () => {
    expect(() => migrate({ schemaVersion: 1 }, 1, 3, { 1: bump(2, {}) })).toThrow(
      MissingMigrationError,
    );
  });

  it('has one migration per published schema before the current one', () => {
    expect(Object.keys(MIGRATIONS)).toEqual(['1']);
  });
});
