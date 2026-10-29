import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BALANCE, type CombatEvent, formatNumber, GUARDIANS, guardianMaxHp } from '@/engine';
import { strings } from '@/i18n';
import {
  enemyView,
  nextGuardianView,
  paradeView,
  powerPerSecond,
  talismanViews,
  teamView,
  useGame,
  useGameStore,
} from '@/state';
import { colors, spacing, useHaptics, useReduceMotion, useSound } from '@/ui';

import { AwakeningBanner } from './AwakeningBanner';
import { BattleScene, type LastHit } from './BattleScene';
import { useCombatHaptics } from './combatHaptics';
import { useCombatSounds } from './combatSounds';
import { CombatHeader } from './CombatHeader';
import { GuardianCutIn } from './GuardianCutIn';
import { FarmingBanner } from './FarmingBanner';
import { PowerRow } from './PowerRow';
import { TalismanBar } from './TalismanBar';
import { useAwakeningAnnouncement } from './useAwakeningAnnouncement';
import { useCombatEffects } from './useCombatEffects';
import { useHeroPose } from './useHeroPose';

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
  const reduceMotion = useReduceMotion();
  const motion = reduceMotion ? 'reduced' : 'full';
  const effects = useCombatEffects(motion);
  const heroPose = useHeroPose();
  const haptics = useHaptics();
  const play = useSound();
  useCombatHaptics();
  useCombatSounds();
  const awakened = useAwakeningAnnouncement();
  const strike = () => {
    haptics('light');
    play('tap');
    actions.tap();
  };
  const parade = paradeView(game);
  const nextGuardian = nextGuardianView(game);
  const enemy = enemyView(game);
  const lastHit = useMemo(() => lastHitOf(events), [events]);
  const name = enemy.kind === 'yokai' ? enemy.name : guardianName(enemy.index, enemy.awakening);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <CombatHeader
        parade={parade}
        nextGuardian={nextGuardian}
        souls={formatNumber(game.souls)}
        ofuda={game.ofuda}
      />
      <View style={styles.sceneArea}>
        <BattleScene
          enemy={enemy}
          upcomingGuardian={nextGuardian.index}
          enemyName={name}
          wave={parade.waveInCycle}
          lastHit={lastHit}
          heroPose={heroPose}
          effects={effects}
          motion={motion}
          onTap={strike}
        />
        {awakened === null ? null : <AwakeningBanner level={awakened} />}
      </View>
      {parade.farming ? <FarmingBanner onChallenge={actions.challengeGuardian} /> : null}
      <PowerRow power={formatNumber(powerPerSecond(game))} team={teamView(game)} />
      <TalismanBar talismans={talismanViews(game)} onCast={actions.castTalisman} />
      <View style={styles.bottomGap} />
      {enemy.kind === 'guardian' && !enemy.engaged ? (
        <GuardianCutIn
          index={enemy.index}
          name={name}
          wave={parade.waveInCycle}
          hp={formatNumber(guardianMaxHp(parade.wave))}
          weakness={GUARDIANS[enemy.index].weakness}
          timeLimitSeconds={BALANCE.guardian.timeLimitMs / 1000}
          reduceMotion={reduceMotion}
          onEngage={actions.engageGuardian}
          onFlee={actions.fleeGuardian}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  sceneArea: { flex: 1, paddingTop: spacing[3] },
  bottomGap: { height: spacing[3] },
});
