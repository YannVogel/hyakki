import { BALANCE, type KamidanaId } from '@/engine';
import { strings } from '@/i18n';
import { colors } from '@/ui';

const decimal = (value: number) => String(Math.round(value * 100) / 100).replace('.', ',');

type ValueKind = keyof typeof strings.kamidana.values;

const VALUE_KINDS: Record<KamidanaId, ValueKind> = {
  blessing: 'times',
  tenguEye: 'times',
  inariPalm: 'times',
  shikigamiPact: 'times',
  hourglass: 'seconds',
  riftEye: 'times',
  greaterTalismans: 'times',
  headStart: 'wave',
  sacredPurse: 'times',
  festivalFlame: 'bonusPercent',
  vigil: 'percent',
  yokaiCall: 'times',
};

/** An upgrade's value as the player reads it: ×1,5, 40 s, vague 26, +50 %, 70 %. */
export function kamidanaValue(upgrade: KamidanaId, effect: number): string {
  const kind = VALUE_KINDS[upgrade];
  const { values } = strings.kamidana;
  switch (kind) {
    case 'bonusPercent':
      return values.bonusPercent(decimal((effect - 1) * 100));
    case 'percent':
      return values.percent(decimal(effect * 100));
    default:
      return values[kind](decimal(effect));
  }
}

const { kamidana } = BALANCE;
const texts = strings.kamidana.upgrades;

/** What each level brings, from the balance constants (never hard-coded in the text). */
export const KAMIDANA_EFFECTS: Record<KamidanaId, string> = {
  blessing: texts.blessing.effect(decimal(kamidana.blessing.damageGrowth)),
  tenguEye: texts.tenguEye.effect(decimal(kamidana.tenguEye.critMultiplierPerLevel)),
  inariPalm: texts.inariPalm.effect(decimal(kamidana.inariPalm.tapGrowth)),
  shikigamiPact: texts.shikigamiPact.effect(decimal(kamidana.shikigamiPact.teamDamageGrowth)),
  hourglass: texts.hourglass.effect(decimal(kamidana.hourglass.extraMsPerLevel / 1000)),
  riftEye: texts.riftEye.effect(decimal(kamidana.riftEye.weaknessPerLevel)),
  greaterTalismans: texts.greaterTalismans.effect(
    decimal(kamidana.greaterTalismans.damageGrowth),
    decimal(kamidana.greaterTalismans.soulsBoostMsPerLevel / 1000),
  ),
  headStart: texts.headStart.effect(decimal(kamidana.headStart.wavesPerLevel)),
  sacredPurse: texts.sacredPurse.effect(decimal(kamidana.sacredPurse.soulsGrowth)),
  festivalFlame: texts.festivalFlame.effect(decimal(kamidana.festivalFlame.sparksPerLevel * 100)),
  vigil: texts.vigil.effect(decimal(kamidana.vigil.efficiencyPerLevel * 100)),
  yokaiCall: texts.yokaiCall.effect(decimal(kamidana.yokaiCall.captureGrowth)),
};

export const KAMIDANA_COLORS: Record<KamidanaId, string> = {
  blessing: colors.orange,
  tenguEye: colors.red,
  inariPalm: colors.pink,
  shikigamiPact: colors.sakura,
  hourglass: colors.sky,
  riftEye: colors.purple,
  greaterTalismans: colors.skyLight,
  headStart: colors.grass,
  sacredPurse: colors.yellow,
  festivalFlame: colors.sun,
  vigil: colors.skyDeep,
  yokaiCall: colors.grassDeep,
};

/** The three cards of the Kamidana, as chosen with Yann (#96). */
export const KAMIDANA_SECTIONS: readonly {
  readonly key: keyof typeof strings.kamidana.sections;
  readonly upgrades: readonly KamidanaId[];
}[] = [
  { key: 'combat', upgrades: ['blessing', 'tenguEye', 'inariPalm', 'shikigamiPact'] },
  { key: 'guardians', upgrades: ['hourglass', 'riftEye', 'greaterTalismans', 'headStart'] },
  { key: 'economy', upgrades: ['sacredPurse', 'festivalFlame', 'vigil', 'yokaiCall'] },
];
