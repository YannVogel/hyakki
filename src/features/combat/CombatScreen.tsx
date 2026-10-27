import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type CombatEvent, formatNumber } from '@/engine';
import { strings } from '@/i18n';
import {
  enemyView,
  paradeView,
  powerPerSecond,
  talismanViews,
  useGame,
  useGameStore,
} from '@/state';
import { colors, spacing } from '@/ui';

import { BattleScene, type LastHit } from './BattleScene';
import { CombatHeader } from './CombatHeader';
import { FarmingBanner, GuardianPanel } from './GuardianPanel';
import { PowerRow } from './PowerRow';
import { TalismanBar } from './TalismanBar';

function lastHitOf(events: readonly CombatEvent[]): LastHit | null {
  const hit = events.findLast((event) => event.type === 'hit');
  return hit?.type === 'hit' ? { damage: formatNumber(hit.damage), crit: hit.crit } : null;
}

export function guardianName(index: number, awakening: number): string {
  const name = strings.guardians.names[index];
  return awakening > 0 ? strings.guardians.awakened(name) : name;
}

/** The main screen: the parade advances on its own, a tap strikes, talismans on demand. */
export function CombatScreen() {
  const game = useGame((store) => store.game);
  const events = useGame((store) => store.events);
  const actions = useGameStore().getState();
  const parade = paradeView(game);
  const enemy = enemyView(game);
  const lastHit = useMemo(() => lastHitOf(events), [events]);
  const name = enemy.kind === 'yokai' ? enemy.name : guardianName(enemy.index, enemy.awakening);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <CombatHeader parade={parade} souls={formatNumber(game.souls)} ofuda={game.ofuda} />
      <View style={styles.sceneArea}>
        <BattleScene
          enemy={enemy}
          enemyName={name}
          wave={parade.wave}
          lastHit={lastHit}
          onTap={actions.tap}
        />
      </View>
      {enemy.kind === 'guardian' && !enemy.engaged ? (
        <GuardianPanel
          name={name}
          wave={parade.wave}
          onEngage={actions.engageGuardian}
          onFlee={actions.fleeGuardian}
        />
      ) : (
        <>
          {parade.farming ? <FarmingBanner onChallenge={actions.challengeGuardian} /> : null}
          <PowerRow power={formatNumber(powerPerSecond(game))} team={game.team} />
          <TalismanBar talismans={talismanViews(game)} onCast={actions.castTalisman} />
        </>
      )}
      <View style={styles.bottomGap} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  sceneArea: { flex: 1, paddingTop: spacing[3] },
  bottomGap: { height: spacing[3] },
});
