import { PROFILES } from './profiles';
import { runProfile } from './run';

describe('runProfile', () => {
  const regular = PROFILES.find((profile) => profile.id === 'trois-sessions');
  if (regular === undefined) {
    throw new Error('missing profile');
  }

  it('is deterministic', () => {
    expect(runProfile(regular, 2)).toEqual(runProfile(regular, 2));
  });

  it('takes one snapshot per session and only moves forward in time', () => {
    const { snapshots } = runProfile(regular, 3);
    expect(snapshots).toHaveLength(3 * regular.sessions.length);
    for (let i = 1; i < snapshots.length; i++) {
      expect(snapshots[i].realHours).toBeGreaterThan(snapshots[i - 1].realHours);
      expect(snapshots[i].activeMinutes).toBeGreaterThanOrEqual(snapshots[i - 1].activeMinutes);
    }
  });

  it('makes progress: the first guardian falls on day 1', () => {
    const { milestones } = runProfile(regular, 1);
    expect(milestones.map((milestone) => milestone.event)).toContain('gardien-1');
  });
});
